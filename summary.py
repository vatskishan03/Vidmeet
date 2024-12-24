from transformers import pipeline

summarizer = pipeline("summarization", model="knkarthick/MEETING_SUMMARY")
with open("transcription.txt", "r") as file:
    transcription = file.read()

summary = summarizer(transcription, max_length=106, min_length=50, do_sample=False)
print(summary[0]['summary_text'])







