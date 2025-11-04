# PlanMyEscape - Travel Planning Platform

A full-stack AI-powered travel planning platform built with React.js, Node.js, Express.js, MongoDB, and LangChain.

## Features

- 🤖 **AI-Powered Itinerary Generation**: Uses LangChain with Hugging Face models to create personalized travel itineraries
- ✈️ **Travel Bookings**: Integrated with Amadeus API for flight and hotel bookings
- 🗺️ **Navigation**: Google Maps integration for route planning and navigation
- 🌤️ **Weather Forecasts**: OpenWeather API integration for real-time weather data
- 🔐 **Secure Authentication**: JWT and OAuth 2.0 authentication
- 📊 **Optimized Database**: MongoDB with proper indexing for scalable queries
- ☁️ **AWS Deployment**: Ready for deployment on EC2 and S3 with CI/CD pipelines

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB 5.0+
- AWS Account (for deployment)
- API Keys:
  - Amadeus API
  - Google Maps API
  - OpenWeather API
  - Hugging Face API

## Setup Instructions

### Quick Start with Docker

```bash
# Start all services with Docker Compose
docker-compose up -d

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - AI Service: http://localhost:8000
# - MongoDB: localhost:27017
```

### Manual Setup

#### 1. MongoDB Setup

```bash
# Using Docker
docker run -d -p 27017:27017 --name travel-mongodb mongo:7

# Or install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
```

#### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables:
# - MONGODB_URI
# - JWT_SECRET
# - API keys for Amadeus, Google Maps, OpenWeather
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL to your backend URL
npm run dev
```

#### 4. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Optional: Set HUGGINGFACE_API_TOKEN for model access
python app.py
```

## Environment Variables

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `AMADEUS_API_KEY` - Amadeus API key
- `AMADEUS_API_SECRET` - Amadeus API secret
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `OPENWEATHER_API_KEY` - OpenWeather API key
- `AI_SERVICE_URL` - URL of AI service (default: http://localhost:8000)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

### AI Service (.env)
- `HUGGINGFACE_API_TOKEN` - Optional token for Hugging Face models
- `HUGGINGFACE_MODEL` - Model name (default: microsoft/DialoGPT-medium)

## Deployment

### AWS Deployment

The platform is designed to be deployed on AWS:

1. **EC2** - Host backend and AI service
2. **S3** - Host frontend static files
3. **MongoDB Atlas** - Cloud database (or MongoDB on EC2)

#### EC2 Setup

```bash
# Run the setup script on your EC2 instance
chmod +x deployment/aws/ec2-setup.sh
./deployment/aws/ec2-setup.sh
```

#### S3 Deployment

```bash
# Deploy frontend to S3
chmod +x deployment/aws/s3-deploy.sh
./deployment/aws/s3-deploy.sh
```

#### CI/CD Pipeline

GitHub Actions workflow is configured in `.github/workflows/ci-cd.yml`. Set up these secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `API_URL`

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```



