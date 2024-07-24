from flask import Flask, request, jsonify
from langdetect import detect, DetectorFactory, LangDetectException
from deep_translator import GoogleTranslator
from transformers import pipeline
import pandas as pd
import numpy as np
import json
import re
from googleapiclient import discovery
import os
import time
from getObjCoords import get_coords

API_KEY = 'AIzaSyDQ_dEh30wc7U76aOMsagxTRBRKTfVQXTI'

# Ensure deterministic results from langdetect
DetectorFactory.seed = 0

# Initialize the Flask app and classifier
app = Flask(__name__)
classifier = pipeline(task="text-classification", model="SamLowe/roberta-base-go_emotions", top_k=None)

# Load the CSV file
file_path = os.path.join(os.path.dirname(__file__), 'emotions base vectors - Vectors.csv')
df = pd.read_csv(file_path)

# Create a list of emotions in A-Z order
emotions = ["admiration", "amusement", "anger", "annoyance", "approval", "caring", "confusion", "curiosity", "desire",
            "disappointment", "disapproval", "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
            "joy", "love", "nervousness", "optimism", "pride", "realization", "relief", "remorse", "sadness",
            "surprise", "neutral"]

# Create a list of parameters
parameters = ["#_layers", "end_domain_spine", "radius", "#_edges", "#_div_points", "layers_power", "random_range",
              "factor1", "scale_Y1", "factor2", "scale_Y2", "factor3", "scale_Y3", "index_of_circle",
              "points_div_count", "end_domain_(noisiness)", "wide", "#_of_clusters", "texture_random_range"]

def is_valid_text(text):
    # Check if text contains any letters
    if not re.search(r'[a-zA-Zא-ת]', text):
        return False
    # Check if text is not just gibberish (simple heuristic)
    if len(text.split()) == 1 and not re.match(r'^[a-zA-Zא-ת]+$', text):
        return False
    return True

def detect_hate_speech(text):
    client = discovery.build(
        "commentanalyzer",
        "v1alpha1",
        developerKey=API_KEY,
        discoveryServiceUrl="https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1",
        static_discovery=False,
    )
    analyze_request = {
        'comment': {'text': text},
        'requestedAttributes': {'TOXICITY': {}, 'SEVERE_TOXICITY': {}, 'IDENTITY_ATTACK': {}, 'INSULT': {}, 'PROFANITY': {}, 'THREAT': {}}
    }
    response = client.comments().analyze(body=analyze_request).execute()
    print(json.dumps(response, indent=2))
    is_offensive = any(
        score['summaryScore']['value'] > 0.45
        for score in response['attributeScores'].values()
    )
    print("Is the text offensive?", is_offensive)
    return is_offensive

def translate_text(text, src_lang, target_lang='en'):
    try:
        if src_lang == 'he':
            src_lang = 'iw'  # Correcting language code for Hebrew
        translated_text = GoogleTranslator(source=src_lang, target=target_lang).translate(text)
        return translated_text
    except Exception as e:
        print(f"Error translating text: {e}")
        return None

@app.route('/process-text', methods=['POST'])
def process_text():
    data = request.get_json()
    input_text = data['text']

    if not is_valid_text(input_text):
        return jsonify({"error": "The input text is incorrect or meaningless."}), 400

    try:
        detected_language = detect(input_text)
        print("--------------------")
        print(f"Detected language: {detected_language}")
        print("--------------------")

        translated_text = input_text
        if detected_language != 'en':
            translated_text = translate_text(input_text, src_lang=detected_language, target_lang='en')
            if translated_text is None:
                return jsonify({"error": "Translation failed"}), 500
            print(f"Translated text: {translated_text}")

            if not is_valid_text(translated_text):
                return jsonify({"error": "The translated text is incorrect or meaningless."}), 400

        # Detect hate speech
        if detect_hate_speech(translated_text):
            return jsonify({"error": "The text contains offensive content."}), 400

        # Get model outputs
        model_outputs = classifier(translated_text)

        # Create a dictionary to store the scores in A-Z order
        emotion_scores = {emotion: 0.0 for emotion in emotions}

        # Fill the dictionary with the model output scores
        for output in model_outputs[0]:
            emotion_scores[output['label']] = output['score']

        # Convert the dictionary to a list of scores in A-Z order
        scores_list = [emotion_scores[emotion] for emotion in emotions]

        # Normalize the scores so that their sum is 1
        total_score = sum(scores_list)
        normalized_scores_list = [score / total_score for score in scores_list]

        # Add the scores of the 23 lowest numbers to the biggest number in the list, and reset them to 0
        sorted_indices = np.argsort(normalized_scores_list)  # Get the indices that would sort the list
        lowest_indices = sorted_indices[:23]  # Get the indices of the 23 lowest scores
        highest_index = sorted_indices[-1]  # Get the index of the highest score

        # Add the values of the 23 lowest scores to the highest score
        for i in lowest_indices:
            normalized_scores_list[highest_index] += normalized_scores_list[i]
            normalized_scores_list[i] = 0  # Reset the 23 lowest scores to 0

        # Extract the relevant rows and columns
        start_row = df.index[df['parameter'] == 'admiration'][0]
        end_row = df.index[df['parameter'] == 'neutral'][0] + 1

        # Select the relevant rows and columns (excluding the first column 'parameter')
        base_matrix = df.iloc[start_row:end_row, 1:].to_numpy(dtype='float64')

        # Given vector of probabilities (weights)
        weights = np.array(normalized_scores_list).reshape(28, 1)

        # Perform the matrix multiplication
        result_vector = np.dot(weights.T, base_matrix)

        # Convert result_vector to a dictionary with parameters as keys, formatted to 4 decimal places
        result_dict = {parameters[i]: float(f"{result_vector[0][i]:.4f}") for i in range(len(parameters))}

        # Convert the dictionary to JSON format
        result_vector_json = json.dumps(result_dict, indent=4)
        print("\nResult Vector in JSON format:")
        print(result_vector_json)

        # Generate coordinates based on the feelings vector
        emotion_pred_vector = np.array(normalized_scores_list).reshape(1, -1)
        coords = get_coords(weights)
        print(f"Generated coordinates: {coords}")

        # Create a dictionary to return the parameters, feelings, and coordinates
        response_dict = {
            "parameters": result_dict,
            "feelings": {emotion: normalized_scores_list[i] for i, emotion in enumerate(emotions) if normalized_scores_list[i] > 0},
            "coordinates": {"x": coords[0], "y": coords[1]}
        }

        return jsonify(response_dict)

    except LangDetectException:
        return jsonify({"error": "The input text could not be detected as a valid language."}), 400
    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
