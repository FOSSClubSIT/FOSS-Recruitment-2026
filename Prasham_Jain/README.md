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


