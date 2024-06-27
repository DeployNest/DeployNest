#!/bin/bash

# Exit script if anything fails
set -e

# Define the path to the Docker Compose file
COMPOSE_FILE="../docker-compose.dev.yml"
DOCKER_SOCKET="/var/run/docker.sock"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker and try again."
    exit 1
else
    echo "Docker is installed. Version: $(docker --version)"
fi

# Check if docker is running
if curl --unix-socket $DOCKER_SOCKET http://localhost/_ping &> /dev/null; then
    echo "Docker daemon is running."
else
    echo "Docker daemon is not running or there is an issue with docker.sock."
fi

# Function to handle SIGINT (Control+C)
cleanup() {
    echo "Stopping and removing Docker Compose services..."
    docker compose -f "$COMPOSE_FILE" down --remove-orphans --volumes
    exit 0
}

# Trap SIGINT and call the cleanup function
trap 'cleanup' SIGINT

# Build the Docker images
echo "Building Docker images..."
docker compose -f "$COMPOSE_FILE" build

# Deploy the Docker Compose
echo "Deploying Docker Compose..."
docker compose -f "$COMPOSE_FILE" up -d

# Check if the backend container is running
if docker compose -f "$COMPOSE_FILE" ps | grep -q 'backend'; then
    echo "Showing logs for the 'backend' container. Press Control + C to stop."
    # Tail the logs of the backend container
    docker compose -f "$COMPOSE_FILE" logs -f backend
else
    echo "Backend container not found. Exiting."
    docker compose -f "$COMPOSE_FILE" down
fi

cleanup