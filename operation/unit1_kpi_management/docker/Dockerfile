# Multi-stage Dockerfile for KPI Management Service
# Optimized for production deployment on AWS ECS Fargate

# =====================================================
# Stage 1: Build Stage
# =====================================================
FROM maven:3.9.5-openjdk-21-slim AS builder

# Set working directory
WORKDIR /app

# Copy Maven configuration files first (for better layer caching)
COPY pom.xml ./
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -Dmaven.javadoc.skip=true

# =====================================================
# Stage 2: Runtime Stage
# =====================================================
FROM openjdk:21-jre-slim

# Install curl for health checks and other utilities
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Create application user for security
RUN groupadd -r kpiapp && useradd -r -g kpiapp kpiapp

# Set working directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/kpi-management-service-*.jar app.jar

# Create logs directory
RUN mkdir -p /app/logs && chown -R kpiapp:kpiapp /app

# Switch to non-root user
USER kpiapp

# Expose application port
EXPOSE 8088

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8088/api/v1/actuator/health || exit 1

# JVM optimization for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseG1GC \
               -XX:+UseStringDeduplication \
               -XX:+OptimizeStringConcat \
               -Djava.security.egd=file:/dev/./urandom \
               -Dspring.backgroundpreinitializer.ignore=true"

# Application configuration
ENV SPRING_PROFILES_ACTIVE=production
ENV SERVER_PORT=8088
ENV LOGGING_LEVEL_ROOT=INFO
ENV LOGGING_LEVEL_COM_COMPANY_KPI=INFO

# Entry point with JVM optimization
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Labels for container metadata
LABEL maintainer="KPI Management Team"
LABEL version="1.0.0"
LABEL description="KPI Management Service - Spring Boot Application"
LABEL org.opencontainers.image.source="https://github.com/company/kpi-management-service"
LABEL org.opencontainers.image.title="KPI Management Service"
LABEL org.opencontainers.image.description="Domain-driven KPI Management Service with Spring Boot"
LABEL org.opencontainers.image.version="1.0.0"