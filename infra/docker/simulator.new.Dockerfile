FROM python:3.12-slim

WORKDIR /app

COPY src/boxSimulator/ .

EXPOSE 8000

# API_KEY environment variable should be set in docker-compose
CMD sh -c 'mkdir -p config && echo -e "[\n    \"${API_KEY}\"\n]" > config/api_keys.json && python simulator/main.py --port 8000'

