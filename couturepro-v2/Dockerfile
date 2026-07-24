FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data /app/uploads

EXPOSE 8000

# La réconciliation de schéma (voir app/db_startup.py) se fait en Python
# au chargement de app.main, indépendamment de l'historique Alembic (qui
# n'a jamais été appliqué sur la base de prod). On ne bloque plus le
# démarrage de l'app sur `alembic upgrade head` : un échec de cette
# commande empêchait auparavant uvicorn de démarrer du tout.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
