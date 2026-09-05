import pygame
import sys
import random
from pygame.math import Vector2

SCREEN_UPDATE = pygame.USEREVENT
class SNAKE:
    def __init__(self, sk_c=1):
        self.initialize(sk_c)
    
    def initialize(self, sk_c):
        self.body = [Vector2(5, 10), Vector2(4, 10), Vector2(3, 10)]
        self.direction = Vector2(1, 0)
        self.new_block = False
        if sk_c == 1:
            self.head_up = pygame.image.load('head_up.png').convert_alpha()
            self.head_down = pygame.image.load('head_down.png').convert_alpha()
            self.head_right = pygame.image.load('head_right.png').convert_alpha()
            self.head_left = pygame.image.load('head_left.png').convert_alpha()
            
            self.tail_up = pygame.image.load('tail_up.png').convert_alpha()
            self.tail_down = pygame.image.load('tail_down.png').convert_alpha()
            self.tail_right = pygame.image.load('tail_right.png').convert_alpha()
            self.tail_left = pygame.image.load('tail_left.png').convert_alpha()

            self.body_vertical = pygame.image.load('body_vertical.png').convert_alpha()
            self.body_horizontal = pygame.image.load('body_horizontal.png').convert_alpha()

            self.body_tr = pygame.image.load('body_tr.png').convert_alpha()
            self.body_tl = pygame.image.load('body_tl.png').convert_alpha()
            self.body_br = pygame.image.load('body_br.png').convert_alpha()
            self.body_bl = pygame.image.load('body_bl.png').convert_alpha()
        elif sk_c == 2:
            self.head_up = pygame.image.load('b_head_up.png').convert_alpha()
            self.head_down = pygame.image.load('b_head_down.png').convert_alpha()
            self.head_right = pygame.image.load('b_head_right.png').convert_alpha()
            self.head_left = pygame.image.load('b_head_left.png').convert_alpha()
            
            self.tail_up = pygame.image.load('b_tail_up.png').convert_alpha()
            self.tail_down = pygame.image.load('b_tail_down.png').convert_alpha()
            self.tail_right = pygame.image.load('b_tail_right.png').convert_alpha()
            self.tail_left = pygame.image.load('b_tail_left.png').convert_alpha()

            self.body_vertical = pygame.image.load('b_body_vertical.png').convert_alpha()
            self.body_horizontal = pygame.image.load('b_body_horizontal.png').convert_alpha()

            self.body_tr = pygame.image.load('b_body_tr.png').convert_alpha()
            self.body_tl = pygame.image.load('b_body_tl.png').convert_alpha()
            self.body_br = pygame.image.load('b_body_br.png').convert_alpha()
            self.body_bl = pygame.image.load('b_body_bl.png').convert_alpha()
        elif sk_c == 3:
            self.head_up = pygame.image.load('m_head_up.png').convert_alpha()
            self.head_down = pygame.image.load('m_head_down.png').convert_alpha()
            self.head_right = pygame.image.load('m_head_right.png').convert_alpha()
            self.head_left = pygame.image.load('m_head_left.png').convert_alpha()
                
            self.tail_up = pygame.image.load('m_tail_up.png').convert_alpha()
            self.tail_down = pygame.image.load('m_tail_down.png').convert_alpha()
            self.tail_right = pygame.image.load('m_tail_right.png').convert_alpha()
            self.tail_left = pygame.image.load('m_tail_left.png').convert_alpha()

            self.body_vertical = pygame.image.load('m_body_vertical.png').convert_alpha()
            self.body_horizontal = pygame.image.load('m_body_horizontal.png').convert_alpha()

            self.body_tr = pygame.image.load('m_body_tr.png').convert_alpha()
            self.body_tl = pygame.image.load('m_body_tl.png').convert_alpha()
            self.body_br = pygame.image.load('m_body_br.png').convert_alpha()
            self.body_bl = pygame.image.load('m_body_bl.png').convert_alpha()
    def reinitialize(self, sk_c):
        self.initialize(sk_c)
    def draw_snake(self):
        self.update_head_graphics()
        self.update_tail_graphics()

        for index, block in enumerate(self.body):
            x_pos = int(block.x * cell_size)
            y_pos = int(block.y * cell_size)
            block_rect = pygame.Rect(x_pos, y_pos, cell_size, cell_size)

            if index == 0:
                screen.blit(self.head, block_rect)
            elif index == len(self.body) - 1:
                screen.blit(self.tail, block_rect)
            else:
                previous_block = self.body[index + 1] - block
                next_block = self.body[index - 1] - block
                if previous_block.x == next_block.x:
                    screen.blit(self.body_vertical, block_rect)
                elif previous_block.y == next_block.y:
                    screen.blit(self.body_horizontal, block_rect)
                else:
                    if previous_block.x == -1 and next_block.y == -1 or previous_block.y == -1 and next_block.x == -1:
                        screen.blit(self.body_tl, block_rect)
                    elif previous_block.x == -1 and next_block.y == 1 or previous_block.y == 1 and next_block.x == -1:
                        screen.blit(self.body_bl, block_rect)
                    elif previous_block.x == 1 and next_block.y == -1 or previous_block.y == -1 and next_block.x == 1:
                        screen.blit(self.body_tr, block_rect)
                    elif previous_block.x == 1 and next_block.y == 1 or previous_block.y == 1 and next_block.x == 1:
                        screen.blit(self.body_br, block_rect)

    def update_head_graphics(self):
        head_relation = self.body[1] - self.body[0]
        if head_relation == Vector2(1, 0):
            self.head = self.head_left
        elif head_relation == Vector2(-1, 0):
            self.head = self.head_right
        elif head_relation == Vector2(0, 1): 
            self.head = self.head_up
        elif head_relation == Vector2(0, -1): 
            self.head = self.head_down

    def update_tail_graphics(self):
        tail_relation = self.body[-2] - self.body[-1]
        if tail_relation == Vector2(1, 0): 
            self.tail = self.tail_left
        elif tail_relation == Vector2(-1, 0): 
            self.tail = self.tail_right
        elif tail_relation == Vector2(0, 1): 
            self.tail = self.tail_up
        elif tail_relation == Vector2(0, -1): 
            self.tail = self.tail_down

    def move_snake(self):
        if self.new_block:
            body_copy = self.body[:]
            body_copy.insert(0, body_copy[0] + self.direction)
            self.body = body_copy[:]
            self.new_block = False
        else:
            body_copy = self.body[:-1]
            body_copy.insert(0, body_copy[0] + self.direction)
            self.body = body_copy[:]

    def add_block(self):
        self.new_block = True

    def reset(self):
        self.body = [Vector2(5, 10), Vector2(4, 10), Vector2(3, 10)]
        self.direction = Vector2(1, 0)
        self.new_block = False


class FRUIT:
    def __init__(self):
        self.randomize()

    def draw_fruit(self, apple_image):
        # Scale the apple image to the size of the cell
        apple_image = pygame.transform.scale(apple_image, (cell_size, cell_size))
        
        fruit_rect = pygame.Rect(int(self.pos.x * cell_size), int(self.pos.y * cell_size), cell_size, cell_size)
        screen.blit(apple_image, fruit_rect)

    def randomize(self):
        self.x = random.randint(0, cell_number - 1)
        self.y = random.randint(0, cell_number - 1)
        self.pos = Vector2(self.x, self.y)

class MAIN:
    def __init__(self):
        self.snake = SNAKE()
        self.fruit = FRUIT()
        self.apple_sprite = pygame.image.load("apple.png")
        self.game_over_flag = False  # Flag to indicate if the game is over
        self.selected_difficulty = None
        self.high_scores = {"easy": 0, "medium": 0, "hard": 0}
        self.load_high_scores()
        self.current_score = 0
        self.snake_speed = 100  # Base speed

    def load_high_scores(self):
        try:
            with open("high_scores.txt", "r") as file:
                for line in file:
                    difficulty, score = line.strip().split(":")
                    self.high_scores[difficulty] = int(score)
        except FileNotFoundError:
            print("High scores file not found. Starting with default high scores.")

    def save_high_scores(self):
        with open("high_scores.txt", "w") as file:
            for difficulty, score in self.high_scores.items():
                file.write(f"{difficulty}:{score}\n")

    def update(self):
        if not self.game_over_flag:
            self.snake.move_snake()
            self.check_collision()
            self.check_fail()
        if self.game_over_flag:
            self.show_menu()

    def draw_elements(self):
        self.draw_grass()
        self.fruit.draw_fruit(self.apple_sprite)
        self.snake.draw_snake()
        self.draw_score()

        if self.game_over_flag:
            self.show_menu()

    def check_collision(self):
        if self.fruit.pos == self.snake.body[0]:
            self.fruit.randomize()
            self.snake.add_block()
            self.snake_speed = adjust_snake_speed(self.selected_difficulty, self.snake_speed)
            pygame.time.set_timer(SCREEN_UPDATE, self.snake_speed)

        for block in self.snake.body[1:]:
            if block == self.fruit.pos:
                self.fruit.randomize()

    def check_fail(self):
        if not 0 <= self.snake.body[0].x < cell_number or not 0 <= self.snake.body[0].y < cell_number:
            self.current_score = (len(self.snake.body) - 3) * 10
            self.game_over()

        for block in self.snake.body[1:]:
            if block == self.snake.body[0]:
                self.game_over()

    def game_over(self):
        self.snake.reset()
        self.game_over_flag = True
        self.reset_timer = pygame.time.get_ticks() + 100
        button_width = 200
        button_height = 50
        button_radius = 10
        button_border_width = 3
        button_color = (200, 200, 200)  # Default button color
        hover_color = (150, 150, 150)   # Button color when hovered
        border_color = (100, 100, 100)  # Border color

        font_large = pygame.font.Font(None, 50)
        font_medium = pygame.font.Font(None, 40)
        game_over_text = font_large.render("Game Over", True, (255, 0, 0))
        game_over_rect = game_over_text.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2 - 100))
        

        retry_rect = pygame.Rect((screen.get_width() - button_width) // 2, screen.get_height() // 2, button_width, button_height)
        change_level_rect = pygame.Rect((screen.get_width() - button_width) // 2, (screen.get_height() // 2) + 100, button_width, button_height)
        retry_text = font_medium.render("Retry", True, (255, 0, 0))
        change_level_text = font_medium.render("Change Level", True, (255, 0, 0))
        retry_text_rect = retry_text.get_rect(center=retry_rect.center)
        change_level_text_rect = change_level_text.get_rect(center=change_level_rect.center)

        pygame.draw.rect(screen, button_color, retry_rect, border_radius=button_radius)
        pygame.draw.rect(screen, button_color, change_level_rect, border_radius=button_radius)
        pygame.draw.rect(screen, border_color, retry_rect, border_radius=button_radius, width=button_border_width)
        pygame.draw.rect(screen, border_color, change_level_rect, border_radius=button_radius, width=button_border_width)


        screen.blit(game_over_text, game_over_rect)
        screen.blit(retry_text, retry_text_rect)
        screen.blit(change_level_text, change_level_text_rect)
        pygame.display.flip()

        # Button handling
        retry_pressed = False
        change_level_pressed = False
        while not retry_pressed and not change_level_pressed:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    mouse_pos = pygame.mouse.get_pos()
                    if retry_rect.collidepoint(mouse_pos):
                        retry_pressed = True
                    elif change_level_rect.collidepoint(mouse_pos):
                        change_level_pressed = True

            # Button hover effect
            retry_color = hover_color if retry_rect.collidepoint(pygame.mouse.get_pos()) else button_color
            change_level_color = hover_color if change_level_rect.collidepoint(pygame.mouse.get_pos()) else button_color

            # Draw buttons with hover effect
            pygame.draw.rect(screen, retry_color, retry_rect, border_radius=button_radius)
            pygame.draw.rect(screen, change_level_color, change_level_rect, border_radius=button_radius)
            pygame.draw.rect(screen, border_color, retry_rect, border_radius=button_radius, width=button_border_width)
            pygame.draw.rect(screen, border_color, change_level_rect, border_radius=button_radius, width=button_border_width)
            screen.blit(game_over_text, game_over_rect)
            screen.blit(retry_text, retry_text_rect)
            screen.blit(change_level_text, change_level_text_rect)

            if self.current_score > self.high_scores[self.selected_difficulty]:
                self.high_scores[self.selected_difficulty] = self.current_score
                self.save_high_scores()

            high_score_text = f"High Score: {self.high_scores[self.selected_difficulty]}"
            high_score_surface = game_font.render(high_score_text, True, (255, 0, 0))
            high_score_rect = high_score_surface.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2 + 200))
            screen.blit(high_score_surface, high_score_rect)


            pygame.display.flip()

        if retry_pressed:
            if self.selected_difficulty:
                self.reset_game()
        if change_level_pressed and self.game_over_flag:
            self.show_menu()

    
    def reset_game(self):
        current_time = pygame.time.get_ticks()
        if self.game_over_flag and current_time > self.reset_timer:
            self.snake.reset()
            self.fruit.randomize()
            self.game_over_flag = False
            self.snake_speed = 100  
            pygame.time.set_timer(SCREEN_UPDATE, self.snake_speed)
            
    def draw_grass(self):
        grass_color = (167, 209, 61)
        for row in range(cell_number):
            if row % 2 == 0: 
                for col in range(cell_number):
                    if col % 2 == 0:
                        grass_rect = pygame.Rect(col * cell_size, row * cell_size, cell_size, cell_size)
                        pygame.draw.rect(screen, grass_color, grass_rect)
            if row % 2 != 0:
                for col in range(cell_number):
                    if col % 2 != 0:
                        grass_rect = pygame.Rect(col * cell_size, row * cell_size, cell_size, cell_size)
                        pygame.draw.rect(screen, grass_color, grass_rect)

    def draw_score(self):
        score_text = str((len(self.snake.body) - 3) * 10)
        score_surface = game_font.render(score_text, True, (56, 74, 12))
        score_x = int(cell_size * cell_number - 60)
        score_y = int(cell_size * cell_number - 40)
        score_rect = score_surface.get_rect(center=(score_x, score_y))
        apple_rect = apple.get_rect(midright=(score_rect.left, score_rect.centery))
        bg_rect = pygame.Rect(apple_rect.left, apple_rect.top, apple_rect.width + score_rect.width + 6, apple_rect.height)


        pygame.draw.rect(screen, (167, 209, 61), bg_rect)
        screen.blit(score_surface, score_rect)
        screen.blit(apple, apple_rect)
        pygame.draw.rect(screen, (56, 74, 12), bg_rect, 2)

    def show_sprite_selection_screen(self):
        screen.fill((174, 215, 70))  # Background color for sprite selection screen
        self.draw_grass()  # Draw the grass background as before

        menu_font = pygame.font.Font(None, 50)

        # Draw "Select Snake Sprite" title
        snake_sprite_text = menu_font.render("Select Snake Sprite:", True, (255, 255, 255))
        snake_sprite_text_rect = snake_sprite_text.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2 - 220))
        screen.blit(snake_sprite_text, snake_sprite_text_rect)

        # Load and scale snake sprite images
        sprite1_image = pygame.image.load("head_left.png")
        sprite2_image = pygame.image.load("b_head_left.png")
        sprite3_image = pygame.image.load("m_head_left.png")  # Reuse head_left.png for sprite3
        button_width, button_height = 80, 80
        sprite1_image = pygame.transform.scale(sprite1_image, (button_width, button_height))
        sprite2_image = pygame.transform.scale(sprite2_image, (button_width, button_height))
        sprite3_image = pygame.transform.scale(sprite3_image, (button_width, button_height))

        # Position snake sprite buttons
        base_x = screen.get_width() // 2 - (button_width * 1.5 + 40)
        button_y_snake = screen.get_height() // 2 - 140
        button_spacing = 60
        sprite1_rect = pygame.Rect(base_x, button_y_snake, button_width, button_height)
        sprite2_rect = pygame.Rect(base_x + button_width + button_spacing, button_y_snake, button_width, button_height)
        sprite3_rect = pygame.Rect(base_x + 2 * (button_width + button_spacing), button_y_snake, button_width, button_height)

        # Draw grey, rounded background boxes behind the snake sprite buttons
        pygame.draw.rect(screen, (169, 169, 169), sprite1_rect.inflate(20, 20), border_radius=15)
        pygame.draw.rect(screen, (169, 169, 169), sprite2_rect.inflate(20, 20), border_radius=15)
        pygame.draw.rect(screen, (169, 169, 169), sprite3_rect.inflate(20, 20), border_radius=15)

        # Draw each snake sprite button
        screen.blit(sprite1_image, sprite1_rect.topleft)
        screen.blit(sprite2_image, sprite2_rect.topleft)
        screen.blit(sprite3_image, sprite3_rect.topleft)

        # Draw "Select Apple Sprite" title below the snake sprite buttons
        apple_sprite_text = menu_font.render("Select Apple Sprite:", True, (255, 255, 255))
        apple_sprite_text_rect = apple_sprite_text.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2 + 20))
        screen.blit(apple_sprite_text, apple_sprite_text_rect)

        # Load apple sprite images
        apple1_image = pygame.image.load("apple.png")
        apple2_image = pygame.image.load("g_apple.png")
        apple_button_width, apple_button_height = 80, 80
        apple1_image = pygame.transform.scale(apple1_image, (apple_button_width, apple_button_height))
        apple2_image = pygame.transform.scale(apple2_image, (apple_button_width, apple_button_height))

        # Position apple sprite buttons
        base_x_apple = screen.get_width() // 2 - (apple_button_width + 30)
        button_y_apple = screen.get_height() // 2 + 80
        apple_button_spacing = 60

        # Define rectangles for each apple sprite button
        apple1_rect = pygame.Rect(base_x_apple, button_y_apple, apple_button_width, apple_button_height)
        apple2_rect = pygame.Rect(base_x_apple + apple_button_width + apple_button_spacing, button_y_apple, apple_button_width, apple_button_height)

        # Draw grey, rounded background boxes behind the apple sprite buttons
        pygame.draw.rect(screen, (169, 169, 169), apple1_rect.inflate(20, 20), border_radius=15)
        pygame.draw.rect(screen, (169, 169, 169), apple2_rect.inflate(20, 20), border_radius=15)

        # Draw each apple sprite button
        screen.blit(apple1_image, apple1_rect.topleft)
        screen.blit(apple2_image, apple2_rect.topleft)

        # Draw the "Back" button
        back_button_text = menu_font.render("Back", True, (255, 255, 255))
        back_button_width, back_button_height = 150, 50
        back_button_rect = pygame.Rect((screen.get_width() // 2 - back_button_width // 2, screen.get_height() - 100), (back_button_width, back_button_height))
        pygame.draw.rect(screen, (169, 169, 169), back_button_rect, border_radius=15)
        screen.blit(back_button_text, back_button_text.get_rect(center=back_button_rect.center))

        pygame.display.flip()

        # Initialize snake sprite variable to None (no selection initially)
        self.snake_sprite = None

        # Wait for user to select a sprite or click "Back"
        sprite_selected = None
        apple_selected = None
        while sprite_selected is None or apple_selected is None:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    mouse_pos = pygame.mouse.get_pos()

                    # Check if "Back" button was clicked
                    if back_button_rect.collidepoint(mouse_pos):
                        self.show_menu()  # Go back to the main menu
                        return None, None  # Exit the selection screen without selecting sprites

                    # Check for snake sprite selection
                    if sprite1_rect.collidepoint(mouse_pos):
                        self.snake_sprite = 1  # Set selected sprite to 1
                        self.snake.reinitialize(1)
                        sprite_selected = 1
                    elif sprite2_rect.collidepoint(mouse_pos):
                        self.snake_sprite = 2  # Set selected sprite to 2
                        self.snake.reinitialize(2)
                        sprite_selected = 2
                    elif sprite3_rect.collidepoint(mouse_pos):
                        self.snake_sprite = 3  # Set selected sprite to 3
                        self.snake.reinitialize(3)
                        sprite_selected = 3

                    # After the user clicks on an apple sprite, store the choice:
                    if apple1_rect.collidepoint(mouse_pos):
                        self.apple_sprite = apple1_image  # Set selected sprite to apple1
                        apple_selected = 1
                    elif apple2_rect.collidepoint(mouse_pos):
                        self.apple_sprite = apple2_image  # Set selected sprite to apple2
                        apple_selected = 2


            # Refill the background and redraw everything
            screen.fill((174, 215, 70))  # Refill the background color
            self.draw_grass()

            # Redraw titles and sprites, along with the "Back" button
            screen.blit(snake_sprite_text, snake_sprite_text_rect)
            pygame.draw.rect(screen, (169, 169, 169), sprite1_rect.inflate(20, 20), border_radius=15)
            pygame.draw.rect(screen, (169, 169, 169), sprite2_rect.inflate(20, 20), border_radius=15)
            pygame.draw.rect(screen, (169, 169, 169), sprite3_rect.inflate(20, 20), border_radius=15)
            screen.blit(sprite1_image, sprite1_rect.topleft)
            screen.blit(sprite2_image, sprite2_rect.topleft)
            screen.blit(sprite3_image, sprite3_rect.topleft)
            screen.blit(apple_sprite_text, apple_sprite_text_rect)
            pygame.draw.rect(screen, (169, 169, 169), apple1_rect.inflate(20, 20), border_radius=15)
            pygame.draw.rect(screen, (169, 169, 169), apple2_rect.inflate(20, 20), border_radius=15)
            screen.blit(apple1_image, apple1_rect.topleft)
            screen.blit(apple2_image, apple2_rect.topleft)

            # Redraw "Back" button
            pygame.draw.rect(screen, (169, 169, 169), back_button_rect, border_radius=15)
            screen.blit(back_button_text, back_button_text.get_rect(center=back_button_rect.center))

            # Draw borders around selected sprites
            if self.snake_sprite == 1:
                pygame.draw.rect(screen, (0, 0, 0), sprite1_rect.inflate(20, 20), border_radius=15, width=5)
            elif self.snake_sprite == 2:
                pygame.draw.rect(screen, (0, 0, 0), sprite2_rect.inflate(20, 20), border_radius=15, width=5)
            elif self.snake_sprite == 3:
                pygame.draw.rect(screen, (0, 0, 0), sprite3_rect.inflate(20, 20), border_radius=15, width=5)

            if apple_selected == 1:
                pygame.draw.rect(screen, (0, 0, 0), apple1_rect.inflate(20, 20), border_radius=15, width=5)
            elif apple_selected == 2:
                pygame.draw.rect(screen, (0, 0, 0), apple2_rect.inflate(20, 20), border_radius=15, width=5)

            pygame.display.flip()

        # Return selected snake sprite and apple sprite



    def show_menu(self):
        self.selected_difficulty = None
        screen.fill((174, 215, 70))  # Background color for the menu
        self.draw_grass()  # Draw background elements, like grass

        # Font settings for buttons and menu title
        button_font = pygame.font.Font(None, 40)
        menu_font = pygame.font.Font(None, 50)

        # Button style settings
        button_normal_color = (200, 200, 200)
        button_hover_color = (150, 150, 150)
        button_text_color = (255, 0, 0)
        button_border_color = (100, 100, 100)
        button_width = 200
        button_height = 50
        button_radius = 10
        button_border_width = 3
        button_spacing = 60  # Reduced spacing to make all buttons fit

        # Positions for difficulty buttons
        center_x = (screen.get_width() - button_width) // 2
        easy_rect = pygame.Rect(center_x, screen.get_height() // 2 - 100, button_width, button_height)
        medium_rect = pygame.Rect(center_x, easy_rect.bottom + button_spacing, button_width, button_height)
        hard_rect = pygame.Rect(center_x, medium_rect.bottom + button_spacing, button_width, button_height)
        sprite_button_rect = pygame.Rect(center_x, hard_rect.bottom + button_spacing, button_width, button_height)

        # Draw menu title
        menu_text = menu_font.render("Choose Difficulty:", True, (255, 255, 255))
        menu_rect = menu_text.get_rect(center=(screen.get_width() // 2, screen.get_height() // 2 - 150))
        screen.blit(menu_text, menu_rect)

        # Draw buttons with hover effect
        mouse_pos = pygame.mouse.get_pos()
        for button_rect, label in [
            (easy_rect, "Easy"), 
            (medium_rect, "Medium"), 
            (hard_rect, "Hard"), 
            (sprite_button_rect, "Select Sprite")
        ]:
            color = button_hover_color if button_rect.collidepoint(mouse_pos) else button_normal_color
            pygame.draw.rect(screen, color, button_rect, border_radius=button_radius)
            pygame.draw.rect(screen, button_border_color, button_rect, border_radius=button_radius, width=button_border_width)

            # Render and center button text
            button_text = button_font.render(label, True, button_text_color)
            button_text_rect = button_text.get_rect(center=button_rect.center)
            screen.blit(button_text, button_text_rect)

        pygame.display.flip()

        # Handle mouse clicks to select difficulty or sprite
        while self.selected_difficulty is None:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    mouse_pos = pygame.mouse.get_pos()
                    if easy_rect.collidepoint(mouse_pos):
                        self.selected_difficulty = "easy"
                    elif medium_rect.collidepoint(mouse_pos):
                        self.selected_difficulty = "medium"
                    elif hard_rect.collidepoint(mouse_pos):
                        self.selected_difficulty = "hard"
                    elif sprite_button_rect.collidepoint(mouse_pos):
                        selected_sprite = self.show_sprite_selection_screen()
                        if selected_sprite == 1:
                            self.snake_sprite = "sprite1"
                        elif selected_sprite == 2:
                            self.snake_sprite = "sprite2"
                        print(f"Selected Sprite: {self.snake_sprite}")
                        self.selected_difficulty = "easy"  # Set a default difficulty or prompt user to choose
                        self.reset_game()

        self.reset_game()
        return self.selected_difficulty
    
def adjust_snake_speed(difficulty, current_speed):
    # Determine speed increment based on difficulty
    if difficulty == "easy":
        increment = 1
    elif difficulty == "medium":
        increment = 5
    elif difficulty == "hard":
        increment = 10
    
    # Increase current speed by the increment
    return max(current_speed - increment, 0)

pygame.init()
cell_size = 40
cell_number = 15
screen = pygame.display.set_mode((cell_number * cell_size, cell_number * cell_size))
clock = pygame.time.Clock()
apple = pygame.image.load('apple.png').convert_alpha()
main_game = MAIN()
main_game.show_menu()
game_font = pygame.font.Font(None, 25)

SCREEN_UPDATE = pygame.USEREVENT

pygame.time.set_timer(SCREEN_UPDATE, main_game.snake_speed)

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        elif event.type == SCREEN_UPDATE:
            main_game.update()
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP and main_game.snake.direction.y != 1:
                main_game.snake.direction = Vector2(0, -1)
            elif event.key == pygame.K_RIGHT and main_game.snake.direction.x != -1:
                main_game.snake.direction = Vector2(1, 0)
            elif event.key == pygame.K_LEFT and main_game.snake.direction.x != 1:
                main_game.snake.direction = Vector2(-1, 0)
            elif event.key == pygame.K_DOWN and main_game.snake.direction.y != -1:
                main_game.snake.direction = Vector2(0, 1)
            elif event.key == pygame.K_SPACE:
                main_game.reset_game()

    screen.fill((174, 215, 70))
    main_game.draw_elements()
    pygame.display.update()
    clock.tick(60)

