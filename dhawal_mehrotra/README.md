# Codex-Arithmetica

**What it does:**

Codex-Arithmetica is a custom, bare-metal mathematical engine built entirely from scratch in C, as an alternative for the standard system libraries like `<math.h>`. It evaluates advanced numerical methods, and combinatorics through optimized algorithmic architectures (such as the Newton-Raphson Method and Taylor Series). By structuring the mathematics from the ground up, it safely navigates extreme boundaries and also has a silent global alarm system which catches crashes, provides a reason for the crash, and returns a harmless, silent zero.

**How to run it:**
To run the comprehensive diagnostic test suite, open your terminal in this directory and use the provided `Makefile`:

``` bash
make run
```
The above command runs the `test_grim.c file`, which contains a comprehensive tests for the functions in the Grimoire library. ***Please Make sure all the files are in the same folder***

If you prefer to compile the engine manually without the Makefile, execute the following, while including the `grimoire.h` file in your file:

``` bash
gcc your_file_name.c grimoire.c -o object_file_name
./object_file_name
```

**What I found challenging & What I would do differently:**

The challenging part while making this project was handling the floating point errors, while implementing the loops for the Taylor polynomials and other approximations. The hardest part was to get sin (0) = 0.0000 instead of 0.0124 without hardcoding the known values. If I were to do this project differently, I would try find out a new way or a better way to implement the global alarm system, because right now, to know the reason for the crash and to try to catch a crash, the function/s have to check the global alarm variable increasing the execution time a bit, and making the code a bit messy. I would love to implement a better way to catch the error codes and raise the proper error message. Moreover, I would like to explore the boundary of precision and accuracy of my functions, especially the "stellar" combinatorics suite, by implementing string methods to bypass the memory limits of the numeric datatypes in C. 

**Check out my project Repository for proper guidelines on how to check the alarm variable, and the proper syntax for the functions:** [https://github.com/Quantum-Quill-314/Codex-Arithmetica]
