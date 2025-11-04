import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './ItineraryDetail.css';

const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  const fetchItinerary = async () => {
    try {
      const response = await axios.get(`/api/itineraries/${id}`);
      setItinerary(response.data.itinerary);
      
      // Fetch weather if destination is available
      if (response.data.itinerary.destination) {
        fetchWeather(response.data.itinerary.destination);
      }
    } catch (error) {
      toast.error('Failed to load itinerary');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (destination) => {
    try {
      const response = await axios.get(`/api/weather/forecast?city=${destination}`);
      setWeather(response.data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  };

  const handleGenerateAI = async () => {
    try {
      toast.loading('Generating AI itinerary...');
      const response = await axios.post(`/api/itineraries/${id}/generate`);
      toast.dismiss();
      toast.success('AI itinerary generated!');
      setItinerary(response.data.itinerary);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to generate itinerary');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!itinerary) {
    return null;
  }

  return (
    <div className="itinerary-detail">
      <div className="itinerary-header-section">
        <h1>{itinerary.title}</h1>
        <div className="header-info">
          <span className="destination">📍 {itinerary.destination}</span>
          <span className={`status-badge ${itinerary.status}`}>{itinerary.status}</span>
        </div>
        <div className="dates">
          {format(new Date(itinerary.startDate), 'MMM dd, yyyy')} - {format(new Date(itinerary.endDate), 'MMM dd, yyyy')}
        </div>
        {itinerary.status === 'draft' && (
          <button onClick={handleGenerateAI} className="generate-button">
            🤖 Generate AI Itinerary
          </button>
        )}
      </div>

      {weather && (
        <div className="weather-section">
          <h2>Weather Forecast</h2>
          <div className="weather-cards">
            {weather.forecasts.slice(0, 5).map((forecast, idx) => (
              <div key={idx} className="weather-card">
                <div className="weather-date">{format(new Date(forecast.date), 'MMM dd')}</div>
                <div className="weather-temp">{Math.round(forecast.temperature)}°C</div>
                <div className="weather-desc">{forecast.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.activities && itinerary.activities.length > 0 && (
        <div className="activities-section">
          <h2>Activities</h2>
          <div className="activities-list">
            {itinerary.activities.map((activity, idx) => (
              <div key={idx} className="activity-card">
                <div className="activity-header">
                  <span className="activity-time">{activity.time}</span>
                  <span className="activity-cost">${activity.cost || 0}</span>
                </div>
                <h3>{activity.activity}</h3>
                <p>{activity.description}</p>
                {activity.location && (
                  <div className="activity-location">📍 {activity.location.name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.accommodations && itinerary.accommodations.length > 0 && (
        <div className="accommodations-section">
          <h2>Accommodations</h2>
          <div className="accommodations-list">
            {itinerary.accommodations.map((accommodation, idx) => (
              <div key={idx} className="accommodation-card">
                <h3>{accommodation.name}</h3>
                <div className="accommodation-dates">
                  Check-in: {format(new Date(accommodation.checkIn), 'MMM dd, yyyy')}
                  <br />
                  Check-out: {format(new Date(accommodation.checkOut), 'MMM dd, yyyy')}
                </div>
                <div className="accommodation-cost">${accommodation.cost}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetail;

