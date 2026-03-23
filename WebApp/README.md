# Intrusion Detection System (MITM) 🛡️

[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://www.python.org/) [![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/) [![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A **full-stack web application** for detecting Man-in-the-Middle (MITM) intrusions in network traffic. Combines a **Python backend** for analysis with a **React frontend** for visualization.

---

##  Features
-  Batch CSV analysis of network data  
-  Real-time monitoring via WebSocket  
-  Threat scoring and alert logs  

---

##  Repository
```bash
git clone https://github.com/doha-nekro/Intrusion-Detection-System-MITM.git Intrusion-Detection-System-MITM
cd Intrusion-Detection-System-MITM
```
---
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
