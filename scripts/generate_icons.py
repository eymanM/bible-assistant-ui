import os
from PIL import Image

def generate_icons():
    # Source image path
    source_path = "source_icon.png"
    
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found.")
        return

    try:
        img = Image.open(source_path)
        
        # Determine strict bounding box of non-transparent pixels
        bbox = img.getbbox()
        if not bbox:
            print("Error: Image is completely transparent.")
            return
            
        # Crop the image to the bounding box
        cropped_img = img.crop(bbox)
        print(f"Cropped image from {img.size} to {cropped_img.size}")

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

        for path, size in icon_configs:
            # Resize with high quality resampling (LANCZOS)
            resized_img = cropped_img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Ensure directory exists for the specific path (mostly for apple icon in root)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            resized_img.save(path, format="PNG")
            print(f"Generated {path} ({size}x{size})")
        
        # Optional: Generate favicon.ico (multi-size)
        cropped_img.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
        print("Generated public/favicon.ico")

        print("All icons generated successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate_icons()
