#!/bin/bash
echo "Building server..."
docker build . --no-cache -t front
docker stop client
docker rm client
docker run -d -p 3001:3001 --name client front