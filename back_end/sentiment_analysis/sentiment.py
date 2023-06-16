from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import ssl
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import fitz
import string
import json

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('punkt')
nltk.download('vader_lexicon')


def text_process(text_str):
    text_str = re.sub(r'[^\w\s]', '', text_str)
    if '-' in text_str:
        text_str = text_str.replace(
            '- ', '').replace(' -', '').replace(' ,', ',').replace(' .', '.')
    text_str = text_str.strip()
    return text_str


def analyze_sentiment(file_path):
    all_text = []
    stop_words = set(stopwords.words('english'))

    with fitz.open(file_path) as doc:
        for page in doc:
            text = page.get_text()
            text = text.replace('•', ' ')
            text = text_process(text)
            text = text.replace('\n', ' ')
            text = text.replace('\u2003', ' ')
            text = text.strip()
            all_text.append(text)

    lemmatizer = WordNetLemmatizer()
    processed_text = []

    for doc in all_text:
        tokens = word_tokenize(doc.lower())
        lemmatized = [lemmatizer.lemmatize(
            token) for token in tokens if token not in string.punctuation]
        no_stops = [token for token in lemmatized if token not in stop_words]
        cleaned_doc = " ".join(no_stops)
        cleaned_doc = re.sub(r'\d+', '', cleaned_doc)
        cleaned_doc = re.sub(' +', ' ', cleaned_doc)
        processed_text.append(cleaned_doc)

    sid = SentimentIntensityAnalyzer()
    sentiment_scores = []
    for sentence in processed_text:
        scores = sid.polarity_scores(sentence)
        sentiment_scores.append(scores)

    overall_sentiment = {
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
