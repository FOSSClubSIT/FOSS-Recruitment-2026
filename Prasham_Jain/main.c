#include <errno.h>
#include <signal.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#define MIN_WIDTH 15
#define MIN_HEIGHT 15
#define MAX_WIDTH 150
#define MAX_HEIGHT 100
#define DEF_SPEED 200
#define GRID_AT(grid, i, j, w) grid[i * w + j]
#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

static const char* symtable[2] = { " ", "█" };

/**
 * Ensures value inside is a valud uint16, else raises an error.
 */
int ensure_uint16(uint16_t* const out, const char* val);

/**
 * Trivial random grid generation using time as random seed to determine alive
 * cells.
 */
char* rand_init_grid(uint16_t w, uint16_t h);

/**
 * Uses file to generate the initial game setup
 * O, #, X are all "alive" and others are considered dead.
 * Makes sure that requested grid size is >= file template.
 * Warning: Assumes the file template is a rectangle and not jagged.
 */
char* file_init_grid(const char* fileName, uint16_t* const g_width,
    uint16_t* const g_height);

/**
 * Counts alive neighbors around a given cell.
 */
int count_neighbors(const char* grid, uint16_t w, uint16_t h, uint16_t row,
    uint16_t col);

/**
 * Computes next generation, by traversing over all cells and checking using
 * the following rules:
 * 1. <2 alive: Dies, underpopulation
 * 2. >3 alive: Dies, overpopulation
 * 3. 2 or 3, and self is alive, then it stays alive. Balanced.
 * 4. 3, and self is dead, then it becomes alive. Reproduction.
 *
 * Sets bit 1 ot the new computed state. It *DOES* not modify bit 0.
 * BIT 0 = current gen
 * BIT 1 = next gen
 */
void compute_nextgen(char* const grid, uint16_t w, uint16_t h);

/**
 * Commits the changes by compute_nextgen(...), erasing/setting the bit 0 to
 * next generation. Handles outputing frames of the actual game to stdout.
 * Current implementiation uses ANSI control chars.
 * TODO: Test full raw reprint.
 */
void commit_nextgen(char* const grid, uint16_t w, uint16_t h);

/**
 * Actual infinite game loop that calls the above two functions, and flushes
 * output to print.
 */
void game(char* const grid, uint16_t w, uint16_t h, uint16_t speed);

void handle_exit(int sig)
{
    (void)sig; // silence unused param warning
    fputs("\033[?25h", stdout); // show cursor
    fputs("\033[?1049l", stdout); // leave alt screen
    exit(0);
}

int main(int argc, char* argv[])
{
    uint16_t g_width = MIN_WIDTH, g_height = MIN_HEIGHT;
    uint16_t speed = DEF_SPEED;

    signal(SIGINT, handle_exit);
    char* fileName = NULL;
    for (int i = 1; i < argc; i++) {
        char* val = argv[i];
        if (strcmp(argv[i], "--help") == 0) {
            printf(
                "[Conway's Game of Life]\n"
                "[program] [flags]\n"
                "-w [positive non-zero number]\t\tSet grid width\n"
                "-h [positive non-zero number]\t\tSet grid height\n"
                "-s,--speed [positive non-zero number]\tSet speed\n"
                "--file [filename]\t\t\tUse file template. Ignores -w and -h "
                "and "
                "uses file "
                "dimensions. Assumes first row as source of no. of columns.\n"
                "--help\t\t\t\t\tShow this\n");
            return 0;
        } else if (strcmp(val, "-w") == 0) {
            if (i == argc - 1) {
                fputs("Error: value required for `-w`\n", stderr);
                return 1;
            }
            i++;
            if (!ensure_uint16(&g_width, argv[i])) {
                return 1;
            }
            if (g_width == 0) {
                fputs("Error: -w accepts positive non-zero number only.",
                    stderr);
                return 1;
            }
            if (g_width > MAX_WIDTH) {
                fputs("Error: Max width value is " TOSTRING(MAX_WIDTH) "\n",
                    stderr);
                return 1;
            }
        } else if (strcmp(val, "-h") == 0) {
            if (i == argc - 1) {
                fputs("Error: value required for `-h`\n", stderr);
                return 1;
            }
            i++;
            if (!ensure_uint16(&g_height, argv[i])) {
                return 1;
            }
            if (g_height == 0) {
                fputs("Error: -h accepts positive non-zero number only.",
                    stderr);
                return 1;
            }

            if (g_height > MAX_HEIGHT) {
                fputs("Error: Max height value is " TOSTRING(MAX_HEIGHT) "\n",
                    stderr);
                return 1;
            }
        }

        else if (strcmp(val, "-s") == 0 || strcmp(val, "--speed") == 0) {
            if (i == argc - 1) {
                fputs("Error: value required for `-s`/`--speed`\n", stderr);
                return 1;
            }
            i++;
            if (!ensure_uint16(&speed, argv[i])) {
                return 1;
            }

            if (speed == 0) {
                fputs(
                    "Error: -s/--speed accepts positive non-zero number only.",
                    stderr);
                return 1;
            }
        } else if (strcmp(val, "--file") == 0) {
            if (i == argc - 1) {
                fputs("Error: value required for `--file`\n", stderr);
                return 1;
            }
            i++;
            fileName = argv[i];
        }
    }

    char* grid = NULL;
    if (fileName != NULL) {
        grid = file_init_grid(fileName, &g_width, &g_height);
        if (grid == NULL)
            return 1;
    } else {
        grid = rand_init_grid(g_width, g_height);
        if (grid == NULL)
            return 1;
    }
    game(grid, g_width, g_height, speed);

    // this path wont ideally never be reached since ctrl+C like termination is
    // handled elsewhere. This will be re-claimed by kernel automatically,
    // however.
    free(grid);
    return 0;
}

void game(char* const grid, uint16_t w, uint16_t h, uint16_t speed)
{
    fputs("\033[?1049h", stdout); // enter alt screen
    fputs("\033[2J\033[H", stdout); // clear it, cursor home
    fputs("\033[?25l", stdout);
    fflush(stdout);
    while (1) {
        compute_nextgen(grid, w, h);
        commit_nextgen(grid, w, h);
        fflush(stdout);
        usleep((uint32_t)speed * 1000);
    }
}

int ensure_uint16(uint16_t* const out, const char* val)
{
    const char* p = val;
    while (*p == ' ' || *p == '\t')
        p++;

    if (*p == '-') {
        fputs("Error: negative values are not allowed.\n", stderr);
        return 0;
    }

    errno = 0;
    char* endptr;
    unsigned long result = strtoul(p, &endptr, 10);
    if (errno == ERANGE || result > UINT16_MAX) {
        fputs("Error: Overflow occured.\n", stderr);
        return 0;
    }
    if (*endptr != '\0' || endptr == p) {
        fputs("Error: The value is not a positive number.\n", stderr);
        return 0;
    }

    *out = (uint16_t)result;
    return 1;
}

char* rand_init_grid(uint16_t w, uint16_t h)
{
    char* grid = (char*)calloc((size_t)w * h, sizeof(char));
    if (grid == NULL)
        return NULL;
    srand(time(NULL));
    for (uint16_t i = 0; i < h; i++) {
        for (uint16_t j = 0; j < w; j++) {
            GRID_AT(grid, i, j, w) = rand() % 100 < 25;
        }
    }
    return grid;
}

char* file_init_grid(const char* fileName, uint16_t* const g_width,
    uint16_t* const g_height)
{
    FILE* file = fopen(fileName, "rb");
    if (file == NULL) {
        perror("Error opening file");
        return NULL;
    }
    fseek(file, 0, SEEK_END);
    long file_size = ftell(file);
    if (file_size < 0) {
        fputs("Error: could not determine file size\n", stderr);
        fclose(file);
        return NULL;
    }
    rewind(file);
    char* buf = (char*)malloc(file_size);

    if (buf == NULL) {
        fputs("Error: Memory allocation for file failed\n", stderr);
        fclose(file);
        return NULL;
    }

    size_t bytes_read = fread(buf, 1, file_size, file);
    fclose(file);

    size_t gw = 0, gh = 0;
    for (size_t i = 0; i <= bytes_read; i++) {
        if (buf[i] == '\n') {
            gh++;
            if (!gw)
                gw = i;
        }
    }
    printf("%zu %zu %ld\n", gw, gh, file_size);
    if (!(gh <= MAX_HEIGHT && gw <= MAX_WIDTH && gh <= UINT16_MAX
            && gw <= UINT16_MAX)) {
        fputs("Error: Unsupported file template grid size.\n", stderr);
        return NULL;
    }
    gh = gh >= MIN_HEIGHT ? gh : MIN_HEIGHT;
    gw = gw >= MIN_HEIGHT ? gw : MIN_HEIGHT;

    *g_width = (uint16_t)gw;
    *g_height = (uint16_t)gh;

    char* grid = (char*)calloc((size_t)gh * gw, sizeof(char));
    if (grid == NULL) {
        fputs("Error: failed to allocate grid.", stderr);
        return NULL;
    }
    size_t r = 0, c = 0;
    for (size_t i = 0; i < bytes_read; i++) {
        if (buf[i] == '\n') {
            r++;
            c = 0;
            continue;
        }
        if (buf[i] != '.' && c < gw && r < gh) {
            GRID_AT(grid, r, c, gw) = 1;
        }
        c++;
    }
    free(buf);
    return grid;
}

int count_neighbors(const char* grid, uint16_t w, uint16_t h, uint16_t row,
    uint16_t col)
{
    int count = 0;
    for (int dr = -1; dr <= 1; dr++) {
        for (int dc = -1; dc <= 1; dc++) {
            if (dr == 0 && dc == 0)
                continue;
            int64_t nr = ((int64_t)row + dr + h) % h;
            int64_t nc
                = ((int64_t)col + dc + w)
                % w; // promote data type to int64 to avoid wrapping behaviour
            uint16_t idx = (uint16_t)(nr * w + nc);
            count += (grid[idx] & 1); // use current state of bit 0
        }
    }
    return count;
}

void compute_nextgen(char* const grid, uint16_t w, uint16_t h)
{
    for (uint16_t i = 0; i < h; i++) {
        for (uint16_t j = 0; j < w; j++) {
            int n = count_neighbors(grid, w, h, i, j);
            // commit_nextgen(...) clears nextgen bits, so there is no
            // need to "kill".

            // keep alive if neighbors 2. alive (even from dead) always if 3
            GRID_AT(grid, i, j, w) |= ((n == 3 || (n == 2 && grid[i * w + j])) << 1);
        }
    }
}

void commit_nextgen(char* const grid, uint16_t w, uint16_t h)
{
    for (uint16_t i = 0; i < h; i++) {
        for (uint16_t j = 0; j < w; j++) {
            GRID_AT(grid, i, j, w) >>= 1;
            printf("\033[%d;%dH%s", i, j, symtable[(int)grid[i * w + j]]);
        }
    }
}
