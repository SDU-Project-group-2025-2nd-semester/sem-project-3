FROM eclipse-mosquitto

# Copy configuration files into the image
COPY ./../../mosquitto/config /mosquitto/config

# Expose ports
EXPOSE 1883 9001