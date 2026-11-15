import uvicorn
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

if __name__ == "__main__":
    print("Iniciando Plataforma Bioplast Chile SpA (appbpch.raevsi.cl)...")
    print("Servidor activo en: http://localhost:8000")
    print("Documentación OpenAPI en: http://localhost:8000/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
