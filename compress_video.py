
import os
import subprocess
import imageio_ffmpeg

def compress_video(input_path, output_path, crf=28):
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using ffmpeg from: {ffmpeg_exe}")
    
    # Check if input exists
    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} not found.")
        return

    # FFmpeg command to compress
    # CRF 28 is a good balance for web (lower quality/size than default 23).
    # Preset 'slow' provides better compression for same quality.
    cmd = [
        ffmpeg_exe,
        '-y', # Overwrite output
        '-i', input_path,
        '-vcodec', 'libx264',
        '-crf', str(crf),
        '-preset', 'slow',
        '-acodec', 'aac', # Ensure audio is AAC (or copy if already)
        '-b:a', '128k',   # Limit audio bitrate
        output_path
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
        print(f"Successfully compressed {input_path} to {output_path}")
        
        orig_size = os.path.getsize(input_path) / (1024*1024)
        new_size = os.path.getsize(output_path) / (1024*1024)
        print(f"Original size: {orig_size:.2f} MB")
        print(f"Compressed size: {new_size:.2f} MB")
        
    except subprocess.CalledProcessError as e:
        print(f"Error during compression: {e}")

if __name__ == "__main__":
    input_file = "Design sans titre.mp4"
    output_file = "Design_sans_titre_compressed.mp4"
    compress_video(input_file, output_file, crf=32) # Aggressive compression
