
import os
from pypdf import PdfReader, PdfWriter

def compress_pdf(input_path):
    try:
        if not os.path.exists(input_path):
            print(f"[NOT FOUND] {input_path}")
            return

        reader = PdfReader(input_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        # Basic lossless compression
        for page in writer.pages:
            page.compress_content_streams()

        output_path = input_path + ".temp"
        
        with open(output_path, "wb") as f:
            writer.write(f)

        original_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)

        if new_size < original_size:
            os.replace(output_path, input_path)
            print(f"[COMPRESSED] {os.path.basename(input_path)}: {original_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB (-{((original_size-new_size)/original_size)*100:.1f}%)")
        else:
            os.remove(output_path)
            print(f"[SKIPPED] {os.path.basename(input_path)}: No reduction (New: {new_size/1024/1024:.2f}MB)")

    except Exception as e:
        print(f"[ERROR] {os.path.basename(input_path)}: {e}")

if __name__ == "__main__":
    files = [
        "assets/docs/Booklet-Blue-Africa-Summit-2025.pdf",
        "assets/docs/Brochure-Blue-Africa-Summit-2025.pdf",
        "assets/docs/brochure-forum-Franc_ais.pdf",
        "assets/docs/Concept-note-BAS-2025.pdf",
        "assets/docs/Declaration-de-Tanger-2025-FR.pdf",
        "assets/docs/La-Déclaration-de-Bizerte-2025-FR-.docx-7.pdf",
        "assets/docs/Tangier-Declaration-–-Blue-Africa-Summit-2025.docx.pdf"
    ]
    
    print("Compressing PDFs...")
    for f in files:
        compress_pdf(f)
