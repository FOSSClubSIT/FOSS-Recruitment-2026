CC = gcc
TARGET = test_suite
FILES = test_grim.c grimoire.c

all:
	$(CC) $(FILES) -o $(TARGET)

# The New Shortcut
run: all
	./$(TARGET)

clean:
	rm -f $(TARGET)