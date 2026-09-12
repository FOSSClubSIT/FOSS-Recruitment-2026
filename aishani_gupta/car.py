import tkinter as tk
from PIL import Image, ImageTk

root=tk.Tk()
root.overrideredirect(True)
root.attributes("-topmost", True)
img=Image.open("Catu.png")
img=img.resize((120,120))
cat = ImageTk.PhotoImage(img)
label = tk.Label(
    root,
    image=cat,
    bg="white"
)
label.pack()
def move_start(event):
    root.x = event.x
    root.y = event.y


def move(event):
    x = root.winfo_x() + event.x - root.x
    y = root.winfo_y() + event.y - root.y
    root.geometry(f"+{x}+{y}")


label.bind("<Button-1>", move_start)
label.bind("<B1-Motion>", move)
root.geometry("+100+100")   
root.mainloop()
