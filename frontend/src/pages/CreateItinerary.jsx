import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import './CreateItinerary.css';

const CreateItinerary = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    budget: '',
    travelers: 1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/itineraries', formData);
      toast.success('Itinerary created!');
      navigate(`/itineraries/${response.data.itinerary._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create the itinerary
      const createResponse = await axios.post('/api/itineraries', formData);
      const itineraryId = createResponse.data.itinerary._id;

      // Then generate AI itinerary
      toast.loading('Generating AI itinerary...');
      await axios.post(`/api/itineraries/${itineraryId}/generate`);
      toast.dismiss();
      toast.success('AI itinerary generated!');
      navigate(`/itineraries/${itineraryId}`);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-itinerary">
      <h1>Create New Itinerary</h1>
      <form onSubmit={handleSubmit} className="itinerary-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Summer Vacation to Paris"
            required
          />
        </div>

        <div className="form-group">
          <label>Destination</label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder="e.g., Paris, France"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              minDate={new Date()}
              dateFormat="MMM dd, yyyy"
              className="date-input"
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date })}
              minDate={formData.startDate}
              dateFormat="MMM dd, yyyy"
              className="date-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Budget (USD)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Number of Travelers</label>
            <input
              type="number"
              value={formData.travelers}
              onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) || 1 })}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Itinerary'}
          </button>
          <button
            type="button"
            onClick={handleGenerateAI}
            className="button ai-button"
            disabled={loading}
          >
            {loading ? 'Generating...' : '🤖 Generate with AI'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateItinerary;

