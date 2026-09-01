#include <stdio.h>
#include "grimoire.h"

void assess_engine(const char* label, double result, int is_int) 
{
    if (GRIMOIRE_ERROR != 0) 
    {
        // The engine failed! Print the dummy 0 and the exact error code.
        if (is_int) {printf("%s = 0", label);} 
        else {printf("%s = 0.000000", label);}
        
        if (GRIMOIRE_ERROR == 701) 
        {
            printf("  [ERROR: Max iterations reached, without precision]\n");
        } 
        else if (GRIMOIRE_ERROR == 702) 
        {
            printf("  [ERROR: Domain error]\n");
        } 
        else if (GRIMOIRE_ERROR == 703) 
        {
            printf("  [ERROR: Div by 0 error]\n");
        } 
        else if (GRIMOIRE_ERROR == 704)
        {
            printf("  [ERROR: Memory Overload Prediction]\n");
        }
        else 
        {
            printf("  [ERROR: Unknown Anomaly %d]\n", GRIMOIRE_ERROR);
        }
        GRIMOIRE_ERROR = 0; 
    } 
    else
    {
        // The engine succeeded! Print the pure math.
        if (is_int) 
        {
            printf("%s = %d\n", label, (int)result);
        } 
        else 
        {
            printf("%s = %.10f\n", label, result);
        }
    }
}

// Macros to keep the test calls elegant and single-line
#define TEST_FLT(label, expression) do { GRIMOIRE_ERROR = 0; double res = (expression); assess_engine(label, res, 0); } while(0)
#define TEST_INT(label, expression) do { GRIMOIRE_ERROR = 0; double res = (double)(expression); assess_engine(label, res, 1); } while(0)


int main() 
{
    printf("=== CODEX-ARITHMETICA DIAGNOSTICS ===\n\n");
    
    TEST_INT("Floor Test1: floor(5)", anchor(5.0));
    TEST_INT("Floor Test2: floor(5.689)", anchor(5.689));
    TEST_INT("Floor Test3: floor(0)", anchor(0));
    TEST_INT("Floor Test4: floor(-3)", anchor(-3));
    TEST_INT("Floor Test5: floor(-3.141)", anchor(-3.141));
    printf("\n");
    TEST_FLT("Root Test: Sqrt(25)", origin_nroot(2, 25.0));
    TEST_FLT("Root Test 1: sqrt(144)", origin_nroot(2, 144.0));
    TEST_FLT("Root Test 2: cbrt(-8)", origin_nroot(3, -8.0));
    TEST_FLT("Root Test 3: 4th-root(0.0625)", origin_nroot(4, 0.0625));
    TEST_FLT("Root Test 4: 5th-root(243)", origin_nroot(5, 243.0));
    TEST_FLT("Chaos Test: sqrt(-1)", origin_nroot(2, -1.0));
    printf("\n");
    TEST_FLT("Zenith Test 1: 2^8", zenith(8, 2.0));
    TEST_FLT("Zenith Test 2: 7^0", zenith(0, 7.0));
    TEST_FLT("Zenith Test 3: (-2)^3", zenith(3, -2.0));
    TEST_FLT("Zenith Test 4: (-2)^4", zenith(4, -2.0));
    TEST_FLT("Zenith Test 5: 1.5^2", zenith(2, 1.5));
    TEST_FLT("Chaos Test: 10^-5", zenith(-5, 10.0));

    printf("\n--- Combinatoric Engine ---\n");
    TEST_FLT("Factorial Test1: 5!", stellar_factorial(5));
    TEST_FLT("Factorial Test2: 0!", stellar_factorial(0));
    TEST_FLT("Factorial Test3: 1!", stellar_factorial(1));
    TEST_FLT("Factorial Test 4: 7!", stellar_factorial(7));
    TEST_FLT("Factorial Test 5: 12!", stellar_factorial(12));
    TEST_FLT("Factorial Test 6: 25!", stellar_factorial(25));
    TEST_FLT("Stellar Chaos 1: 171!", stellar_factorial(171));
    TEST_FLT("Stellar Chaos 2: -1!", stellar_factorial(-1));
    printf("\n");
    TEST_FLT("Log Factorial Test1: ln(0!)", abyssal_factorial(0));
    TEST_FLT("Log Factorial Test2: ln(-5!)", abyssal_factorial(-5));
    TEST_FLT("Log Factorial Test3: ln(12!)", abyssal_factorial(12));
    TEST_FLT("Log Factorial Test4: ln(13!)", abyssal_factorial(13));
    TEST_FLT("Log Factorial Test5: ln(100!)", abyssal_factorial(100));
    TEST_FLT("Abyssal Chaos 1: ln(-1!)", abyssal_factorial(-1));
    TEST_FLT("Abyssal Chaos 2: ln(-1000!)", abyssal_factorial(-1000));
    printf("\n");
    TEST_INT("nCr Test 1: 10C8", stellar_combinations(10, 8));
    TEST_INT("nCr Test 2: 20C10", stellar_combinations(20, 10));
    TEST_INT("nCr Test 3: 5C8", stellar_combinations(5, 8));
    TEST_INT("nCr Test 4: 65C3", stellar_combinations(65, 3));
    TEST_INT("nCr Test 5: 5C0", stellar_combinations(5, 0));
    printf("\n");
    TEST_INT("nPr Test 1: 5P3", stellar_permutations(5, 3));
    TEST_INT("nPr Test 2: 5P5", stellar_permutations(5, 5));
    TEST_INT("nPr Test 3: 10P0", stellar_permutations(10, 0));
    TEST_INT("nPr Test 4: 5P8", stellar_permutations(5, 8));
    TEST_INT("nPr Test 5: 25P3", stellar_permutations(25, 3));
    printf("\n");
    TEST_FLT("Log nCr 1: 10C8", abyssal_combinations(10, 8));
    TEST_FLT("Log nCr 2: 150C0", abyssal_combinations(150, 0));
    TEST_FLT("Log nCr 3: 150C150", abyssal_combinations(150, 150));
    TEST_FLT("Log nCr 4: 5C8", abyssal_combinations(5, 8));
    TEST_FLT("Log nCr 5: 100C50", abyssal_combinations(100, 50));
    TEST_FLT("Log nCr 6: 10000C5000", abyssal_combinations(10000, 5000));
    TEST_FLT("Log nCr 7: 10000C5000", abyssal_combinations(10000, 5000));
    printf("\n");
    TEST_FLT("Log nPr 1: 10P3", abyssal_permutations(10, 3));
    TEST_FLT("Log nPr 2: 150P0", abyssal_permutations(150, 0));
    TEST_FLT("Log nPr 3: 150P1", abyssal_permutations(150, 1));
    TEST_FLT("Log nPr 4: 5P8", abyssal_permutations(5, 8));
    TEST_FLT("Log nPr 5: 150P150", abyssal_permutations(150, 150));
    TEST_FLT("Log nPr 6: 10000P9999", abyssal_permutations(10000, 9999));

    TEST_FLT("Sin (0)", astral_sin(0));
    TEST_FLT("Sin (pi/6)", astral_sin(PIE/6.0));
    TEST_FLT("Sin (pi/2)", astral_sin(PIE/2.0));
    TEST_FLT("Sin (pi)", astral_sin(PIE));
    TEST_FLT("Sin (3pi/2)", astral_sin(1.5 * PIE));
    TEST_FLT("Sin (7.85)", astral_sin(7.85398)); 
    TEST_FLT("Sin (-pi/3)", astral_sin(-PIE/3.0));

    printf("\n");
    TEST_FLT("Cos (0)", astral_cos(0));
    TEST_FLT("Cos (pi/6)", astral_cos(PIE/6.0));
    TEST_FLT("Cos (pi/2)", astral_cos(PIE/2.0));
    TEST_FLT("Cos (pi)", astral_cos(PIE));
    TEST_FLT("Cos (3pi/2)", astral_cos(1.5 * PIE));
    TEST_FLT("Cos (12.33)", astral_cos(12.3325)); 
    TEST_FLT("Cos (-pi/3)", astral_cos(-PIE/3.0));

    printf("\n--- Section II: The Ratios (Tan & Cot) ---\n");
    TEST_FLT("Tan (0)", astral_tan(0));
    TEST_FLT("Tan (pi/4)", astral_tan(PIE/4.0));
    TEST_FLT("Tan (pi)", astral_tan(PIE));
    TEST_FLT("Tan (-pi/3)", astral_tan(-PIE/3.0));

    printf("\n");
    TEST_FLT("Cot (pi/4)", astral_cot(PIE/4.0));
    TEST_FLT("Cot (pi/2)", astral_cot(PIE/2.0));
    TEST_FLT("Cot (3pi/4)", astral_cot(0.75 * PIE));
    TEST_FLT("Cot (pi)", astral_cot(PIE)); 

    printf("\n--- Section III: The Reciprocals (Sec & Csc) ---\n");
    TEST_FLT("Sec (0)", astral_sec(0));
    TEST_FLT("Sec (pi/4)", astral_sec(PIE/4.0));
    TEST_FLT("Sec (pi)", astral_sec(PIE));
    TEST_FLT("Sec (pi/2)", astral_sec(PIE/2.0));

    printf("\n");
    TEST_FLT("Csc (pi/2)", astral_cosec(PIE/2.0));
    TEST_FLT("Csc (pi/6)", astral_cosec(PIE/6.0));
    TEST_FLT("Csc (3pi/2)", astral_cosec(1.5 * PIE));
    TEST_FLT("Csc (0)", astral_cosec(0));

    printf("\n--- Section IV: The Inverse Origins (ArcSin & ArcCos) ---\n");
    TEST_FLT("ArcSin (0)  ", arch_sin(0));
    TEST_FLT("ArcSin (0.5)", arch_sin(0.5));
    TEST_FLT("ArcSin (1)  ", arch_sin(1));
    TEST_FLT("ArcSin (-1) ", arch_sin(-1));

    printf("\n");
    TEST_FLT("ArcCos (0)  ", arch_cos(0));
    TEST_FLT("ArcCos (0.5)", arch_cos(0.5));
    TEST_FLT("ArcCos (1)  ", arch_cos(1));
    TEST_FLT("ArcCos (-1) ", arch_cos(-1));

    printf("\n--- Section V: The Infinite Inverses (ArcTan & ArcCot) ---\n");
    TEST_FLT("ArcTan (0)  ", arch_tan(0));
    TEST_FLT("ArcTan (1)  ", arch_tan(1));
    TEST_FLT("ArcTan (-1) ", arch_tan(-1));
    TEST_FLT("ArcTan (1k) ", arch_tan(1000.0));

    printf("\n");
    TEST_FLT("ArcCot (0)  ", arch_cot(0));
    TEST_FLT("ArcCot (1)  ", arch_cot(1));
    TEST_FLT("ArcCot (-1) ", arch_cot(-1));
    TEST_FLT("ArcCot (1k) ", arch_cot(1000.0));

    printf("\n--- Section VI: The Bound Inverses (ArcSec & ArcCsc) ---\n");
    TEST_FLT("ArcSec (1)  ", arch_sec(1));
    TEST_FLT("ArcSec (-1) ", arch_sec(-1));
    TEST_FLT("ArcSec (2)  ", arch_sec(2));

    printf("\n");
    TEST_FLT("ArcCsc (1)  ", arch_cosec(1));
    TEST_FLT("ArcCsc (-1) ", arch_cosec(-1));
    TEST_FLT("ArcCsc (2)  ", arch_cosec(2));

    printf("\n=== THE CHAOS PROTOCOL (STRESS TESTS) ===\n\n");
    TEST_FLT("Chaos Test 1 (ArcSin Overload: 2.5)", arch_sin(2.5));
    TEST_FLT("Chaos Test 2 (ArcCos Underload: -10.0)", arch_cos(-10.0));
    TEST_FLT("Chaos Test 3 (ArcSec Deadzone: 0.5)", arch_sec(0.5));
    TEST_FLT("Chaos Test 4 (ArcCsc Singularity: 0.0)", arch_cosec(0.0));
    TEST_FLT("Chaos Test 5 (ArcCos Edge Skim: 1.0000001)", arch_cos(1.0000001));
    TEST_FLT("Chaos Test 6 (ArcSin Edge Skim: -1.0000001)", arch_sin(-1.0000001));
    TEST_FLT("Chaos Test 7 (ArcTan Leviathan: 1.0e15)", arch_tan(1.0e15));

    printf("\n--- Exponential Test ---\n");
    TEST_FLT("Exp Test1 (0)", eon_growth(0));
    TEST_FLT("Exp Test2 (1)", eon_growth(1));
    TEST_FLT("Exp Test3 (-1)", eon_growth(-1));
    TEST_FLT("Exp Test4 (2.5)", eon_growth(2.5));
    TEST_FLT("Exp Test5: e^-0.5", eon_growth(-0.5));
    TEST_FLT("Chaos Test 1: e^1000", eon_growth(1000.0));
    TEST_FLT("Chaos Test 2: e^-1000", eon_growth(-1000.0));

    printf("\n--- Logarithm Test ---\n");
    TEST_FLT("Ln test1 (0)", eon_log(0));
    TEST_FLT("Ln test2 (2.71828)", eon_log(2.71828));
    TEST_FLT("Ln test3 (10^6)", eon_log(1.0e6));
    TEST_FLT("Ln test4 (-13)", eon_log(-13));
    TEST_FLT("Chaos Test 1: ln(1.0e-25)", eon_log(1.0e-25));
    TEST_FLT("Chaos Test 2: ln(1.0e60)", eon_log(1.0e60));

    printf("\n--- Base Growth Test ---\n");
    TEST_FLT("a^b test1 (2^3)", base_growth(3,2));
    TEST_FLT("a^b test2 (4^0.5)", base_growth(0.5, 4));
    TEST_FLT("a^b test3 (-2^-3)", base_growth(-3,-2));
    TEST_FLT("a^b test4 (0^0)", base_growth(0,0));
    TEST_FLT("a^b test5 (-5^0)", base_growth(0,-5));
    TEST_FLT("a^b test6 (-4^0.5)", base_growth(0.5,-4));

    printf("\n--- Constants Forge ---\n");
    TEST_FLT("Pie by Machin's formula", sacred_pie());
    printf("  -> Original Pie: 3.141592653589793\n");
    
    TEST_FLT("e by me", (2 + 1.0/fractional_e(1))); 
    printf("  -> Original e  : 2.718281828459045\n");
    
    TEST_FLT("Gamma (Euler's constant) by me", eon_remnant(50));
    printf("  -> Original Gam: 0.577215664901532\n");

    printf("\n=====================================\n");
    return 0;
}