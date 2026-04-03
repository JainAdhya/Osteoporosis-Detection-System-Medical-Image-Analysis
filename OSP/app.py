from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from PIL import Image
import io
import requests

# ---------------------------
# App Init
# ---------------------------
app = FastAPI(title="OsteoVision API")

# Enable CORS (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGE_SIZE = 224

# ---------------------------
# Load Models (Ensemble)
# ---------------------------
def load_all_models():
    model_files = [
        "cnn_model_0.h5",
        "cnn_model_1.h5",
        "cnn_model_2.h5",
        "cnn_model_3.h5",
        "cnn_model_4.h5"
    ]

    models = []
    for m in model_files:
        model = load_model(m, compile=False, safe_mode=False)
        models.append(model)

    return models

models = load_all_models()



# ---------------------------
# Ensemble Weights
# ---------------------------
weights = np.array([1.0, 1.0, 1.1, 1.0, 1.4])

# ---------------------------
# Image Preprocessing
# ---------------------------
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
    img_array = img_to_array(image) / 255.0
    return np.expand_dims(img_array, axis=0)

# ---------------------------
# Ensemble Prediction
# ---------------------------
def ensemble_predict(models, img_array, weights=None):
    probs = []

    for model in models:
        pred = model.predict(img_array, verbose=0)

        if pred.shape[-1] == 1:
            osteo_prob = float(pred[0][0])
        else:
            osteo_prob = float(pred[0][1])

        probs.append(osteo_prob)

    probs = np.array(probs)

    if weights is not None:
        probs = probs * weights
        final_prob = probs.sum() / weights.sum()
    else:
        final_prob = probs.mean()

    return final_prob

# ---------------------------
# Routes
# ---------------------------

@app.get("/")
def home():
    return {"message": "OsteoVision API is running 🚀"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        img_array = preprocess_image(contents)

        osteo_prob = ensemble_predict(models, img_array, weights)
        normal_prob = 1 - osteo_prob

        threshold = 0.45
        final_label = "Osteoporosis" if osteo_prob > threshold else "Normal"
        confidence = max(osteo_prob, normal_prob)

        if final_label == "Osteoporosis":
            message = "Low bone density detected. Consult a radiologist."
        else:
            message = "No strong signs of osteoporosis detected."

        return {
            "prediction": final_label,
            "confidence": float(confidence),
            "osteoporosis_probability": float(osteo_prob),
            "normal_probability": float(normal_prob),
            "message": message
        }

    except Exception as e:
        return {"error": str(e)}




@app.get("/get-doctors")
def get_doctors(lat: float, lng: float):
    overpass_url = "https://overpass-api.de/api/interpreter"

    query = f"""
    [out:json];
    (
      node["healthcare"="doctor"]["speciality"="orthopaedics"](around:10000,{lat},{lng});
      node["healthcare"="doctor"]["speciality"="endocrinology"](around:10000,{lat},{lng});
      node["healthcare"="clinic"]["name"~"ortho|bone|joint", i](around:10000,{lat},{lng});
      node["amenity"="hospital"]["name"~"ortho|bone|joint", i](around:10000,{lat},{lng});
    );
    out;
    """

    response = requests.get(overpass_url, params={"data": query})
    data = response.json()

    doctors = []

    for place in data.get("elements", [])[:10]:
        tags = place.get("tags", {})

        doctors.append({
            "name": tags.get("name", "Orthopedic Specialist"),
            "address": tags.get("addr:full") 
                        or tags.get("addr:street", "") + " " + tags.get("addr:city", "")
                        or "Address not available",
            "speciality": tags.get("speciality", "Orthopedic / Bone Specialist"),
            "lat": place.get("lat"),
            "lng": place.get("lon")
        })

    return {"doctors": doctors}