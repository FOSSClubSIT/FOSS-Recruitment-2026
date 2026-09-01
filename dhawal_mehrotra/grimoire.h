#define PRECISION 1.0e-12
#define ITERATIONS 1.0e6
#define PIE 3.141592653589793
#define EULER 2.718281828459045
#define GAMMA 0.577215664901532

extern int GRIMOIRE_ERROR;

//constants forge
double sacred_pie();
double fractional_e(int k);
double eon_remnant(int l);


double origin_nroot(int n, double x); //V1: int n
int anchor(double x); //v1:
//Combinatorics suite
double stellar_factorial(int x); //v1: only positive integers
double abyssal_factorial(long int x); //v1: 2 Bernoulli terms error factor
unsigned long long int stellar_combinations(int n, int r);
unsigned long long int stellar_permutations(int n, int r);
double abyssal_combinations(long int n,long int r);
double abyssal_permutations(long int n,long int r);

//Trig Suite
double astral_sin(double x);
double astral_cos(double x);
double astral_tan(double x);
double astral_cot(double x);
double astral_sec(double x);
double astral_cosec(double x);

//Inverse Trig Suite (principal angles)
double arch_tan(double x);
double arch_cot(double x);
double arch_sin(double x);
double arch_cos(double x);
double arch_sec(double x);
double arch_cosec(double x);

//Exponential suite
double zenith(int n, double x); //v1: for loop
double eon_growth(double x);
double eon_log(double x);
double log_base(double x, double b);
double base_growth(double x, double b);