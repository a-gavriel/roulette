import tkinter as tk
import random
import colorsys

def generate_colors(n: int, s: int, l: int, offset: int):
    h_spacing = 360 // n
    colors = [(h + offset, s, l) for h in range(0, 360, h_spacing)]
    return colors

def hsl_to_hex(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return f'#{int(r * 255):02x}{int(g * 255):02x}{int(b * 255):02x}'

def update_colors():
    s = s_slider.get()
    l = l_slider.get()
    #s = 80
    #l = 65
    offset = offset_slider.get()
    offset = 0
    colors = generate_colors(10, s, l, offset)
    print(f"s: {s}, l: {l}, offset: {offset}")
    for i, (h, s, l) in enumerate(colors):
        color_hex = hsl_to_hex(h % 360, s, l)  # Ensure h is within 0-359
        print(i, color_hex)
        color_labels[i].configure(bg=color_hex, text=color_hex)

root = tk.Tk()
root.title("Color Test")
root.geometry("400x600")
root.configure(bg="white")

s_slider = tk.Scale(root, from_=0, to=100, orient='horizontal', label='Saturation', length=200)
s_slider.set(60)
s_slider.pack(pady=5)

l_slider = tk.Scale(root, from_=0, to=100, orient='horizontal', label='Lightness', length=200)
l_slider.set(50)
l_slider.pack(pady=5)

offset_slider = tk.Scale(root, from_=0, to=36, orient='horizontal', label='Hue Offset', length=200)
offset_slider.set(0)
offset_slider.pack(pady=5)

color_labels = []
for i in range(10):
    label = tk.Label(root, text='', width=20, height=2)
    label.pack()
    color_labels.append(label)

s_slider.config(command=lambda x: update_colors())
l_slider.config(command=lambda x: update_colors())
offset_slider.config(command=lambda x: update_colors())

update_colors()  # Initial update to set colors

root.mainloop()