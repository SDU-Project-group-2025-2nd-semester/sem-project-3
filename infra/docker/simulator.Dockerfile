FROM python:3.12-slim

WORKDIR /app

COPY src/boxSimulator/simulator ./simulator
COPY src/boxSimulator/config ./config
COPY src/boxSimulator/data ./data

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["python", "simulator/main.py", "--port", "8000"]