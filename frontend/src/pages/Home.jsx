import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">Plan Your Perfect Trip with AI</h1>
        <p className="hero-subtitle">
          Get personalized travel itineraries powered by AI, find the best flights and hotels,
          and navigate with real-time weather and maps.
        </p>
        {user ? (
          <Link to="/itineraries/new" className="hero-button">
            Create Your Itinerary
          </Link>
        ) : (
          <div className="hero-buttons">
            <Link to="/register" className="hero-button primary">
              Get Started
            </Link>
            <Link to="/login" className="hero-button secondary">
              Sign In
            </Link>
          </div>
        )}
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>AI-Powered Planning</h3>
          <p>Generate personalized itineraries using advanced AI models</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✈️</div>
          <h3>Flight & Hotel Bookings</h3>
          <p>Search and book flights and hotels through Amadeus API</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🗺️</div>
          <h3>Smart Navigation</h3>
          <p>Get directions and explore places with Google Maps</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌤️</div>
          <h3>Weather Forecasts</h3>
          <p>Real-time weather data for your destination</p>
        </div>
      </section>
    </div>
  );
};

export default Home;

