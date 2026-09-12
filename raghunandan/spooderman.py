import pygame
import random
import sys

pygame.init()
width=900
height=900
spooder_width=60
spooder_height=60
spooder_vel=7

x=width//2-spooder_width//2
y=height-spooder_height-20
player=pygame.Rect(x,y,spooder_width,spooder_height)
#png for spooderman     
#png for villians
#png for webs
#png for mj

bullets=[]
b_width=6
b_height=16
b_vel=10

villains=[]
v_width=50
v_height=50
v_vel=3

mj=[]
m_width=50
m_height=50
m_vel=10


spawn_villian=pygame.USEREVENT+1
pygame.time.set_timer(spawn_villian,1000)

spawn_mj=pygame.USEREVENT+2
pygame.time.set_timer(spawn_mj,random.randint(1500,5000))#i need mj to spawn only once and if she isnt saved my peter i.e(if she collides with sm then the game ends and u win, but if u miss game ends and then the msg displays)

score=0
font=pygame.font.SysFont("Comic Sans MS",28,bold=True)
game_over=False

win=pygame.display.set_mode((width,height))
pygame.display.set_caption("SPOODERMAN")
clock=pygame.time.Clock()
FPS=60
runnin=True
while runnin:
    clock.tick(FPS)
    for event in pygame.event.get():
        if event.type==pygame.QUIT:
            runnin=False
        if event.type==pygame.KEYDOWN:
            if event.key==pygame.K_SPACE:
                new_bullet=pygame.Rect(player.centerx-b_width//2,player.top,b_width,b_height)
                bullets.append(new_bullet)
        if event.type==spawn_villian:
            rand_x=random.randint(0,width-v_width)
            new_villan=pygame.Rect(rand_x,-v_height,v_width,v_height)
            villains.append(new_villan)
        if event.type==spawn_mj:
            rand_mj=random.randint(0,width-m_width)
            new_mj=pygame.Rect(rand_mj,-m_height,m_width,m_height)
            mj.append(new_mj)
    if not game_over:
        keys=pygame.key.get_pressed()
        if keys[pygame.K_LEFT or pygame.K_A]:
            player.x-=spooder_vel
        if keys[pygame.K_RIGHT or pygame.K_D]:
                player.x+=spooder_vel
        if player.left<0:
            player.left=0
        if player.right>width:
            player.right=width
        for i in bullets[:]:
            i.y-=b_vel
            if i.bottom<0:
                bullets.remove(i)
        for v in villains[:]:
            v.y+=v_vel
            if v.top>height:
                villains.remove(v)
        for m in mj[:]:
            m.y+=m_vel
            if m.top>height:
                mj.remove(m)
        for b in bullets[:]:
            for m in mj[:]:
                if b.colliderect(m) :
                    game_over=True
                    break
            for v in villains[:]:
                if b.colliderect(v):
                    if b in bullets:
                        bullets.remove(b)
                    
                    if v in villains:
                        villains.remove(v)
                    score+=1
                    break
        for v in villains:
            if player.colliderect(v):
                game_over=True
        '''for m in mj:#if mj collides with spiderman ,game ends
            if player.colliderect(m):
                game_over=True'''
    win.fill((30,30,40))  
    pygame.draw.rect(win,(220,20,60),player)
    for i in bullets:
        pygame.draw.rect(win,(240,240,255),i)
    for v in villains:
        pygame.draw.rect(win,(50,205,50),v)
    for m in mj:
        pygame.draw.rect(win,(255,193,203),m)
    
    score_txt=font.render(f"score:{score}",True,(255,255,255))
    win.blit(score_txt,(15,15))
    if game_over:
        game_over_font=pygame.font.SysFont("Comic Sans MS",36,bold=True)
        game_over_txt=game_over_font.render("PACK IT UP BRO,U MISSED HER AGAIN!!",True,(255,50,50))
        txt_rect=game_over_txt.get_rect(center=(width//2,height//2))
        win.blit(game_over_txt,txt_rect)
    pygame.display.flip()      
pygame.quit()
sys.exit()