# 🛡️ MITM Intrusion Detection System (IDS) for IIoT Networks

[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://www.python.org/) 
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)]()

## Description

This project presents an **Network-based Intrusion Detection System (NIDS)** designed to detect **Man-In-The-Middle (MITM) attacks** in **Industrial IoT (IIoT) networks**. Leveraging **Machine Learning**, the system analyzes network traffic and flags suspicious behavior, helping secure critical industrial environments.

The project implements a complete **data science and deployment workflow**, including:

- Acquisition of raw network traffic (**PCAP files**)  
- Processing and feature extraction using **Zeek**  
- Temporal windowing and statistical aggregation for anomaly detection  
- Training and evaluation of ML models (**Random Forest, XGBoost**)  
- Deployment of a **Web Dashboard** with real-time traffic monitoring using **FastAPI** and **ReactJS**  

---

## Project Objectives

- Detect MITM attacks such as **ARP Spoofing, IP Spoofing, Impersonation** in IIoT networks  
- Provide **actionable alerts** with **explainable indicators (XAI)** for network analysts  
- Support **industrial operators** in monitoring critical infrastructures  
- Serve as a **scalable framework** for anomaly detection in large network datasets  

---

## Requirements

To run the project, install the following dependencies:

**Python packages:**

```text
joblib==1.3.2
numpy==1.24.4
pandas==2.0.3
scikit-learn==1.2.2
fastapi==0.111.1
uvicorn==0.24.0
``` 
**Frontend / JS packages:**

```text
react==18.2.0
tailwindcss==3.3.2
```
Install Python dependencies with:
```text
pip install -r requirements.txt
```
