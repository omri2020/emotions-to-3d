
import plotly.graph_objs as go
import plotly.express as px
import numpy as np

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
    result = np.dot(emotion_pred_vector.T, emotions_matrix)

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
