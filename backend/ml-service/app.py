from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import AutoImageProcessor, SiglipForImageClassification
import torch
import io

app = FastAPI(title="Women Deepfake Shield ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "prithivMLmods/deepfake-detector-model-v1"

print("Loading deepfake detection model...")

processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = SiglipForImageClassification.from_pretrained(MODEL_NAME)
model.eval()

print("Deepfake detection model loaded successfully.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "deepfake-ml-service",
        "model": MODEL_NAME
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file."
        )

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        image = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")

        inputs = processor(
            images=image,
            return_tensors="pt"
        )

        with torch.no_grad():
            outputs = model(**inputs)

            probabilities = torch.nn.functional.softmax(
                outputs.logits,
                dim=1
            )[0]

        # Model label mapping:
        # Class 0 = Fake
        # Class 1 = Real

        fake_probability = float(probabilities[0])
        real_probability = float(probabilities[1])

        fake_percent = fake_probability * 100
        real_percent = real_probability * 100

        print(
            f"[ANALYSIS] {file.filename} | "
            f"Fake: {fake_percent:.2f}% | "
            f"Real: {real_percent:.2f}%"
        )

        # Conservative classification:
        #
        # >= 85% fake:
        #     Strong enough model signal for Likely Deepfake
        #
        # 55% - 84.99% fake:
        #     Uncertain / suspicious
        #
        # < 55% fake:
        #     Authentic
        #
        # NOTE:
        # These thresholds do NOT improve the underlying model.
        # They only make the UI classification more conservative.

        if fake_probability >= 0.85:
            classification = "Likely Deepfake"

        elif fake_probability >= 0.55:
            classification = "Suspicious"

        else:
            classification = "Authentic"

        confidence = max(
            fake_probability,
            real_probability
        ) * 100

        return {
            "filename": file.filename,
            "mediaType": "image",

            "classification": classification,

            "fakeProbability": round(
                fake_percent,
                2
            ),

            "realProbability": round(
                real_percent,
                2
            ),

            "confidenceScore": round(
                confidence,
                2
            ),

            "status": "completed",

            "model": MODEL_NAME,

            "message": "Image analyzed successfully."
        }

    except HTTPException:
        raise

    except Exception as e:
        print(
            f"[ERROR] Image analysis failed: {str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(e)}"
        )