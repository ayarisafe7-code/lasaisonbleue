
import os
import pikepdf

def compress_pdf_pikepdf(input_path):
    if not os.path.exists(input_path):
        print(f"[NOT FOUND] {input_path}")
        return

    output_path = input_path + ".optimized.pdf"
    
    try:
        pdf = pikepdf.open(input_path)
        
        # Save with object stream compression and removing unused resources
        pdf.save(output_path, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
        
        original_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)
        
        if new_size < original_size:
            os.replace(output_path, input_path)
            print(f"[COMPRESSED] {os.path.basename(input_path)}: {original_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB (-{((original_size-new_size)/original_size)*100:.1f}%)")
        else:
            os.remove(output_path)
            print(f"[SKIPPED] {os.path.basename(input_path)}: No reduction (New: {new_size/1024/1024:.2f}MB)")
            
    except Exception as e:
        if os.path.exists(output_path):
            os.remove(output_path)
        print(f"[ERROR] {os.path.basename(input_path)}: {e}")

if __name__ == "__main__":
    files = [
        "assets/docs/Booklet-Blue-Africa-Summit-2025.pdf",
        "assets/docs/Brochure-Blue-Africa-Summit-2025.pdf",
        "assets/docs/brochure-forum-Franc_ais.pdf",
        "assets/docs/Concept-note-BAS-2025.pdf",
        "assets/docs/La-Déclaration-de-Bizerte-2025-FR-.docx-7.pdf"
    ]
    
    print("Optimization with pikepdf...")
    for f in files:
        compress_pdf_pikepdf(f)
