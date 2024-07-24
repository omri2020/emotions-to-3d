from langdetect import detect
from googletrans import Translator
from transformers import pipeline
import pandas as pd
import numpy as np
import json
import os

# Initialize the classifier and translator
classifier = pipeline(task="text-classification", model="SamLowe/roberta-base-go_emotions", top_k=None)
translator = Translator()

# Load the Excel file
file_path = os.path.join(os.path.dirname(__file__), 'emotions base vectors.xlsx')
df = pd.read_excel(file_path)

# Example text in Hebrew or English
input_text = ["היה לי שבוע נהדר ונהניתי מאוד עם המשפחה שלי בחופשה בהולנד"]

# Detect the language of the input text
detected_language = detect(input_text[0])
print("--------------------")
print(f"Detected language: {detected_language}")
print("--------------------")

# Translate Hebrew text to English if necessary
if (detected_language == 'he'):
    translated_text = translator.translate(input_text[0], src='he', dest='en').text
    print(f"Translated text: {translated_text}")
else:
    translated_text = input_text[0]

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

# Print the output in map format
print("\nEmotions and their scores in A-Z order:")
for emotion, score in zip(emotions, normalized_scores_list):
    print(f"{emotion}: {score:.4f}")
print("--------------------")

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
