from faster_whisper import WhisperModel
import sys, os

def transcribe_audio(wav_path: str, meeting_id: str):
    print(f"Starting transcription for meeting {meeting_id}")
    print(f"Input WAV file: {wav_path}")
    
    if not os.path.exists(wav_path):
        print(f"Error: Input file {wav_path} does not exist")
        return

    model = WhisperModel("medium")
    segments, info = model.transcribe(wav_path)
    text = "".join([s.text for s in segments])
    
    # Save transcription
    out_dir = os.path.join(os.getcwd(), "transcriptions")
    os.makedirs(out_dir, exist_ok=True)
    output_path = os.path.join(out_dir, f"{meeting_id}.txt")
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Transcription saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python transcribe.py <wav_path> <meeting_id>")
        sys.exit(1)
        
    wav_file = sys.argv[1]
    meeting_id = sys.argv[2]
    transcribe_audio(wav_file, meeting_id)