from discord.ext import commands
from discord import app_commands
import discord
import asyncio
import random
import math

gameData = {}

class MainCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="help")
    async def help(self, ctx):
        embed = discord.Embed(title="Welcome to The Underboss!", description="A crime simulation gamebot where you run your own crime syndicate")
        embed.add_field(name="`!start`", value = "Start your own gang")
        embed.add_field(name="`!stats`", value = "Shows your balance and manpower")
        embed.add_field(name="`!mug`", value = "Starts a mugging minigame")
        embed.add_field(name="`!extort`", value = "Extorts a local shop (pay increases with manpower)")
        embed.add_field(name="`!recruit`", value = "Recruits members, each member costs $500")
        await ctx.send(embed=embed)

    @commands.command(name="start")
    async def start(self, ctx, gangster_name: str = None, gang_name: str = None):
        if gangster_name == None or gang_name == None:
            return await ctx.send('Use proper syntax: `!start "gangster name" "gang name>"`')
        gameData[ctx.author.id] = {"gang": gang_name, "cash" : 10000, "muscle": 1}
        print(gameData)
        await ctx.send(f"Don {gangster_name} sends his regards from {gang_name}.")

    @commands.command(name="mug")
    async def mug(self, ctx):
        if ctx.author.id not in gameData:
            return await ctx.send("You do not have a gang yet, try `!start`")
        msg = await ctx.reply("Wait for the target to look away...")
        await asyncio.sleep(random.randint(2,6))
        await msg.edit(content="🚨 GO! REACT NOW!")
        await msg.add_reaction("👛")

        def check(reaction, user):
            return user == ctx.author and reaction.message.id == msg.id and str(reaction.emoji) == "👛"
        
        try:
            reaction, user = await self.bot.wait_for('reaction_add', timeout=2.0, check=check)
        except asyncio.TimeoutError:
            penalty = random.randint(6,10)*100
            gameData[ctx.author.id]["cash"] -= penalty
            await ctx.send(f"You weren't fast enough, you got caught and had to pay ${penalty} as penalty")
        else:
            earned = random.randint(50,150)
            gameData[ctx.author.id]["cash"] += earned
            await ctx.send(f"You successfully stole ${earned}")


    @commands.command(name="stats")
    async def stats(self, ctx):
        if ctx.author.id not in gameData:
            return await ctx.send("You do not have a gang yet, try `!start`")

        await ctx.send(f"Your current balance is ${gameData[ctx.author.id]["cash"]} and your member count is {gameData[ctx.author.id]["muscle"]}")

    @commands.command(name="extort")
    async def extort(self, ctx):
        if ctx.author.id not in gameData:
            return await ctx.send("You do not have a gang yet, try `!start`")

        if random.randint(1,3) == 1:
            muscle_count = gameData[ctx.author.id]["muscle"]

            base_pay = random.randint(50, 150)
            muscle_pay = muscle_count * random.randint(20, 35)

            pay = base_pay + muscle_pay
            muscle_bonus = int(math.sqrt(gameData[ctx.author.id]["muscle"]) * 20)
            gameData[ctx.author.id]["cash"] += pay
            await ctx.send(f"The shopkeeper agreed to pay ${pay} as protection money")
        else:
            await ctx.send("The shopkeeper refused to pay protection money.")

    @commands.command(name="recruit")
    async def recruit(self, ctx, count: int = None):
        if ctx.author.id not in gameData:
            return await ctx.send("You do not have a gang yet, try `!start`")
        if count in [None,0]:
            return await ctx.send("Use proper syntax: `!recruit <count>`")
        if count*500>gameData[ctx.author.id]["cash"]:
            return await ctx.send("You do not have enough cash to recruit these many members. Each member costs $500")
        gameData[ctx.author.id]["muscle"] += count
        gameData[ctx.author.id]["cash"] -= count*500
        await ctx.send(f"You successfully recruited {count} members")

async def setup(bot):
    await bot.add_cog(MainCog(bot))