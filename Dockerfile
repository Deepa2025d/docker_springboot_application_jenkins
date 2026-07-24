# -------------------------
# Build Stage
# -------------------------
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy only pom.xml first to leverage caching
COPY pom.xml .

RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# -------------------------
# Runtime Stage
# -------------------------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
