# Use Python 3.11 slim image
FROM python:3.11-slim

# Install system dependencies for pyodbc and MS SQL Server
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    unixodbc \
    unixodbc-dev \
    # Tesseract OCR y dependencias
    tesseract-ocr \
    tesseract-ocr-spa \
    tesseract-ocr-eng \
    # Bibliotecas para OpenCV (actualizado para Debian 13)
    libgl1 \
    libglib2.0-0 \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download tessdata_best Spanish model for better OCR accuracy
RUN curl -L -o /usr/share/tesseract-ocr/5/tessdata/spa.traineddata \
    https://github.com/tesseract-ocr/tessdata_best/raw/main/spa.traineddata

# Copy custom Tesseract dictionary for Panama
COPY config/tesseract_panama_words.txt /usr/share/tesseract-ocr/5/tessdata/panama.user-words

# Expose port
EXPOSE 8000

# Run the application with increased timeouts for file uploads
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--timeout-keep-alive", "300", "--limit-max-requests", "0"]
