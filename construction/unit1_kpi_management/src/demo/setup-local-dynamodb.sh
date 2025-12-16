#!/bin/bash

# Setup script for local DynamoDB for demo purposes
# This script downloads and runs DynamoDB Local

echo "Setting up local DynamoDB for KPI Management Service demo..."

# Create demo directory if it doesn't exist
mkdir -p demo/dynamodb-local

# Download DynamoDB Local if not already present
if [ ! -f "demo/dynamodb-local/DynamoDBLocal.jar" ]; then
    echo "Downloading DynamoDB Local..."
    cd demo/dynamodb-local
    wget https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz
    tar -xzf dynamodb_local_latest.tar.gz
    rm dynamodb_local_latest.tar.gz
    cd ../..
fi

# Start DynamoDB Local
echo "Starting DynamoDB Local on port 8000..."
cd demo/dynamodb-local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000 &

# Store the process ID
DYNAMODB_PID=$!
echo $DYNAMODB_PID > ../dynamodb.pid

echo "DynamoDB Local started with PID: $DYNAMODB_PID"
echo "DynamoDB Local is running on http://localhost:8000"
echo ""
echo "To stop DynamoDB Local, run: kill \$(cat demo/dynamodb.pid)"
echo ""
echo "You can now start the KPI Management Service with:"
echo "mvn spring-boot:run"

cd ../..