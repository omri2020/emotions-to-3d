from flask import Flask, request, jsonify
from langdetect import detect
from googletrans import Translator, LANGUAGES
from transformers import pipeline
import pandas as pd
import numpy as np
import json
import os
import time
import plotly.graph_objs as go
import plotly.express as px

app = Flask(__name__)

# Initialize the classifier and translator
classifier = pipeline(task="text-classification", model="SamLowe/roberta-base-go_emotions", top_k=None)
translator = Translator()

# Load the Excel file
file_path = os.path.join(os.path.dirname(__file__), 'emotions base vectors.xlsx')
df = pd.read_excel(file_path)

def translate_text(text, src, dest, retries=5, delay=2):
    for attempt in range(retries):
        try:
            translated_text = translator.translate(text, src=src, dest=dest).text
            return translated_text
        except Exception as e:
            print(f"Translation attempt {attempt + 1} failed: {e}")
            time.sleep(delay)
    return None

# Emotions map with coordinates
emotions_map_labels = {
    'admiration': (2, 4),
    'amusement': (3, 3),
    'anger': (5, -5),
    'annoyance': (3, -3),
    'approval': (1, 4),
    'caring': (-2, 3),
    'confusion': (0, -2),
    'curiosity': (1, 2),
    'desire': (4, 3),
    'disappointment': (-3, -4),
    'disapproval': (-2, -4),
    'disgust': (4, -4),
    'embarrassment': (-1, -3),
    'excitement': (5, 5),
    'fear': (5, -3),
    'gratitude': (2, 3),
    'grief': (-5, -5),
    'joy': (4, 5),
    'love': (3, 4),
    'nervousness': (2, -2),
    'optimism': (1, 5),
    'pride': (3, 2),
    'realization': (0, 1),
    'relief': (-1, 2),
    'remorse': (-3, -3),
    'sadness': (-4, -5),
    'surprise': (2, 1),
    'neutral': (0, 0)
}

# Create a color list
colors = px.colors.qualitative.Plotly

# Assign a unique color for each emotion
emotion_colors = {emotion: colors[i % len(colors)] for i, emotion in enumerate(emotions_map_labels.keys())}

def get_coords(emotion_pred_vector):
    # Transform emotions_map_labels values into a (28, 2) array
    emotions_matrix = np.array(list(emotions_map_labels.values()))

    # Perform np.dot operation between the input vector and emotions_matrix
    result = np.dot(emotion_pred_vector, emotions_matrix)

    # Create the scatter plot
    fig = go.Figure()

    # Add label points
    for emotion in emotions_map_labels.keys():
        fig.add_trace(go.Scatter(
            x=[emotions_map_labels[emotion][0]],
            y=[emotions_map_labels[emotion][1]],
            mode='markers+text',
            text=[emotion],
            textposition='top center',
            marker=dict(size=10, color=emotion_colors[emotion], symbol='circle'),
            name=f'{emotion} label'
        ))

    # Add the result point with a different marker notation
    fig.add_trace(go.Scatter(
        x=[result[0][0]],
        y=[result[0][1]],
        mode='markers+text',
        text=['Prediction'],
        textposition='top center',
        marker=dict(size=12, color='black', symbol='x'),
        name='Prediction'
    ))

    # Set the title and axis labels
    fig.update_layout(
        title='Emotions Map Scatter Plot with Predictions and Labels',
        xaxis_title='Energy',
        yaxis_title='Positivity',
        xaxis=dict(range=[-7, 7]),
        yaxis=dict(range=[-7, 7]),
        showlegend=True
    )


    # Return the result coordinates
    return result[0][0], result[0][1]

@app.route('/process-text', methods=['POST'])
def process_text():
    data = request.get_json()
    input_text = data['text']

    # Detect the language of the input text
    detected_language = detect(input_text)
    print("--------------------")
    print(f"Detected language: {detected_language}")
    print("--------------------")
    
    # Translate Hebrew text to English if necessary
    translated_text = input_text
    if detected_language == 'he':
        translated_text = translate_text(input_text, src='he', dest='en')
        if translated_text is None:
            print("Translation failed after retries.")
            return jsonify({"error": "Translation failed"}), 500
        print(f"Translated text: {translated_text}")

    # Get model outputs
    model_outputs = classifier(translated_text)

    # Create a list of emotions in A-Z order
    emotions = ["admiration", "amusement", "anger", "annoyance", "approval", "caring", "confusion", "curiosity", "desire",
                "disappointment", "disapproval", "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
                "joy", "love", "nervousness", "optimism", "pride", "realization", "relief", "remorse", "sadness",
                "surprise", "neutral"]

    # Create a list of parameters
    parameters = ["#_layers", "end_domain_spine", "radius", "#_edges", "#_div_points", "layers_power", "random_range",
                  "factor1", "scale_Y1", "factor2", "scale_Y2", "factor3", "scale_Y3", "index_of_circle",
                  "points_div_count", "end_domain_(noisiness)", "wide", "#_of_clusters", "texture_random_range"]

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
    # Rows from 'admiration' to 'neutral'
    start_row = df.index[df['parameter'] == 'admiration'][0]
    end_row = df.index[df['parameter'] == 'neutral'][0] + 1

    # Select the relevant rows and columns (excluding the first column 'parameter')
    # Ensure all data is numeric by using .to_numpy() for conversion
    base_matrix = df.iloc[start_row:end_row, 1:].to_numpy(dtype='float64')

    # Given vector of probabilities (weights)
    weights = np.array(normalized_scores_list).reshape(28, 1)  # Ensure it's a column vector (28x1)

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
    coords = get_coords(emotion_pred_vector)
    print(f"Generated coordinates: {coords}")

    # Create a dictionary to return the parameters, feelings, and coordinates
    response_dict = {
        "parameters": result_dict,
        "feelings": {emotion: normalized_scores_list[i] for i, emotion in enumerate(emotions) if normalized_scores_list[i] > 0},
        "coordinates": {"x": coords[0], "y": coords[1]}
    }

    return jsonify(response_dict)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
