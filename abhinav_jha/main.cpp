#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <limits>

using namespace std;

// -------------------- ENEMY --------------------

struct Enemy {
    string name;
    int maxHP;
    int hp;
    int minDamage;
    int maxDamage;
    int xp;
    int gold;

    Enemy(string n, int health, int minDmg, int maxDmg, int experience, int coins)
        : name(n),
          maxHP(health),
          hp(health),
          minDamage(minDmg),
          maxDamage(maxDmg),
          xp(experience),
          gold(coins) {}
};

// -------------------- PLAYER --------------------

class Player {
public:
    string name;
    int level;
    int xp;
    int maxHP;
    int hp;
    int minDamage;
    int maxDamage;
    int gold;
    int potions;

    Player(string playerName) {
        name = playerName;
        level = 1;
        xp = 0;
        maxHP = 100;
        hp = maxHP;
        minDamage = 12;
        maxDamage = 20;
        gold = 20;
        potions = 2;
    }

    void showStats() {
        cout << "\n========== PLAYER STATS ==========\n";
        cout << "Name     : " << name << endl;
        cout << "Level    : " << level << endl;
        cout << "HP       : " << hp << "/" << maxHP << endl;
        cout << "Attack   : " << minDamage << "-" << maxDamage << endl;
        cout << "XP       : " << xp << "/" << level * 100 << endl;
        cout << "Gold     : " << gold << endl;
        cout << "Potions  : " << potions << endl;
        cout << "==================================\n";
    }

    void gainXP(int amount) {
        xp += amount;

        cout << "\nYou gained " << amount << " XP!\n";

        while (xp >= level * 100) {
            xp -= level * 100;
            levelUp();
        }
    }

    void levelUp() {
        level++;

        maxHP += 20;
        hp = maxHP;

        minDamage += 3;
        maxDamage += 4;

        cout << "\n*** LEVEL UP! ***\n";
        cout << "You are now level " << level << "!\n";
        cout << "Your HP has been restored.\n";
        cout << "Your attack power increased!\n";
    }

    void heal() {
        if (potions <= 0) {
            cout << "\nYou don't have any potions!\n";
            return;
        }

        if (hp == maxHP) {
            cout << "\nYour HP is already full!\n";
            return;
        }

        int oldHP = hp;

        hp += 35;

        if (hp > maxHP)
            hp = maxHP;

        potions--;

        cout << "\nYou drank a potion and recovered "
             << hp - oldHP << " HP.\n";
        cout << "HP: " << hp << "/" << maxHP << endl;
    }

    bool isAlive() {
        return hp > 0;
    }
};

// -------------------- RANDOM NUMBER --------------------

int randomNumber(int min, int max) {
    return min + rand() % (max - min + 1);
}

// -------------------- CREATE ENEMY --------------------

Enemy createEnemy() {
    int type = randomNumber(1, 4);

    if (type == 1)
        return Enemy("Goblin", 45, 6, 12, 40, 15);

    if (type == 2)
        return Enemy("Skeleton", 55, 8, 14, 50, 20);

    if (type == 3)
        return Enemy("Orc", 70, 10, 17, 70, 30);

    return Enemy("Dark Knight", 85, 12, 20, 90, 40);
}

// -------------------- SHOW HP BAR --------------------

void showHPBar(string name, int hp, int maxHP) {
    int barLength = 20;
    int filled = (hp * barLength) / maxHP;

    cout << name << " [";

    for (int i = 0; i < barLength; i++) {
        if (i < filled)
            cout << "#";
        else
            cout << "-";
    }

    cout << "] " << hp << "/" << maxHP << endl;
}

// -------------------- GET VALID CHOICE --------------------

int getChoice(int min, int max) {
    int choice;

    while (true) {
        cout << "Enter choice: ";

        if (cin >> choice && choice >= min && choice <= max) {
            return choice;
        }

        cout << "Invalid choice. Please enter a number between "
             << min << " and " << max << ".\n";

        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

// -------------------- COMBAT --------------------

bool battle(Player& player, Enemy enemy) {
    bool defending = false;

    cout << "\n==================================\n";
    cout << "        ENEMY ENCOUNTER!\n";
    cout << "==================================\n";
    cout << "A wild " << enemy.name << " appeared!\n";

    while (player.isAlive() && enemy.hp > 0) {

        cout << "\n";
        showHPBar(player.name, player.hp, player.maxHP);
        showHPBar(enemy.name, enemy.hp, enemy.maxHP);

        cout << "\n----------- BATTLE MENU -----------\n";
        cout << "1. Attack\n";
        cout << "2. Defend\n";
        cout << "3. Drink Potion\n";
        cout << "4. Escape\n";
        cout << "----------------------------------\n";

        int choice = getChoice(1, 4);

        // -------- ATTACK --------

        if (choice == 1) {
            int damage = randomNumber(player.minDamage, player.maxDamage);

            // Critical hit: 15% chance
            if (randomNumber(1, 100) <= 15) {
                damage *= 2;
                cout << "\nCRITICAL HIT!\n";
            }

            enemy.hp -= damage;

            if (enemy.hp < 0)
                enemy.hp = 0;

            cout << "\nYou attacked the " << enemy.name
                 << " for " << damage << " damage!\n";
        }

        // -------- DEFEND --------

        else if (choice == 2) {
            defending = true;

            cout << "\nYou raised your guard.\n";
            cout << "The next enemy attack will deal half damage.\n";
        }

        // -------- POTION --------

        else if (choice == 3) {
            player.heal();

            // If no potion was available, enemy still gets a turn.
        }

        // -------- ESCAPE --------

        else if (choice == 4) {
            int chance = randomNumber(1, 100);

            if (chance <= 50) {
                cout << "\nYou successfully escaped!\n";
                return true;
            } else {
                cout << "\nYou failed to escape!\n";
            }
        }

        // Enemy attacks if still alive

        if (enemy.hp > 0) {
            int enemyDamage =
                randomNumber(enemy.minDamage, enemy.maxDamage);

            if (defending) {
                enemyDamage /= 2;

                if (enemyDamage < 1)
                    enemyDamage = 1;

                cout << "\nYour defense reduced the damage!\n";
            }

            player.hp -= enemyDamage;

            if (player.hp < 0)
                player.hp = 0;

            cout << "The " << enemy.name
                 << " attacked you for "
                 << enemyDamage << " damage!\n";

            defending = false;
        }
    }

    // ---------------- PLAYER WINS ----------------

    if (player.isAlive()) {
        cout << "\n==================================\n";
        cout << "          ENEMY DEFEATED!\n";
        cout << "==================================\n";

        cout << "You defeated the " << enemy.name << "!\n";

        player.gold += enemy.gold;

        cout << "You found " << enemy.gold << " gold!\n";

        player.gainXP(enemy.xp);

        // 25% chance of finding a potion
        if (randomNumber(1, 100) <= 25) {
            player.potions++;
            cout << "You also found a potion!\n";
        }

        return true;
    }

    // ---------------- PLAYER DIES ----------------

    cout << "\n==================================\n";
    cout << "             DEFEATED\n";
    cout << "==================================\n";
    cout << "You were defeated by the " << enemy.name << ".\n";

    return false;
}

// -------------------- TREASURE --------------------

void findTreasure(Player& player) {
    cout << "\n==================================\n";
    cout << "          TREASURE FOUND!\n";
    cout << "==================================\n";

    int reward = randomNumber(15, 50);

    player.gold += reward;

    cout << "You found a treasure chest!\n";
    cout << "Inside were " << reward << " gold coins.\n";

    // Chance to find potion
    if (randomNumber(1, 100) <= 40) {
        player.potions++;
        cout << "You also found a healing potion!\n";
    }
}

// -------------------- REST --------------------

void rest(Player& player) {
    cout << "\nYou found a safe room.\n";

    int oldHP = player.hp;

    player.hp += 20;

    if (player.hp > player.maxHP)
        player.hp = player.maxHP;

    cout << "You rested and recovered "
         << player.hp - oldHP << " HP.\n";
}

// -------------------- FINAL BOSS --------------------

bool bossBattle(Player& player) {
    Enemy boss("ANCIENT DRAGON", 180, 15, 25, 250, 200);

    cout << "\n\n";
    cout << "########################################\n";
    cout << "#                                      #\n";
    cout << "#        THE ANCIENT DRAGON            #\n";
    cout << "#                                      #\n";
    cout << "########################################\n";

    cout << "\nYou have reached the deepest part of the dungeon.\n";
    cout << "A massive dragon awakens before you...\n";
    cout << "\n\"You should never have come here, mortal.\"\n";

    bool defending = false;

    while (player.isAlive() && boss.hp > 0) {

        cout << "\n";
        showHPBar(player.name, player.hp, player.maxHP);
        showHPBar(boss.name, boss.hp, boss.maxHP);

        cout << "\n----------- BOSS BATTLE -----------\n";
        cout << "1. Attack\n";
        cout << "2. Defend\n";
        cout << "3. Drink Potion\n";
        cout << "----------------------------------\n";

        int choice = getChoice(1, 3);

        if (choice == 1) {
            int damage = randomNumber(player.minDamage, player.maxDamage);

            if (randomNumber(1, 100) <= 15) {
                damage *= 2;
                cout << "\nCRITICAL HIT!\n";
            }

            boss.hp -= damage;

            if (boss.hp < 0)
                boss.hp = 0;

            cout << "\nYou struck the Ancient Dragon for "
                 << damage << " damage!\n";
        }

        else if (choice == 2) {
            defending = true;
            cout << "\nYou prepare yourself for the dragon's attack.\n";
        }

        else if (choice == 3) {
            player.heal();
        }

        // Dragon attack

        if (boss.hp > 0) {

            int damage = randomNumber(boss.minDamage, boss.maxDamage);

            // Dragon has a 20% chance of using a powerful attack
            if (randomNumber(1, 100) <= 20) {
                damage += 10;
                cout << "\nThe dragon uses FIRE BREATH!\n";
            }

            if (defending) {
                damage /= 2;

                if (damage < 1)
                    damage = 1;

                cout << "Your defense reduced the damage!\n";
            }

            player.hp -= damage;

            if (player.hp < 0)
                player.hp = 0;

            cout << "The Ancient Dragon dealt "
                 << damage << " damage!\n";

            defending = false;
        }
    }

    if (player.isAlive()) {
        cout << "\n";
        cout << "########################################\n";
        cout << "#                                      #\n";
        cout << "#       YOU DEFEATED THE DRAGON!       #\n";
        cout << "#                                      #\n";
        cout << "########################################\n";

        cout << "\nThe Ancient Dragon has fallen!\n";

        player.gold += boss.gold;
        player.gainXP(boss.xp);

        return true;
    }

    cout << "\nThe dragon was too powerful...\n";
    return false;
}

// -------------------- MAIN GAME --------------------

int main() {

    srand(static_cast<unsigned int>(time(0)));

    cout << "========================================\n";
    cout << "             DUNGEON RUN\n";
    cout << "        A Terminal Roguelike\n";
    cout << "========================================\n";

    cout << "\nEnter your character name: ";

    string playerName;
    cin >> playerName;

    Player player(playerName);

    cout << "\nWelcome, " << player.name << "!\n";
    cout << "Your mission is to survive the dungeon\n";
    cout << "and defeat the Ancient Dragon.\n";

    int rooms = 0;
    const int roomsBeforeBoss = 5;

    while (player.isAlive() && rooms < roomsBeforeBoss) {

        cout << "\n\n========================================\n";
        cout << "              DUNGEON\n";
        cout << "            Room " << rooms + 1
             << "/" << roomsBeforeBoss << "\n";
        cout << "========================================\n";

        cout << "\nWhat would you like to do?\n";
        cout << "1. Explore the room\n";
        cout << "2. Check player stats\n";
        cout << "3. Drink potion\n";
        cout << "4. Rest\n";

        int choice = getChoice(1, 4);

        if (choice == 1) {

            int event = randomNumber(1, 100);

            // Enemy encounter: 60%
            if (event <= 60) {
                Enemy enemy = createEnemy();

                if (!battle(player, enemy))
                    break;

                rooms++;
            }

            // Treasure: 20%
            else if (event <= 80) {
                findTreasure(player);
                rooms++;
            }

            // Rest area: 20%
            else {
                rest(player);
                rooms++;
            }
        }

        else if (choice == 2) {
            player.showStats();
        }

        else if (choice == 3) {
            player.heal();
        }

        else if (choice == 4) {
            rest(player);
        }
    }

    // -------------------- BOSS --------------------

    if (player.isAlive()) {

        cout << "\n\nYou've survived the dungeon!\n";
        cout << "The final chamber lies ahead...\n";

        cout << "\nPress 1 to enter the boss room: ";
        getChoice(1, 1);

        if (bossBattle(player)) {

            cout << "\n========================================\n";
            cout << "              VICTORY!\n";
            cout << "========================================\n";

            cout << "\nCongratulations, " << player.name << "!\n";
            cout << "You conquered the dungeon and defeated\n";
            cout << "the Ancient Dragon.\n";

            player.showStats();
        }
        else {
            cout << "\n========================================\n";
            cout << "               GAME OVER\n";
            cout << "========================================\n";
        }
    }
    else {
        cout << "\n========================================\n";
        cout << "               GAME OVER\n";
        cout << "========================================\n";
    }

    cout << "\nThanks for playing DungeonRun!\n";

    return 0;
}