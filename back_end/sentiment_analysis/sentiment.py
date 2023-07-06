
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import fitz
import json

nltk.download('vader_lexicon')

CHUNK_SIZE = 100  # Number of words per chunk


def analyze_sentiment(file_path):
    all_text = []

    with fitz.open(file_path) as doc:
        for page in doc:
            text = page.get_text()
            text = text.replace('•', ' ')
            text = text.replace('\n', ' ')
            text = text.strip()
            all_text.append(text)

    # Concatenate all text and split into words
    all_text = " ".join(all_text).split()

    # Split text into equal chunks
    text_chunks = [" ".join(all_text[i:i+CHUNK_SIZE])
                   for i in range(0, len(all_text), CHUNK_SIZE)]

    # Analyze sentiment for each chunk
    sid = SentimentIntensityAnalyzer()
    sentiment_scores = []
    for chunk in text_chunks:
        scores = sid.polarity_scores(chunk)
        sentiment_scores.append(scores)

    overall_sentiment = {
        'text': text_chunks,
        'neg': [score['neg'] for score in sentiment_scores],
        'neu': [score['neu'] for score in sentiment_scores],
        'pos': [score['pos'] for score in sentiment_scores],
        'compound': [score['compound'] for score in sentiment_scores]
    }

    return overall_sentiment


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python sentiment.py <pdf-file-path>")
        sys.exit(1)
    file_path = sys.argv[1]
    sentiment = analyze_sentiment(file_path)
    print(json.dumps(sentiment))
