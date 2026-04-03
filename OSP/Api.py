"""
OsteoVision API — v2
FastAPI backend with:
  • Ensemble CNN prediction (custom_cnn_0.h5 … custom_cnn_4.h5)
  • Grad-CAM / Grad-CAM++ / Score-CAM saliency maps
  • VLM-powered structured radiology report via Ollama (LLaVA) or
    OpenAI-compatible endpoint (MedGemma / LLaVA-Med)
  • Nearby doctor search via Overpass API

Python 3.11.9  |  TensorFlow 2.x  |  FastAPI
"""

from __future__ import annotations

import base64
import io
import os
import json
import time
import logging
from pathlib import Path
from typing import List, Optional

import cv2
import numpy as np
import requests
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OsteoVision")

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
IMAGE_SIZE = 224
THRESHOLD  = 0.45

MODEL_FILES = [f"cnn_model_{i}.h5" for i in range(5)]
WEIGHTS     = np.array([1.0, 1.0, 1.1, 1.0, 1.4])

# ── VLM config ──────────────────────────────
# Option A: local Ollama  (default, free)
#   Run:  ollama pull llava:13b
VLM_BACKEND  = os.getenv("VLM_BACKEND", "ollama")   # "ollama" | "openai"
OLLAMA_URL   = os.getenv("OLLAMA_URL",  "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llava:13b")

# Option B: OpenAI-compatible endpoint
#   e.g. Together AI running LLaVA-Med / MedGemma
OPENAI_BASE  = os.getenv("OPENAI_BASE_URL", "https://api.together.xyz/v1")
OPENAI_KEY   = os.getenv("OPENAI_API_KEY",  "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL",    "llava-hf/llava-1.5-7b-hf")


# ─────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────
app = FastAPI(title="OsteoVision API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# MODEL LOADING
# ─────────────────────────────────────────────
def load_all_models() -> List[tf.keras.Model]:
    loaded = []
    for fname in MODEL_FILES:
        p = Path(fname)
        if not p.exists():
            logger.warning(f"Model file not found: {fname} — skipping")
            continue
        logger.info(f"Loading {fname} …")
        m = load_model(str(p), compile=False, safe_mode=False)
        loaded.append(m)
    if not loaded:
        raise RuntimeError("No model files found. Place custom_cnn_0.h5 … custom_cnn_4.h5 in the working directory.")
    logger.info(f"Loaded {len(loaded)} model(s).")
    return loaded


models: List[tf.keras.Model] = []

@app.on_event("startup")
def startup():
    global models
    models = load_all_models()


# ─────────────────────────────────────────────
# IMAGE PREPROCESSING
# ─────────────────────────────────────────────
def preprocess_bytes(image_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    """Returns (img_array_float32 [1,224,224,3], img_rgb_uint8 [224,224,3])"""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
    img_rgb = np.array(image, dtype=np.uint8)
    img_arr = np.expand_dims(img_rgb.astype(np.float32) / 255.0, axis=0)
    return img_arr, img_rgb


# ─────────────────────────────────────────────
# GRAD-CAM UTILITIES
# ─────────────────────────────────────────────
def get_last_conv_layer(model: tf.keras.Model) -> str:
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
    raise ValueError("No Conv2D layer found in model")


def forward_pass_capture(
    model: tf.keras.Model,
    img_tensor: tf.Tensor,
    layer_name: str,
) -> tuple[tf.Tensor, tf.Tensor]:
    """Manual sequential forward pass; captures output at `layer_name`."""
    x = img_tensor
    conv_output = None
    for layer in model.layers:
        x = layer(x, training=False)
        if layer.name == layer_name:
            conv_output = x
    if conv_output is None:
        raise ValueError(f"Layer '{layer_name}' not found.")
    return conv_output, x


def grad_cam(model: tf.keras.Model, img_array: np.ndarray, layer_name: str) -> np.ndarray:
    img_tensor = tf.cast(img_array, tf.float32)
    with tf.GradientTape() as tape:
        tape.watch(img_tensor)
        conv_output, predictions = forward_pass_capture(model, img_tensor, layer_name)
        tape.watch(conv_output)
        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_output)
    if grads is None:
        h, w = conv_output.shape[1], conv_output.shape[2]
        return np.zeros((h, w))

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_out_val = conv_output[0]
    heatmap = conv_out_val @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0)
    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()


def grad_cam_plus(model: tf.keras.Model, img_array: np.ndarray, layer_name: str) -> np.ndarray:
    img_tensor = tf.cast(img_array, tf.float32)
    with tf.GradientTape() as tape:
        tape.watch(img_tensor)
        conv_output, predictions = forward_pass_capture(model, img_tensor, layer_name)
        tape.watch(conv_output)
        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_output)
    if grads is None:
        h, w = conv_output.shape[1], conv_output.shape[2]
        return np.zeros((h, w))

    grads_p2 = grads ** 2
    grads_p3 = grads ** 3
    conv_out_val = conv_output[0]
    global_sum = tf.reduce_sum(conv_out_val, axis=(0, 1))

    denom = (
        2.0 * grads_p2
        + grads_p3 * global_sum[tf.newaxis, tf.newaxis, tf.newaxis, :]
    )
    denom = tf.where(tf.equal(denom, 0), tf.ones_like(denom), denom)
    alphas = grads_p2 / denom
    relu_grads = tf.maximum(grads, 0)
    weights = tf.reduce_sum(relu_grads * alphas, axis=(1, 2))[0]

    heatmap = tf.reduce_sum(weights * conv_out_val, axis=-1)
    heatmap = tf.maximum(heatmap, 0)
    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()


def score_cam(model: tf.keras.Model, img_array: np.ndarray, layer_name: str) -> np.ndarray:
    img_tensor = tf.cast(img_array, tf.float32)
    x = img_tensor
    for layer in model.layers:
        x = layer(x, training=False)
        if layer.name == layer_name:
            activations = x.numpy()[0]  # (H, W, C)
            break

    input_h, input_w = img_array.shape[1], img_array.shape[2]
    heatmap = np.zeros(activations.shape[:2])

    for i in range(activations.shape[-1]):
        act_map = activations[:, :, i]
        if np.max(act_map) <= 0:
            continue
        act_resized = cv2.resize(act_map, (input_w, input_h))
        lo, hi = act_resized.min(), act_resized.max()
        act_norm = (act_resized - lo) / (hi - lo + 1e-8)
        masked = (img_array[0] * act_norm[..., np.newaxis]).astype(np.float32)
        masked_t = tf.constant(np.expand_dims(masked, 0))

        pred_x = masked_t
        for layer in model.layers:
            pred_x = layer(pred_x, training=False)
        pred = pred_x.numpy()[0][0]
        heatmap += pred * act_resized

    heatmap = np.maximum(heatmap, 0)
    if heatmap.max() > 0:
        heatmap /= heatmap.max()
    return heatmap


def ensemble_saliency(
    models: List[tf.keras.Model],
    img_array: np.ndarray,
    use_score_cam: bool = False,
) -> tuple[np.ndarray, List[float]]:
    final_heatmap = np.zeros((IMAGE_SIZE, IMAGE_SIZE))
    predictions: List[float] = []

    for model in models:
        layer_name = get_last_conv_layer(model)
        img_tensor  = tf.cast(img_array, tf.float32)
        _, pred_t   = forward_pass_capture(model, img_tensor, layer_name)
        pred        = float(pred_t.numpy()[0][0])
        predictions.append(pred)

        c1 = grad_cam(model, img_array, layer_name)
        c2 = grad_cam_plus(model, img_array, layer_name)

        if use_score_cam:
            c3 = score_cam(model, img_array, layer_name)
            cam = (c1 + c2 + c3) / 3.0
        else:
            cam = (c1 + c2) / 2.0

        cam_res = cv2.resize(cam, (IMAGE_SIZE, IMAGE_SIZE))
        final_heatmap += cam_res

    final_heatmap /= len(models)
    return final_heatmap, predictions


def heatmap_to_png_b64(heatmap: np.ndarray, img_rgb: np.ndarray) -> str:
    """Blend heatmap over original image, return base64-encoded PNG."""
    hm_uint8  = np.uint8(255 * heatmap)
    hm_color  = cv2.applyColorMap(hm_uint8, cv2.COLORMAP_JET)
    hm_color  = cv2.cvtColor(hm_color, cv2.COLOR_BGR2RGB)
    overlay   = cv2.addWeighted(img_rgb, 0.6, hm_color, 0.4, 0)
    pil_img   = Image.fromarray(overlay)
    buf       = io.BytesIO()
    pil_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def img_to_b64(img_rgb: np.ndarray) -> str:
    pil_img = Image.fromarray(img_rgb)
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


# ─────────────────────────────────────────────
# VLM — STRUCTURED RADIOLOGY REPORT
# ─────────────────────────────────────────────
REPORT_SYSTEM_PROMPT = """You are an expert musculoskeletal radiologist specializing in bone density analysis and osteoporosis detection.
Analyze the provided X-ray image and generate a structured radiology report in JSON format ONLY.

The JSON must contain exactly these keys:
{
  "clinical_indication": "<why the scan was performed>",
  "technique": "<imaging modality and view description>",
  "findings": {
    "bone_density": "<description of trabecular pattern, cortical thickness, density>",
    "micro_fracture_risk": "<low | moderate | high> — justify briefly>",
    "cortical_integrity": "<intact | thinned | compromised>",
    "trabecular_pattern": "<coarse | normal | fine | rarefied>",
    "notable_regions": "<list any specific anatomical regions of concern>",
    "artifacts": "<any imaging artifacts or limitations>"
  },
  "impression": "<concise 2-3 sentence diagnostic summary>",
  "recommendation": "<clinical follow-up recommendations>",
  "confidence": "<low | moderate | high>"
}

Return ONLY valid JSON. No markdown, no preamble."""

REPORT_USER_PROMPT_TEMPLATE = """This is a bone X-ray from an osteoporosis screening system.

AI Ensemble Model Results:
- Osteoporosis Probability: {osteo_prob:.1%}
- Diagnosis: {diagnosis}
- Ensemble Confidence: {confidence:.1%}

The saliency map (second image) highlights regions the AI model focused on.
Based on both images, generate the structured radiology report JSON."""


def call_vlm_ollama(original_b64: str, heatmap_b64: str, osteo_prob: float, diagnosis: str, confidence: float) -> dict:
    prompt = REPORT_USER_PROMPT_TEMPLATE.format(
        osteo_prob=osteo_prob, diagnosis=diagnosis, confidence=confidence
    )
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": f"{REPORT_SYSTEM_PROMPT}\n\n{prompt}",
        "images": [original_b64, heatmap_b64],
        "stream": False,
        "options": {"temperature": 0.1},
    }
    resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120)
    resp.raise_for_status()
    text = resp.json().get("response", "")
    return json.loads(text)


def call_vlm_openai(original_b64: str, heatmap_b64: str, osteo_prob: float, diagnosis: str, confidence: float) -> dict:
    prompt = REPORT_USER_PROMPT_TEMPLATE.format(
        osteo_prob=osteo_prob, diagnosis=diagnosis, confidence=confidence
    )
    headers = {
        "Authorization": f"Bearer {OPENAI_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": OPENAI_MODEL,
        "max_tokens": 1024,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": REPORT_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{original_b64}"}},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{heatmap_b64}"}},
                ],
            },
        ],
    }
    resp = requests.post(f"{OPENAI_BASE}/chat/completions", json=payload, headers=headers, timeout=120)
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"]
    # Strip potential markdown fences
    text = text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    return json.loads(text)


def generate_radiology_report(
    original_b64: str,
    heatmap_b64: str,
    osteo_prob: float,
    diagnosis: str,
    confidence: float,
) -> dict:
    """
    Calls the configured VLM backend to generate a structured radiology report.
    Falls back to a rule-based report if VLM is unavailable.
    """
    try:
        if VLM_BACKEND == "openai":
            return call_vlm_openai(original_b64, heatmap_b64, osteo_prob, diagnosis, confidence)
        else:
            return call_vlm_ollama(original_b64, heatmap_b64, osteo_prob, diagnosis, confidence)
    except Exception as e:
        logger.warning(f"VLM call failed ({e}); using rule-based fallback report.")
        return _fallback_report(osteo_prob, diagnosis, confidence)


def _fallback_report(osteo_prob: float, diagnosis: str, confidence: float) -> dict:
    """Deterministic rule-based report when VLM is unavailable."""
    if osteo_prob > 0.7:
        density       = "Markedly reduced bone density with prominent trabecular rarefaction."
        fracture_risk = "high — significant reduction in trabecular and cortical density observed"
        cortical      = "compromised"
        trabecular    = "rarefied"
        notable       = "Diffuse osteopenic changes; vertebral bodies and femoral neck require close evaluation."
        impression    = (
            "Imaging findings are consistent with osteoporosis. "
            "Significant bone density loss is present. "
            "Risk of fragility fractures is elevated."
        )
        rec = "Urgent DEXA scan recommended. Initiate pharmacological management discussion. Calcium/Vitamin D supplementation advised."
    elif osteo_prob > 0.45:
        density       = "Mildly to moderately reduced bone density consistent with osteopenia."
        fracture_risk = "moderate — trabecular thinning noted without frank cortical disruption"
        cortical      = "thinned"
        trabecular    = "coarse"
        notable       = "Mild osteopenic changes; no acute fracture identified."
        impression    = (
            "Findings suggest osteopenia. "
            "Early intervention may prevent progression to osteoporosis. "
            "Clinical correlation recommended."
        )
        rec = "DEXA scan for baseline BMD. Lifestyle modification, weight-bearing exercise, and nutritional assessment."
    else:
        density       = "Normal bone density with preserved trabecular architecture."
        fracture_risk = "low — no significant density reduction detected"
        cortical      = "intact"
        trabecular    = "normal"
        notable       = "No significant osseous abnormality identified."
        impression    = (
            "No radiographic evidence of osteoporosis or significant osteopenia. "
            "Bone density appears within normal limits. "
            "Routine follow-up as clinically indicated."
        )
        rec = "Routine follow-up. Maintain adequate calcium and vitamin D intake."

    return {
        "clinical_indication": "Screening for osteoporosis and bone density assessment.",
        "technique": "Digital radiograph, anteroposterior projection.",
        "findings": {
            "bone_density": density,
            "micro_fracture_risk": fracture_risk,
            "cortical_integrity": cortical,
            "trabecular_pattern": trabecular,
            "notable_regions": notable,
            "artifacts": "No significant imaging artifacts.",
        },
        "impression": impression,
        "recommendation": rec,
        "confidence": "high" if confidence > 0.75 else "moderate" if confidence > 0.55 else "low",
    }


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "OsteoVision API v2 is running 🚀"}


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": len(models), "vlm_backend": VLM_BACKEND}


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    use_score_cam: bool = False,
    generate_report: bool = True,
):
    """
    Full pipeline:
      1. Ensemble CNN prediction
      2. Grad-CAM + Grad-CAM++ saliency map (optionally + Score-CAM)
      3. VLM structured radiology report
    """
    try:
        contents = await file.read()
        img_array, img_rgb = preprocess_bytes(contents)

        # ── 1. Saliency + ensemble prediction ──
        t0 = time.time()
        heatmap, raw_preds = ensemble_saliency(models, img_array, use_score_cam=use_score_cam)
        logger.info(f"Saliency computed in {time.time()-t0:.1f}s")

        # Weighted ensemble probability
        w = WEIGHTS[: len(raw_preds)]
        osteo_prob  = float(np.dot(raw_preds, w) / w.sum())
        normal_prob = 1.0 - osteo_prob
        diagnosis   = "Osteoporosis" if osteo_prob > THRESHOLD else "Normal"
        confidence  = max(osteo_prob, normal_prob)

        # ── 2. Encode images ──
        original_b64 = img_to_b64(img_rgb)
        heatmap_b64  = heatmap_to_png_b64(heatmap, img_rgb)

        # ── 3. VLM report ──
        report: Optional[dict] = None
        if generate_report:
            t1 = time.time()
            report = generate_radiology_report(
                original_b64, heatmap_b64, osteo_prob, diagnosis, confidence
            )
            logger.info(f"Report generated in {time.time()-t1:.1f}s")

        message = (
            "Low bone density detected. Please consult a radiologist."
            if diagnosis == "Osteoporosis"
            else "No strong signs of osteoporosis detected."
        )

        return JSONResponse({
            "prediction": diagnosis,
            "confidence": float(confidence),
            "osteoporosis_probability": float(osteo_prob),
            "normal_probability":       float(normal_prob),
            "individual_model_scores":  [float(p) for p in raw_preds],
            "message": message,
            "saliency_map_b64":  heatmap_b64,   # base64 PNG overlay
            "original_image_b64": original_b64,
            "radiology_report":  report,
        })

    except Exception as e:
        logger.exception("Prediction pipeline error")
        raise HTTPException(status_code=500, detail=str(e))


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










