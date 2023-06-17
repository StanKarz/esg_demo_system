import fitz
import re
import string
import nltk
import argparse
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from gensim import corpora
from gensim.models import LdaModel
import pyLDAvis.gensim_models
import ssl
import os

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')

# Argument parser
parser = argparse.ArgumentParser()
parser.add_argument('file_path', type=str, help='Path of PDF file')
args = parser.parse_args()

# Fetch the argument
file_path = args.file_path


def text_process(text_str):
    # handle punctuation and special characters
    text_str = re.sub(r'[^\w\s]', '', text_str)
    if '-' in text_str:
        text_str = text_str.replace(
            '- ', '').replace(' -', '').replace(' ,', ',').replace(' .', '.')
    text_str = text_str.strip()
    return text_str


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
    # remove digits from each document
    cleaned_doc = re.sub(r'\d+', '', cleaned_doc)
    # remove extra spaces from each document
    cleaned_doc = re.sub(' +', ' ', cleaned_doc)
    processed_text.append(cleaned_doc)

doc_list = [doc.split() for doc in processed_text]

# 1. Convert into list of tokens
doc_list = [doc.split() for doc in processed_text]

# 2. Create the Dictionary and Corpus
dictionary = corpora.Dictionary(doc_list)
corpus = [dictionary.doc2bow(doc) for doc in doc_list]

# 3. Build the LDA model
lda_model = LdaModel(corpus=corpus,  id2word=dictionary,
                     passes=10, random_state=1)

# 4. Visualize the topics
vis = pyLDAvis.gensim_models.prepare(lda_model, corpus, dictionary)
pyLDAvis_html = pyLDAvis.prepared_data_to_html(vis)

with open(os.path.join("topics_data", os.path.splitext(os.path.basename(file_path))[0] + ".html"), "w") as f:
    f.write(pyLDAvis_html)
