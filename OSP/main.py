import streamlit as st
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from PIL import Image

# ---------------------------
# Page Config
# ---------------------------
st.set_page_config(
    page_title="OsteoVision",
    layout="wide",
    page_icon="🦴"
)

IMAGE_SIZE = 224

# ---------------------------
# Load ALL MODELS (ENSEMBLE)
# ---------------------------
@st.cache_resource
def load_all_models():
    model_files = [
        "cnn_model_0.h5",
        "cnn_model_1.h5",
        "cnn_model_2.h5",
        "cnn_model_3.h5",
        "cnn_model_4.h5"
    ]
    models = [load_model(m, compile=False) for m in model_files]
    return models

models = load_all_models()

# ---------------------------
# Image Preprocessing
# ---------------------------
def preprocess_image(uploaded_file):
    img = load_img(uploaded_file, target_size=(IMAGE_SIZE, IMAGE_SIZE))
    img_array = img_to_array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

# ---------------------------
# SOFT VOTING ENSEMBLE with individual thresholds
# ---------------------------
def ensemble_predict_with_thresholds(models, img_array, thresholds, weights=None):
    """
    models      : list of Keras models
    img_array   : preprocessed image
    thresholds  : list of thresholds for each model
    weights     : optional array of weights for each model
    """
    adjusted_probs = []

    for i, model in enumerate(models):
        pred = model.predict(img_array, verbose=0)
        # Get probability of osteoporosis
        if pred.shape[-1] == 1:
            prob = float(pred[0][0])
        else:
            prob = float(pred[0][1])

        # Adjust probability relative to model threshold
        # Positive if above threshold, negative if below (center around 0.5)
        adjusted_prob = max(0.0, (prob - thresholds[i]) / (1 - thresholds[i])) if prob >= thresholds[i] else min(1.0, prob / thresholds[i])
        adjusted_probs.append(adjusted_prob)

    adjusted_probs = np.array(adjusted_probs)

    # Weighted soft voting
    if weights is not None:
        final_prob = np.sum(adjusted_probs * weights) / np.sum(weights)
    else:
        final_prob = adjusted_probs.mean()

    final_label = "Osteoporosis" if final_prob >= 0.45 else "Normal"
    confidence = final_prob if final_label == "Osteoporosis" else 1 - final_prob

    return final_label, confidence

# ---------------------------
# Ensemble Weights & Thresholds
# ---------------------------
weights = np.array([1.0, 1.0, 1.1, 1.0, 1.4])
thresholds = [0.65, 0.35, 0.60, 0.50, 0.45]

# ---------------------------
# UI Styling
# ---------------------------
st.markdown(
    """
    <style>
    .main .block-container {
        max-width: 900px;
        padding-top: 20px;
    }
    header, footer {visibility: hidden;}
    .title {
        font-size: 2.1rem;
        font-weight: 800;
        text-align: center;
        color: #2563eb;
    }
    .subtitle {
        text-align: center;
        color: #6b7280;
        margin-bottom: 16px;
    }
    .result-card {
        padding: 20px;
        background: #f9fafb;
        border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        width: 320px;
        color: red;
    }
    .pill {
        padding: 6px 12px;
        border-radius: 999px;
        font-weight: 700;
        display: inline-block;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# ---------------------------
# Header
# ---------------------------
st.markdown('<div class="title">🦴 OsteoVision</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">AI-Powered Osteoporosis Detection (Custom CNN Ensemble)</div>', unsafe_allow_html=True)

# ---------------------------
# File Uploader
# ---------------------------
uploaded_file = st.file_uploader(
    "📤 Upload X-ray image (JPG / PNG)",
    type=["jpg", "jpeg", "png"]
)

# ---------------------------
# Prediction
# ---------------------------
if uploaded_file:
    left, right = st.columns([0.6, 0.4])

    with left:
        image = Image.open(uploaded_file).convert("RGB")
        st.image(image, caption="Uploaded Image", width=280)

    with right:
        img_array = preprocess_image(uploaded_file)

        final_label, confidence = ensemble_predict_with_thresholds(models, img_array, thresholds, weights)

        if final_label == "Osteoporosis":
            pill_bg = "#fee2e2"
            pill_color = "#b91c1c"
            message = "Low bone density detected. Consult a radiologist."
        else:
            pill_bg = "#e0f2fe"
            pill_color = "#0369a1"
            message = "No strong signs of osteoporosis detected."

        st.markdown(
            f"""
            <div class="result-card">
                <div class="pill" style="background:{pill_bg}; color:{pill_color};">
                    {final_label}
                </div>
                <h2 style="color:{pill_color}">{confidence:.2%}</h2>
                <p style="color:{pill_color}">{message}</p>
            
            </div>
            """,
            unsafe_allow_html=True
        )

st.markdown("---")
