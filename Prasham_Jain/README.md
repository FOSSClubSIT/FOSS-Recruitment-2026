# Conway's Game of Life (C)
A terminal implementation of Conway's Game of Life, written in C.
---

### Build
```shell
gcc -Wall -Wextra -O2 -o game main.c
```

### Run
```shell
./game                          # random soup, default size/speed
./game -w 100 -h 50             # custom grid size
./game -s 100                   # custom speed (ms per generation)
./game --file samples/pulsar.txt        # load a pattern from a file (size is derived from the file, -w and -h are ignored)
```
For file, `.` denotes dead cell, anything else is alive.
Few files included: `pulsar.txt`, `glider.txt`, `gospel.txt` in `samples/`

### Things I know are broken or stupid
- Error handling is...not so great.
- width and height are limited, due to terminal space, not dynamic, hard coded.
- loading from file disables `-w` and `-h`.
- Works on linux. It _should_ work on macintosh. Surely not in windows, this requires POSIX-compatible environment. Would work on windows with wsl tho.
- It simply ignores invalid/unknown/not-needed args.

### What was hard..
Handling input was hard and is still incomplete or broken, works for general cases though.

### Some Background on Conway's GOL
Conway's Game of Life is a zero-player simulation created by British mathematician John Horton Conway in 1970.

- Played on an infinite, two-dimensional grid of square cells. Here I use Toroidal wrapping.
- Each cell has two possible states: alive or dead.

#### Rules
- Underpopulation: A live cell with fewer than two live neighbors dies.
- Survival: A live cell with two or three live neighbors stays alive.
- Overpopulation: A live cell with more than three live neighbors dies.
- Reproduction: A dead cell with exactly three live neighbors becomes a live cell.
