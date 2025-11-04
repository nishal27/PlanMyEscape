import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get('/api/itineraries');
      setItineraries(response.data.itineraries);
    } catch (error) {
      toast.error('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Itineraries</h1>
        <Link to="/itineraries/new" className="create-button">
          + Create New Itinerary
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <div className="empty-state">
          <p>No itineraries yet. Create your first one!</p>
          <Link to="/itineraries/new" className="create-button">
            Create Itinerary
          </Link>
        </div>
      ) : (
        <div className="itineraries-grid">
          {itineraries.map((itinerary) => (
            <Link
              key={itinerary._id}
              to={`/itineraries/${itinerary._id}`}
              className="itinerary-card"
            >
              <div className="itinerary-header">
                <h3>{itinerary.title}</h3>
                <span className={`status-badge ${itinerary.status}`}>
                  {itinerary.status}
                </span>
              </div>
              <p className="itinerary-destination">📍 {itinerary.destination}</p>
              <div className="itinerary-dates">
                <span>{format(new Date(itinerary.startDate), 'MMM dd, yyyy')}</span>
                <span>→</span>
                <span>{format(new Date(itinerary.endDate), 'MMM dd, yyyy')}</span>
              </div>
              {itinerary.aiGenerated && (
                <span className="ai-badge">🤖 AI Generated</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

