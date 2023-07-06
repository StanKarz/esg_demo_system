import fitz
import re
import string
import nltk
import argparse
import numpy as np
import json
import ssl
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from gensim import corpora
from gensim.models import LdaModel, CoherenceModel
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from scipy.spatial.distance import jensenshannon

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context


def main():
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
        text_str = re.sub(r'[^\w\s]', '', text_str).strip()
        return text_str

    all_text = []
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()

    with fitz.open(file_path) as doc:
        for page in doc:
            text = page.get_text().replace('•', ' ')
            text = text_process(text).replace(
                '\n', ' ').replace('\u2003', ' ').strip()
            all_text.append(text)

    processed_text = []
    for doc in all_text:
        tokens = word_tokenize(doc.lower())
        lemmatized = [lemmatizer.lemmatize(
            token) for token in tokens if token not in string.punctuation]
        no_stops = [token for token in lemmatized if token not in stop_words]
        cleaned_doc = re.sub(r'\d+', '', " ".join(no_stops))
        cleaned_doc = re.sub(' +', ' ', cleaned_doc)
        processed_text.append(cleaned_doc.split())

    # 2. Create the Dictionary and Corpus
    dictionary = corpora.Dictionary(processed_text)
    corpus = [dictionary.doc2bow(doc) for doc in processed_text]

    # Determine the optimal number of topics for LDA
    coherence_scores = []
    for num_topics in range(2, 11):
        model = LdaModel(corpus=corpus, num_topics=num_topics,
                         id2word=dictionary, passes=10, random_state=1)
        coherence = CoherenceModel(
            model=model, texts=processed_text, dictionary=dictionary, coherence='c_v')
        coherence_scores.append((num_topics, coherence.get_coherence()))

    optimal_num_topics = sorted(
        coherence_scores, key=lambda x: x[1], reverse=True)[0][0]

    # 3. Build the LDA model
    lda_model = LdaModel(corpus=corpus,  id2word=dictionary,
                         passes=10, random_state=1)

    # Build LDA model with the optimal number of topics
    lda_model = LdaModel(corpus=corpus, num_topics=optimal_num_topics,
                         id2word=dictionary, passes=10, random_state=1)

    topic_word_distributions = np.array([np.array([tup[1] for tup in lda_model.get_topic_terms(
        topicid)]) for topicid in range(lda_model.num_topics)])

    # Determine the optimal number of clusters using silhouette scores
    silhouette_scores = []
    X = lda_model.get_topics()
    max_clusters = min(11, lda_model.num_topics)
    for n_clusters in range(2, max_clusters):
        kmeans = KMeans(n_clusters=n_clusters, random_state=0)
        cluster_labels = kmeans.fit_predict(X)
        silhouette_avg = silhouette_score(X, cluster_labels)
        silhouette_scores.append((n_clusters, silhouette_avg))

    optimal_num_clusters = sorted(
        silhouette_scores, key=lambda x: x[1], reverse=True)[0][0]

    # Build the final KMeans model
    kmeans = KMeans(n_clusters=optimal_num_clusters, random_state=0)
    cluster_labels = kmeans.fit_predict(X)

    def similarity(dist1, dist2):
        return jensenshannon(dist1, dist2)

    nodes = []
    for topic_id in range(lda_model.num_topics):
        topic_word_distribution = lda_model.get_topic_terms(topic_id)

        # Get the top 5 keywords for each topic
        top_keywords = [dictionary[word_id]
                        for word_id, _ in topic_word_distribution[:10]]

        # Check if top_keywords is a list and contains only strings (keywords)
        if isinstance(top_keywords, list) and all(isinstance(keyword, str) for keyword in top_keywords):
            # Store the top 5 keywords as an array in the node
            nodes.append(
                {'id': topic_id, 'label': f'Topic {topic_id}', 'keywords': top_keywords})
        else:
            print(
                f"Error: Invalid format for top_keywords for Topic {topic_id}")

    # Create nodes and edges
    nodes = []
    edges = []

    for topic_id in range(lda_model.num_topics):
        topic_word_distribution = lda_model.get_topic_terms(topic_id)
        top_keywords = [dictionary[word_id]
                        for word_id, _ in topic_word_distribution[:5]]
        cluster = int(cluster_labels[topic_id])
        nodes.append({'id': topic_id, 'label': f'Topic {topic_id}',
                      'keywords': top_keywords, 'cluster': cluster})

    # Group documents by the main topic
    doc_topic_list = lda_model.get_document_topics(corpus)

    topic_doc_dict = {}

    # Iterate through each document
    for doc_id, doc_topics in enumerate(doc_topic_list):
        # Find the topic with maximum probability for this document
        main_topic = max(doc_topics, key=lambda x: x[1])[0]

        # Append the document to the list of documents for this topic
        topic_doc_dict.setdefault(main_topic, []).append(doc_id)

    graph_data = {"nodes": nodes}

    # Add the document text to the graph_data
    for node in graph_data['nodes']:
        topic_id = node['id']
        # Get document IDs associated with this topic
        doc_ids = topic_doc_dict.get(topic_id, [])
        # Get text for the documents and add to the node in graph_data
        documents = [all_text[doc_id] for doc_id in doc_ids]
        node['documents'] = documents

    # Save graph_data to a JSON file with nodes, keywords and associated document text
    with open('graph_data.json', 'w') as f:
        json.dump(graph_data, f, indent=4)


if __name__ == '__main__':
    main()
