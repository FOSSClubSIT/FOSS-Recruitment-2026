#include "grimoire.h"
int GRIMOIRE_ERROR = 0;
static const double bernoulli_evens[] = {1.0/6.0, -1.0/30.0, 1.0/42.0, -1.0/30.0, 5.0/66.0};
//v1:
int anchor(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0;} 
    
    if (x < 0) {
        if ((int)x - x == 0) {return (int)x;}
        else { return ((int)x - 1); }
    }
    
    return (int)x; 
}
//v2: int n, without complex handling, with dynamic precision
double origin_nroot(int n, double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    double x_g = x/n;
    double abs_x = (x < 0) ? -x : x;
    double tolerance = (abs_x > 1.0) ? (PRECISION * abs_x) : PRECISION;

    for(int i = 0; ((x-zenith(n,x_g)) > tolerance || (x-zenith(n,x_g)) < -tolerance); i++)
    {
        if (i > ITERATIONS)
        {
            GRIMOIRE_ERROR = 701;
            return 0.0;
        }
        x_g = x_g - ((zenith(n,x_g)-x) / (n*zenith(n-1,x_g)));
    }
    return x_g;
}
//v1: only +ve integers, and for loop
double stellar_factorial(int x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x > 170) {GRIMOIRE_ERROR = 704; return 0.0;}
    if (x < 0) {GRIMOIRE_ERROR = 702; return 0.0;}
    if (x == 0) {return 1;}
    if (x == 1) {return 1;}
    double fact = 1;
    for (int i = 1; i <= x; i++)
    {
        fact *= i;
    }
    return fact;
}
//v1
unsigned long long int stellar_combinations(int n, int r)
{
    if (GRIMOIRE_ERROR != 0) { return 0; }
    
    if (n >= 62) { GRIMOIRE_ERROR = 704; return 0; } 
    if (n < 0 || r < 0 || r > n) { GRIMOIRE_ERROR = 702; return 0; }
    if (r == 0 || r == n) { return 1; }

    if (r > n - r) {r = n - r;}

    unsigned long long int result = 1;
    for (int i = 1; i <= r; i++) 
    {
        //check for memory overload
        if (n > 0 && result > 18446744073709551615ULL /n) {GRIMOIRE_ERROR = 704; return 0.0;}
        result *= n;
        result /= i;
        n--;
    }

    return result;
}
unsigned long long int stellar_permutations(int n, int r)
{
    if (GRIMOIRE_ERROR != 0) {return 0;}
    if (n >= 20) {GRIMOIRE_ERROR = 704; return 0;} 
    if (n < 0 || r < 0 || r > n) {GRIMOIRE_ERROR = 702; return 0;}
    if (r == 0) {return 1;}

    unsigned long long int result = 1;
    for (int i = 1; i <= r; i++)
    {
        result *= n;
        n--;
    }
    
    return result;
}
//v1: 2 Bernoulli terms error factor, x > 12
double abyssal_factorial(long int x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x <= 12) 
    {
        if (x < 0) {GRIMOIRE_ERROR = 702; return 0.0;}
        if (GRIMOIRE_ERROR != 0) {return 0.0;}
        else {return eon_log(stellar_factorial(x));}
    }
    double correction = (0.5*eon_log(2*PIE*x)) + (1.0/(12.0*x)) - (1.0/(360.0*x*x*x));
    double result = x*(eon_log(x) - 1);
    return (result + correction);
}
double abyssal_combinations(long int n,long int r)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (n < 0 || r < 0) {GRIMOIRE_ERROR = 702; return 0.0;}
    if (n < r) {GRIMOIRE_ERROR= 702; return 0.0;}
    if (r == 0 || r == n) {return 0.0;}
    return (abyssal_factorial(n) - (abyssal_factorial(r)+abyssal_factorial(n-r)));
}
//v1:
double abyssal_permutations(long int n,long int r)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (n < 0 || r < 0) {GRIMOIRE_ERROR = 702; return 0.0;}
    if (n < r) {GRIMOIRE_ERROR= 702; return 0.0;}
    if (r == 1) {return eon_log(n);}
    if (r == 0) {return 0.0;}
    return (abyssal_factorial(n) - abyssal_factorial(n-r));
}

//Trig Suite
//v2: With Horner's Polynomial and only radian
double astral_sin(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x > (2*PIE) || x < 0) //reducing to [0,2π]
    {
        int q = anchor(x/(2*PIE));
        x = x - q*2*PIE;
    } 
    int multiplier = 1;
    //mapping to [0, π/2]
    if ((x >= (PIE/2)) && (x <= PIE))
    {
        x = PIE - x;
        multiplier = 1;
    }
    else if ((x >= PIE) && (x <= ((3*PIE)/2)))
    {
        x = x - PIE;
        multiplier = -1;
    }
    else if ((x >= ((3*PIE)/2)) && (x <= (2*PIE)))
    {
        x = (2*PIE - x);
        multiplier = -1;
    }

    //handling x between [π/4, π/2]
    if ((x > (PIE/4)) && (x <= (PIE/2)))
    {return multiplier * astral_cos((PIE/2)-x);}
    
    double sinx = 1;
    for (int i = 10; i > 0; i--)
    {
        sinx = 1 - ((x*x)/(2*i*(2*i+1)))*sinx;
    }
    return x*sinx*multiplier;
}
//v2: With Horner's Polynomial and only radian
double astral_cos(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x > (2*PIE) || x < 0) //reducing to [0,2π]
    {
        int q = anchor(x/(2*PIE));
        x = x - q*2*PIE;
    } 
    int multiplier = 1;
    //mapping to [0, π/2]
    if ((x >= (PIE/2)) && (x <= PIE))
    {
        x = PIE - x;
        multiplier = -1;
    }
    else if ((x >= PIE) && (x <= ((3*PIE)/2)))
    {
        x = x - PIE;
        multiplier = -1;
    }
    else if ((x >= ((3*PIE)/2)) && (x < (2*PIE)))
    {
        x = (2*PIE - x);
        multiplier = 1;
    }
    //handling x between [π/4, π/2]
    if ((x > (PIE/4)) && (x <= (PIE/2)))
    {return multiplier * astral_sin((PIE/2)-x);}

    double cosx = 1;
    for (int i = 10; i > 0; i--)
    {
        cosx = 1 - ((x*x)/(2*i*(2*i-1)))*cosx;
    }
    return multiplier*cosx;
}
//v1
double astral_tan(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if ((astral_cos(x) <= PRECISION) && (astral_cos(x) > -PRECISION))
    {GRIMOIRE_ERROR = 703; return 0.0;}
    double tanx = astral_sin(x)/astral_cos(x);
    return tanx;
}
//v1
double astral_cot(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if ((astral_sin(x) <= PRECISION) && (astral_sin(x) > -PRECISION))
    {GRIMOIRE_ERROR = 703; return 0.0;}
    double cotx = astral_cos(x)/astral_sin(x);
    return cotx;
}
//v1
double astral_sec(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if ((astral_cos(x) <= PRECISION) && (astral_cos(x) > -PRECISION))
    {GRIMOIRE_ERROR = 703; return 0.0;}
    double secx = 1/astral_cos(x);
    return secx;
}
double astral_cosec(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if ((astral_sin(x) <= PRECISION) && (astral_sin(x) > -PRECISION))
    {GRIMOIRE_ERROR = 703; return 0.0;}
    double cosecx = 1/astral_sin(x);
    return cosecx;
}
//Inverse Trig Suite
//v1:
double arch_tan(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    double atan;
    if (x == 0) {return 0;}
    if (x < 0.5 && x > -0.5) {atan = 0;}
    else {atan = ((x > 0) ? (PIE/2 - 0.1) : -(PIE/2 - 0.1));}
    double tan_val;
    int i = 0;
    do
    {
        i++;

        tan_val = astral_tan(atan);
        if (GRIMOIRE_ERROR != 0) {return 0.0;}
        if (i > ITERATIONS) 
        {
            GRIMOIRE_ERROR = 701;
            return 0.0;
        }
        atan = atan - ((tan_val-x)/(1 + (tan_val*tan_val)));
    } while ((tan_val - x) > PRECISION || (x-tan_val) > PRECISION);
    return atan;
}
//v1
double arch_cot(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x == 0) {return PIE/2;}
    return (PIE/2 - arch_tan(x));
}
//v1
double arch_sin(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x > 1 || x < -1) {GRIMOIRE_ERROR = 702; return 0.0;}
    if (x == 1) {return PIE/2;}
    if (x == -1) {return PIE/2;}
    double root_val = origin_nroot(2, (1 - x*x));
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    double y = x / root_val;
    return arch_tan(y);
}
//v1
double arch_cos(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x > 1 || x < -1) {GRIMOIRE_ERROR = 702; return 0.0;}
    return ((PIE/2)-arch_sin(x));
}
//v1
double arch_sec(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x < 1 && x > -1) {GRIMOIRE_ERROR = 702; return 0.0;}
    return (arch_cos(1/x));
}
//v1
double arch_cosec(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if ((x <= 1 && x >= 0) || (x >= -1 && x < 0)) {GRIMOIRE_ERROR = 702; return 0.0;}
    return ((PIE/2)-arch_sec(x));
}
// The Constant's forge
//v1: Machin's Formula
double sacred_pie()
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    double pie = 4*(4*arch_tan(1.0/5) - arch_tan(1.0/239));
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    return pie;
}
//v1: continued fraction
double fractional_e(int k)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    int max = 30;
    int ak = 1;
    if ((k % 3) == 2) {ak = 2*(k+1)/3;}
    if (k == max) {return ak;}
    else
    {
        return (ak + (1.0/fractional_e(k+1)));
    }
}
//v1:
double eon_remnant(int l)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (l > 1e30) {GRIMOIRE_ERROR = 704; return 0.0;}
    double sum = 0;
    for (int i = 1; i <= l; i++)
    {
        sum += 1.0/i;
    }
    double g = sum - eon_log(l) - 1.0/(2*l);
    if (GRIMOIRE_ERROR != 0) {return 0;}
    for (int i = 1; i <= sizeof(bernoulli_evens)/sizeof(bernoulli_evens[0]); i++)
    {
        g += bernoulli_evens[i-1]/(2*i*zenith(2*i, l));
    }
    return g;
}
// powers suite
//v2: exponentiation by squaring
double zenith(int n, double x) 
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    double result = 1;
    while (n > 0)
    {
        if (n % 2 != 0) {result *= x;}
        x *= x;
        n /= 2;
    }
    return result;
}

//v1:
double eon_growth(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    // (Limits for e^x in 64-bit double space, calculated by taking the ln of max number for double)
    if (x > 709.78 || x < -745.13) 
    {
        GRIMOIRE_ERROR = 704; // Striking the Memory/Overflow Alarm
        return 0.0;
    }
    if (x == 0) {return 1;}
    int N = anchor(x);
    double m = x - N;
    double eN;
    if (N<0)
    {
        eN = 1.0/ zenith(-N,EULER);
    }
    else {eN = zenith(N,EULER);}
    double em = 1;
    for (int i = 15; i > 0; i--)
    {
        em = 1 + (m/i)*em;
    }
    return (eN*em);
}
//v2: optimized cycle runs using taylor series updations
double eon_log(double x)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x <= 0) {GRIMOIRE_ERROR = 702; return 0.0;}
    if (x == 1) {return 0;}
    //input reduction
    int count = 0;
    double xr = x;
    if (x < 1)
    {
        for (int i = 0; xr < 1; i++)
        {
            if (i == ITERATIONS) {GRIMOIRE_ERROR = 701; return 0.0;}
            xr = EULER*xr;
            count++;
        }
    }
    if (x > EULER)
    {
        for (int i = 0; xr > EULER; i++)
        {
            if (i == ITERATIONS) {GRIMOIRE_ERROR = 701; return 0.0;}
            xr = origin_nroot(2,xr);
            if (GRIMOIRE_ERROR != 0) {return 0.0;}
            count++;
        }
    }
    double N = (xr-1)/(EULER - 1);
    double exp_val = eon_growth(N);
    for (int i = 0; (exp_val - xr) > PRECISION || (exp_val - xr) < -PRECISION; i++)
    {
        if (i == ITERATIONS)
        {
            GRIMOIRE_ERROR = 701;
            return 0.0;
        }
        
        double delta = (2*(exp_val - xr))/(exp_val + xr);
        N = N - delta;
        
        double abs_delta = (delta < 0) ? -delta : delta;
        if (abs_delta > 0.2) 
        {
            exp_val = eon_growth(N);
        } 
        else 
        {
            double d2 = delta * delta;
            double d3 = d2 * delta;
            double d4 = d3 * delta;
            exp_val = exp_val * (1.0 - delta + (d2 / 2.0) - (d3 / 6.0) + (d4 / 24.0));
        }
    }
    if (x > 1) {return (zenith(count,2) * N);}
    else {return (N - count);}
}
double log_base(double x, double b)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if ((b - 1) < PRECISION && (b - 1) > -PRECISION) {GRIMOIRE_ERROR = 702; return 0.0;}
    if (b <= 0) {GRIMOIRE_ERROR = 702; return 0.0;}
    if (x <= 0) {GRIMOIRE_ERROR = 702; return 0.0;}
    
    double log_x = eon_log(x);
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    double log_b = eon_log(b);
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    return log_x / log_b;
}
double base_growth(double x, double b)
{
    if (GRIMOIRE_ERROR != 0) {return 0.0;}
    if ((x == 0) && (b == 0)) {GRIMOIRE_ERROR = 702; return 0.0;}
    if (x == 0) {return 1;}
    if ((b == 0 && x != 0 && x > 0)) {return 0;}
    if ((b == 0 && x != 0 && x < 0)) {GRIMOIRE_ERROR = 703; return 0.0;}
    if ((anchor(x) - x == 0) && x > 0) {return zenith(x,b);}
    if (x < 0) {return (1.0/base_growth(-x,b));}
    double p = eon_log(b);
    if ( GRIMOIRE_ERROR != 0) {return 0.0;}
    if (x * p > 709.78 || x * p < -745.13) {GRIMOIRE_ERROR = 704; return 0.0;}
    return (eon_growth(x*p));
}
