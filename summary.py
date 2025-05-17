# from transformers import pipeline

# def summarize_text(text: str):
#     # Dynamically set max_length relative to input size
#     word_count = len(text.split())
#     max_len = min(106, max(100, word_count))  

#     summarizer = pipeline("summarization", model="knkarthick/MEETING_SUMMARY")
#     summary = summarizer(text, max_length=max_len, min_length=20, do_sample=False)
#     return summary[0]['summary_text']

# with open("transcription.txt", "r") as file:
#     transcription = file.read()

# print(summarize_text(transcription))

from transformers import pipeline
import torch

def summarize_text(text: str):
    # Verify CUDA is available
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    
    summarizer = pipeline(
        "summarization",
        model="knkarthick/MEETING_SUMMARY",
        device=0 if torch.cuda.is_available() else -1
    )
    
    summary = summarizer(text, max_length=250, min_length=20, do_sample=False)
    return summary[0]['summary_text']

with open("transcription.txt", "r") as file:
    transcription = file.read()

print(summarize_text(transcription))

