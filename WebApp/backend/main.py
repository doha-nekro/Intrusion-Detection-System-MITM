"""
Synapse IDS Backend
FastAPI application for Intrusion Detection System Dashboard.
"""

import asyncio
import random
from io import BytesIO
from datetime import datetime
from pathlib import Path
from typing import Any, Optional
from contextlib import asynccontextmanager

import pandas as pd
import joblib
from fastapi import FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# ============================================================================
# APP CONFIGURATION
# ============================================================================

MODEL_PATH = Path(__file__).parent / "model" / "FINAL_IDS_SYSTEM.pkl"
model: Optional[Any] = None


def load_model() -> Any:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
    return joblib.load(MODEL_PATH)


def run_batch_inference(model_artifact: Any, dataframe: pd.DataFrame):
    if hasattr(model_artifact, "predict"):
        return model_artifact.predict(dataframe)

    if isinstance(model_artifact, dict):
        base_model = model_artifact.get("model")
        preprocessors = model_artifact.get("preprocessors", {})

        if base_model is None or not hasattr(base_model, "predict"):
            raise ValueError("Invalid model artifact: missing predictor")

        features = dataframe.copy()

        imputer = preprocessors.get("imputer")
        scaler = preprocessors.get("scaler")

        preprocessing_feature_names = None
        if imputer is not None and hasattr(imputer, "feature_names_in_"):
            preprocessing_feature_names = list(imputer.feature_names_in_)
        elif scaler is not None and hasattr(scaler, "feature_names_in_"):
            preprocessing_feature_names = list(scaler.feature_names_in_)

        if preprocessing_feature_names:
            missing_cols = [column for column in preprocessing_feature_names if column not in features.columns]
            if missing_cols:
                raise ValueError("Missing required feature columns")
            features = features[preprocessing_feature_names]

        if imputer is not None:
            features = imputer.transform(features)

        if scaler is not None:
            features = scaler.transform(features)

        if preprocessing_feature_names and not isinstance(features, pd.DataFrame):
            features = pd.DataFrame(features, columns=preprocessing_feature_names, index=dataframe.index)

        model_feature_names = None
        if hasattr(base_model, "feature_names_in_"):
            model_feature_names = list(base_model.feature_names_in_)
        else:
            selector_cols = preprocessors.get("selector_cols")
            if selector_cols:
                model_feature_names = list(selector_cols)

        if model_feature_names and isinstance(features, pd.DataFrame):
            missing_cols = [column for column in model_feature_names if column not in features.columns]
            if missing_cols:
                raise ValueError("Missing required feature columns")
            features = features[model_feature_names]

        return base_model.predict(features)

    raise ValueError("Unsupported model artifact format")


@asynccontextmanager
async def lifespan(_: FastAPI):
    global model
    model = load_model()
    print(f"✅ Production model loaded from {MODEL_PATH}")
    yield


app = FastAPI(
    title="Synapse IDS",
    description="Intrusion Detection System Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware - Allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def generate_random_ip() -> str:
    """Generate a random IP address for simulation."""
    return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"

def generate_live_packet() -> dict:
    """Generate a simulated network packet for real-time monitoring."""
    # 10% chance of attack
    is_attack = random.random() < 0.10
    
    if is_attack:
        threat_score = random.uniform(0.80, 0.99)
        status = "Attack"
    else:
        threat_score = random.uniform(0.01, 0.30)
        status = "Normal"
    
    return {
        "timestamp": datetime.now().isoformat(),
        "source_ip": generate_random_ip(),
        "protocol": random.choice(["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "SSH", "FTP"]),
        "threat_score": round(threat_score, 4),
        "status": status
    }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check and API info endpoint."""
    return {
        "status": "online",
        "app": "Synapse IDS",
        "version": "1.0.0",
        "message": "Welcome to Synapse IDS"
    }

@app.get("/status")
async def get_status():
    """Get current system status."""
    return {
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    """
    Analyze uploaded CSV log file for intrusions.
    
    Args:
        file: CSV file containing network traffic logs
        
    Returns:
        JSON with analysis summary including attack count and flagged rows
    """
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()
    try:
        df = pd.read_csv(BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV format or missing columns.")

    total_packets = len(df)
    if total_packets == 0:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    try:
        predictions = run_batch_inference(model, df)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV format or missing columns.")

    prediction_series = pd.Series(predictions).astype(str).str.strip().str.lower()
    attack_mask = prediction_series.isin({"1", "attack", "anomaly", "intrusion", "malicious"})

    attack_count = int(attack_mask.sum())
    normal_count = int(total_packets - attack_count)
    suspicious_packets_df = df.loc[attack_mask].head(50).copy()
    suspicious_packets_df.insert(0, "row_index", suspicious_packets_df.index)
    suspicious_packets = suspicious_packets_df.to_dict(orient="records")

    attack_rate = (attack_count / total_packets) if total_packets else 0.0
    if attack_rate > 0.3:
        threat_level = "CRITICAL"
    elif attack_rate > 0.15:
        threat_level = "HIGH"
    elif attack_rate > 0.05:
        threat_level = "MEDIUM"
    else:
        threat_level = "LOW"

    return {
        "success": True,
        "filename": file.filename,
        "total_packets": total_packets,
        "attack_count": attack_count,
        "normal_count": normal_count,
        "suspicious_packets": suspicious_packets,
        "flagged_rows": suspicious_packets,
        "attack_rate": round(attack_rate * 100, 2),
        "threat_level": threat_level,
        "timestamp": datetime.now().isoformat(),
    }

# ============================================================================
# WEBSOCKET ENDPOINT
# ============================================================================

@app.websocket("/ws/iiot-live")
async def websocket_iiot_live(websocket: WebSocket):
    """
    Real-time IIoT network monitoring via WebSocket.
    Sends simulated packets every 0.2 seconds with 10% attack probability.
    """
    await websocket.accept()
    print("🔌 WebSocket client connected")
    
    try:
        while True:
            # Generate and send packet
            packet = generate_live_packet()
            await websocket.send_json(packet)
            
            # Wait 0.2 seconds before next packet
            await asyncio.sleep(0.2)
            
    except WebSocketDisconnect:
        print("🔌 WebSocket client disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
