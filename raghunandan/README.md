# SPOODERMAN 🕷️

## Overview
A 2D arcade shooter game built in Python using Pygame. The player controls Spooderman along the bottom of the screen, shooting web projectiles to eliminate descending villains and earn score points, while carefully dodging enemies and avoiding hitting MJ.

## How to Run

1. Navigate to this directory:
```bash
cd raghunandan
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the game:
```bash
python spooderman.py
```

### Controls
- **Left / Right Arrow Keys**: Move Spooderman horizontally
- **Spacebar**: Shoot web projectiles

---

## What was challenging & What I would do differently

- **Challenges faced:** 
  - Managing entity lifecycles and collision detection across dynamic lists (`bullets`, `villains`, `mj`) without encountering mutation/iteration bugs during cleanup.
  - Balancing custom timer events (`pygame.USEREVENT`) and velocity parameters to ensure smooth, responsive gameplay.

- **What I would do differently / Next steps:**
  - Implement full sprite sheet animations and background audio using `pygame.mixer`.
  - Add high-score persistence using a local JSON file.
  - Compile the game with WebAssembly (`pygbag`) so reviewers can play it directly in their browser without manual setup.
