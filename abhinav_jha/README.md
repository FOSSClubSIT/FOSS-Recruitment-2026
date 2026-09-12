# DungeonRun

DungeonRun is a terminal-based roguelike game written in C++. The player explores a dungeon, fights randomly generated enemies, collects gold and potions, gains experience, levels up, and eventually challenges the Ancient Dragon.

## How to Run

### Requirements

- C++ compiler supporting C++11 or newer

### Compile
## What I Found Difficult

The hardest part was managing the different game states, such as combat, exploring rooms, collecting items, and keeping track of the player's health and inventory. I also had to make sure random events did not make the game behave unexpectedly.

## What I Would Do Differently

If I had more time, I would add more enemy types, more items and abilities, save/load functionality, and a larger dungeon system. I would also split the code into multiple files to make the project easier to maintain as it grows.
```bash
g++ main.cpp -o DungeonRun