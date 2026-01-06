import os
from PIL import Image

def generate_icons():
    # Source image path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    source_path = os.path.join(script_dir, "source_icon.png")
    
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found.")
        return

    try:
        img = Image.open(source_path)
        
        # Use the full image as is, no auto-cropping
        cropped_img = img
        print(f"Using full source image size: {img.size}")

        # Define output directory
        output_dir = "public/icons"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Define sizes and filenames
        # layout.tsx references:
        # favicon-16x16.png
        # favicon-32x32.png
        # icon-48x48.png
        # icon-192x192.png
        # icon-512x512.png
        # Apple touch icon: apple-touch-icon.png (180x180) in public root
        
        icon_configs = [
            ("public/icons/favicon-16x16.png", 16),
            ("public/icons/favicon-32x32.png", 32),
            ("public/icons/icon-48x48.png", 48),
            ("public/icons/icon-192.png", 192),
            ("public/icons/icon-192x192.png", 192),
            ("public/icons/icon-384x384.png", 384), # Usually good to have
            ("public/icons/icon-512.png", 512),
            ("public/icons/icon-512x512.png", 512),
            ("public/apple-touch-icon.png", 180),
        ]

        # Define strict background color provided by user
        bg_color_rgb = (18, 45, 74) # #122d4a

        for path, size in icon_configs:
            # 1. Create a base image with the solid background color
            base_img = Image.new("RGB", (size, size), bg_color_rgb)
            
            # 2. Resize the icon to ANY transparent areas will be filled with the background color
            # NO padding, just fill the space.
            
            if cropped_img.mode != 'RGBA':
                cropped_img = cropped_img.convert('RGBA')
                
            resized_icon = cropped_img.resize((size, size), Image.Resampling.LANCZOS)
            
            # 3. Paste the icon onto the background
            # using the icon as a mask is automatic when pasting RGBA onto RGB in PIL? 
            # actually paste(im, box, mask) - if we omit mask it just pastes the pixels. 
            # If resized_icon is RGBA, we want alpha compositing. 
            # paste(image, box, mask) method.
            base_img.paste(resized_icon, (0, 0), resized_icon)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            base_img.save(path, format="PNG")
            print(f"Generated {path} ({size}x{size}) with solid background")
        
        # Optional: Generate favicon.ico (multi-size)
        ico_size = 256
        ico_base = Image.new("RGB", (ico_size, ico_size), bg_color_rgb)
        
        ico_resized = cropped_img.resize((ico_size, ico_size), Image.Resampling.LANCZOS)
        ico_base.paste(ico_resized, (0, 0), ico_resized)
        
        ico_base.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
        print("Generated public/favicon.ico (solid background)")

        print("All icons generated successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate_icons()
