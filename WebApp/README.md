# Intrusion Detection System (MITM)

This project is a web application for intrusion detection on network traffic.
It combines a Python backend for analysis and a React frontend for visualization, with:
- Batch CSV analysis
- Real-time monitoring via WebSocket
- Threat scoring and alert logs

## Repository

```bash
git clone https://github.com/doha-nekro/mitm-detection-project.git doha-nekro
cd mitm-detection-project
```

## Requirements

- Python 3.10+
- Node.js 18+

## Run (quick start on Windows)

```bash
start.bat
```

To stop all services:

```bash
stop.bat
```

## Run manually

Backend:

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend (new terminal):

```bash
cd frontend
npm install
npm run dev
```

## Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
