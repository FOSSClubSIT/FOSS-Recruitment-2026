import os
import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv('TOKEN')

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents, help_command=None)

@bot.event
async def on_ready():
    await bot.change_presence(status=discord.Status.online, activity=discord.Game(name="!help"))
    await bot.load_extension("cogs.maincog")
    await bot.tree.sync()
    print(f"Logged in as {bot.user.name}")

@bot.command()
async def ping(ctx):
    await ctx.send(f"Pong! {round(bot.latency*1000)}ms")

@bot.command()
@commands.is_owner()
async def reload(ctx: commands.Context):
    await bot.reload_extension("cogs.maincog")
    await ctx.send(f"Successfully reloaded cogs!")


bot.run(TOKEN)
