
import os
from PIL import Image

def get_size_mb(path):
    return os.path.getsize(path) / (1024 * 1024)

def compress_images(root_dir):
    total_saved = 0
    extensions = ('.jpg', '.jpeg', '.png', '.webp')
    
    print(f"Scanning {root_dir} for images...")
    
    for subdir, dirs, files in os.walk(root_dir):
        # Skip hidden directories and node_modules
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        
        for file in files:
            if file.lower().endswith(extensions):
                filepath = os.path.join(subdir, file)
                
                try:
                    original_size = os.path.getsize(filepath)
                    # Skip files smaller than 100KB to avoid quality loss on icons/logos
                    if original_size < 100 * 1024: 
                        continue
                        
                    with Image.open(filepath) as img:
                        # Force RGB for JPEGs (handle RGBA PNGs converting to JPG error if any, but we keep format)
                        format = img.format
                        
                        # Optimization options
                        save_args = {'optimize': True}
                        
                        if format == 'JPEG':
                            save_args['quality'] = 85
                            save_args['progressive'] = True
                        elif format == 'PNG':
                            # optimizing PNGs (Pillow isn't amazing at this but 'optimize=True' helps)
                            pass
                        elif format == 'WEBP':
                            save_args['quality'] = 85
                        
                        # Save to temp file to check size
                        temp_path = filepath + ".temp"
                        img.save(temp_path, format=format, **save_args)
                        
                        compressed_size = os.path.getsize(temp_path)
                        
                        if compressed_size < original_size:
                            os.replace(temp_path, filepath)
                            saved = original_size - compressed_size
                            total_saved += saved
                            print(f"[COMPRESSED] {file}: {original_size/1024:.2f}KB -> {compressed_size/1024:.2f}KB (-{(saved/original_size)*100:.1f}%)")
                        else:
                            os.remove(temp_path)
                            print(f"[SKIPPED] {file}: Cannot compress further without quality loss")
                            
                except Exception as e:
                    print(f"[ERROR] Could not process {filepath}: {e}")

    print(f"\nTotal space saved: {total_saved / (1024*1024):.2f} MB")

if __name__ == "__main__":
    compress_images(".")
