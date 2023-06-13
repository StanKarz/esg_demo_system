import matplotlib.colors as mcolors
from random import randint
import random
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from nltk.stem import WordNetLemmatizer
from flask import Flask, jsonify, render_template
from flask_cors import CORS
import re
import os
import sys
import json
import fitz
import string
import ssl
import matplotlib.colors as mcolors
import nltk
nltk.download('omw-1.4')

environmental_words = [
    'clean', 'environmental', 'epa', 'sustainability', 'climate', 'warming', 'biofuels', 'biofuel',
    'green', 'renewable', 'solar', 'stewardship', 'wind', 'emission', 'emissions', 'ghg', 'ghgs',
    'greenhouse', 'atmosphere', 'emit', 'agriculture', 'deforestation', 'pesticide', 'pesticides',
    'wetlands', 'zoning', 'biodiversity', 'species', 'wilderness', 'wildlife', 'freshwater',
    'groundwater', 'water', 'cleaner', 'cleanup', 'coal', 'contamination', 'fossil', 'resource',
    'air', 'carbon', 'nitrogen', 'pollution', 'superfund', 'biphenyls', 'hazardous', 'householding',
    'pollutants', 'printing', 'recycling', 'toxic', 'waste', 'wastes', 'weee', 'recycle']
social_words = [
    'citizen', 'citizens', 'csr', 'disabilities', 'disability', 'disabled', 'human', 'nations',
    'social', 'un', 'veteran', 'veterans', 'vulnerable', 'children', 'epidemic', 'health', 'healthy',
    'ill', 'illness', 'pandemic', 'childbirth', 'drug', 'medicaid', 'medicare', 'medicine', 'medicines',
    'hiv', 'alcohol', 'drinking', 'bugs', 'conformance', 'defects', 'fda', 'inspection', 'inspections',
    'minerals', 'standardization', 'warranty', 'dignity', 'discriminate', 'discriminated', 'discriminating',
    'discrimination', 'equality', 'freedom', 'humanity', 'nondiscrimination', 'sexual', 'communities',
    'community', 'expression', 'marriage', 'privacy', 'peace', 'bargaining', 'eeo', 'fairness', 'fla',
    'harassment', 'injury', 'labor', 'overtime', 'ruggie', 'sick', 'wage', 'wages', 'workplace', 'bisexual',
    'diversity', 'ethnic', 'ethnically', 'ethnicities', 'ethnicity', 'female', 'females', 'gay', 'gays',
    'gender', 'genders', 'homosexual', 'immigration', 'lesbian', 'lesbians', 'lgbt', 'minorities',
    'minority', 'ms', 'race', 'racial', 'religion', 'religious', 'sex', 'transgender', 'woman', 'women',
    'occupational', 'safe', 'safely', 'safety', 'ilo', 'labour', 'eicc', 'endowment', 'endowments',
    'people', 'philanthropic', 'philanthropy', 'socially', 'societal', 'society', 'welfare', 'charitable',
    'charities', 'charity', 'donate', 'donated', 'donates', 'donating', 'donation', 'donations', 'donors',
    'foundation', 'foundations', 'gift', 'gifts', 'nonprofit', 'poverty', 'courses', 'educate', 'educated',
    'educates', 'educating', 'education', 'educational', 'learning', 'mentoring', 'scholarships', 'teach',
    'teacher', 'teachers', 'teaching', 'training', 'employ', 'employment', 'headcount', 'hire', 'hired',
    'hires', 'hiring', 'staffing', 'unemployment']
governance_words = [
    'align', 'aligned', 'aligning', 'alignment', 'aligns', 'bylaw', 'bylaws', 'charter',
    'charters', 'culture', 'death', 'duly', 'parents', 'independent', 'compliance', 'conduct',
    'conformity', 'governance', 'misconduct', 'parachute', 'parachutes', 'perquisites', 'plane',
    'planes', 'poison', 'retirement', 'approval', 'approvals', 'approve', 'approved', 'approves',
    'approving', 'assess', 'assessed', 'assesses', 'assessing', 'assessment', 'assessments',
    'audit', 'audited', 'auditing', 'auditor', 'auditors', 'audits', 'control', 'controls', 'coso',
    'detect', 'detected', 'detecting', 'detection', 'evaluate', 'evaluated', 'evaluates', 'evaluating',
    'evaluation', 'evaluations', 'examination', 'examinations', 'examine', 'examined', 'examines',
    'examining', 'irs', 'oversee', 'overseeing', 'oversees', 'oversight', 'review', 'reviewed',
    'reviewing', 'reviews', 'rotation', 'test', 'tested', 'testing', 'tests', 'treadway', 'backgrounds',
    'independence', 'leadership', 'nomination', 'nominations', 'nominee', 'nominees', 'perspectives',
    'qualifications', 'refreshment', 'skill', 'skills', 'succession', 'tenure', 'vacancies', 'vacancy',
    'appreciation', 'award', 'awarded', 'awarding', 'awards', 'bonus', 'bonuses', 'cd', 'compensate',
    'compensated', 'compensates', 'compensating', 'compensation', 'eip', 'iso', 'isos', 'payout', 'payouts',
    'pension', 'prsu', 'prsus', 'recoupment', 'remuneration', 'reward', 'rewarding', 'rewards', 'rsu',
    'rsus', 'salaries', 'salary', 'severance', 'vest', 'vested', 'vesting', 'vests', 'ballot', 'ballots',
    'cast', 'consent', 'elect', 'elected', 'electing', 'election', 'elections', 'elects', 'nominate',
    'nominated', 'plurality', 'proponent', 'proponents', 'proposal', 'proposals', 'proxies', 'quorum',
    'vote', 'voted', 'votes', 'voting', 'brother', 'clicking', 'conflict', 'conflicts', 'family',
    'grandchildren', 'grandparent', 'grandparents', 'inform', 'insider', 'insiders', 'inspector',
    'inspectors', 'interlocks', 'nephews', 'nieces', 'posting', 'relatives', 'siblings', 'sister',
    'son', 'spousal', 'spouse', 'spouses', 'stepchildren', 'stepparents', 'transparency', 'transparent',
    'visit', 'visiting', 'visits', 'webpage', 'website', 'attract', 'attracting', 'attracts', 'incentive',
    'incentives', 'interview', 'interviews', 'motivate', 'motivated', 'motivates', 'motivating',
    'motivation', 'recruit', 'recruiting', 'recruitment', 'retain', 'retainer', 'retainers', 'retaining',
    'retention', 'talent', 'talented', 'talents', 'cobc', 'ethic', 'ethical', 'ethically', 'ethics',
    'honesty', 'bribery', 'corrupt', 'corruption', 'crimes', 'embezzlement', 'grassroots', 'influence',
    'influences', 'influencing', 'lobbied', 'lobbies', 'lobby', 'lobbying', 'lobbyist', 'lobbyists',
    'whistleblower', 'announce', 'announced', 'announcement', 'announcements', 'announces', 'announcing',
    'communicate', 'communicated', 'communicates', 'communicating', 'erm', 'fairly', 'integrity', 'liaison',
    'presentation', 'presentations', 'sustainable', 'asc', 'disclose', 'disclosed', 'discloses', 'disclosing',
    'disclosure', 'disclosures', 'fasb', 'gaap', 'objectivity', 'press', 'sarbanes', 'engagement',
    'engagements', 'feedback', 'hotline', 'investor', 'invite', 'invited', 'mail', 'mailed', 'mailing',
    'mailings', 'notice', 'relations', 'stakeholder', 'stakeholders', 'compact', 'ungc']

# Preprocessing and data cleaning functions


def cleanup_text(text):
    # remove non-breaking spaces
    text = text.replace(u'\xa0', u' ')
    # remove bullet points
    text = text.replace(u'•', u'')
    # remove any non-alphanumeric, non-hyphen characters
    text = re.sub(r'[^A-Za-z0-9- ]', '', text)
    # remove words with hyphens, as they could be compound words
    text = re.sub(r'\w+-\w+', '', text)
    return text


def text_process(text_str):
    if ' ' in text_str:
        text_str = text_str.replace(' ', ' ')
    if '•' in text_str:
        text_str = text_str.replace('•', ' ')
    text_str = re.sub(' +', ' ', text_str)
    if '-' in text_str:
        text_str = text_str.replace(
            '- ', '').replace(' -', '').replace(' ,', ',').replace(' .', '.')
    text_str = text_str.strip()
    return text_str


try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('wordnet')


# Generating word cloud
def create_word_cloud(pdf_path, word_category):
    all_text = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text = page.get_text()
            text = text.replace('•', ' ')
            text = text.replace('\n', ' ')
            text = text.replace('\u2003', ' ')
            all_text.append(text)

    lemmatizer = WordNetLemmatizer()

    full_text = ' '.join(all_text).lower()
    full_text = ''.join(
        [char for char in full_text if char not in string.punctuation])
    full_text = re.sub(' +', ' ', full_text)  # remove excessive spaces
    full_text_words = full_text.split()
    full_text_words = [
        word for word in full_text_words if word.strip() in word_category]
    full_text_words = [lemmatizer.lemmatize(word) for word in full_text_words]
    fdist = nltk.FreqDist(full_text_words)
    word_freq = dict(fdist)
    return word_freq


def main():
    file_path = sys.argv[1]
    category = sys.argv[2]

    word_categories = {
        "environmental": environmental_words,
        "social": social_words,
        "governance": governance_words
    }

    if category not in word_categories:
        print(json.dumps(
            {"error": "Invalid category. Choose from 'environmental', 'social', 'governance'."}))
        # sys.exit(1)

    word_freq = create_word_cloud(file_path, word_categories[category])
    print(json.dumps(word_freq))


if __name__ == "__main__":
    main()


# # Flask server routes
# app = Flask(__name__)
# CORS(app)


# @app.route('/')
# def index():
#     return render_template('word_cloud.html')


# @app.route("/word-cloud/<category>")
# def word_cloud(category):
#     file_path = '../esg_reports/2022_Apple_ESG_Report.pdf'
#     word_categories = {
#         "environmental": environmental_words,
#         "social": social_words,
#         "governance": governance_words
#     }
#     if category not in word_categories:
#         return jsonify({"error": "Invalid category. Choose from 'environmental', 'social', 'governance'."}), 400

#     word_freq = create_word_cloud(file_path, word_categories[category])
#     return jsonify(word_freq)


# if __name__ == "__main__":
#     app.run(host='127.0.0.1', port=8000, debug=True)
