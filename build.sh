#!/usr/bin/env bash
set -e

echo "==> Building TaskFlow..."

if ! command -v mvn &> /dev/null; then
  echo "Maven not found. Generating Maven wrapper instead..."
  if ! command -v java &> /dev/null; then
    echo "ERROR: Java 21 is required but not found on this machine."
    exit 1
  fi
  mvn -N io.takari:maven:wrapper 2>/dev/null || {
    echo "ERROR: Neither 'mvn' nor a way to bootstrap the wrapper is available."
    echo "Install Maven (https://maven.apache.org/install.html) and re-run this script."
    exit 1
  }
  ./mvnw clean package -DskipTests
else
  mvn clean package -DskipTests
fi

echo ""
echo "==> Build complete!"
echo "==> Jar created at: target/taskflow.jar"
echo ""
echo "Run it with:"
echo "  java -jar target/taskflow.jar"
echo ""
echo "Then open http://localhost:8080 in your browser."
