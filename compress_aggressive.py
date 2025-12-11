
import os
from PIL import Image

def compress_specific_files():
    files = [
        "ryl.png",
        "fedra.png",
        "AdobeStock_1471865854.jpeg",
        "AdobeStock_1372252180.jpeg",
        "AdobeStock_1258717502.jpeg",
        "AdobeStock_1563364358.jpeg",
        "AdobeStock_1447151152.jpeg",
        "cover bas .png",
        "DSC_5829-scaled.png"
    ]
    
    max_dimension = 1600 # Cap resolution at 1600px which is plenty for web (except full hero, maybe 1920)
    
    for filename in files:
        if not os.path.exists(filename):
            print(f"[NOT FOUND] {filename}")
            continue
            
        try:
            full_path = os.path.abspath(filename)
            original_size = os.path.getsize(full_path)
            
            with Image.open(full_path) as img:
                orig_w, orig_h = img.size
                
                # Calculate new size maintaining aspect ratio
                ratio = min(max_dimension / orig_w, max_dimension / orig_h)
                
                # Check if resizing is needed (only if ratio < 1)
                if ratio < 1:
                    new_w = int(orig_w * ratio)
                    new_h = int(orig_h * ratio)
                    print(f"Resizing {filename}: {orig_w}x{orig_h} -> {new_w}x{new_h}")
                    img = img.resize((new_w, new_h), Image.LANCZOS)
                else:
                    print(f"Skipping resize for {filename}: {orig_w}x{orig_h} is within limits")

                # Save options
                if filename.lower().endswith('.png'):
                    # Convert to P mode (palette) with 128 colors for logo graphics (often enough)
                    # If it's already P, we ensure it's optimized.
                    if img.mode != 'P':
                        img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
                    
                    img.save(full_path, optimize=True)
                
                else: # JPEG
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img.save(full_path, quality=60, optimize=True) # Aggressive 60 quality
            
            new_size = os.path.getsize(full_path)
            saved = original_size - new_size
            print(f"[COMPRESSED] {filename}: {original_size/1024:.2f}KB -> {new_size/1024:.2f}KB (-{(saved/original_size)*100:.1f}%)")
            
        except Exception as e:
            print(f"[ERROR] processing {filename}: {e}")

if __name__ == "__main__":
    compress_specific_files()
