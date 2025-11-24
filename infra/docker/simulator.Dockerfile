FROM python:3.12-slim

WORKDIR /app

COPY src/boxSimulator/ .

EXPOSE 8000

CMD ["python", "simulator/main.py", "--port", "8000"]