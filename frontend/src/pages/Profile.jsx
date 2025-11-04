import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    preferences: {
      budget: 0,
      travelStyle: 'mid-range'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      setProfile(response.data.user);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put('/api/users/profile', profile);
      setProfile(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile">
      <h1>Profile Settings</h1>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="disabled"
          />
        </div>

        <div className="form-group">
          <label>Budget (USD)</label>
          <input
            type="number"
            value={profile.preferences?.budget || 0}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { ...profile.preferences, budget: parseInt(e.target.value) || 0 }
            })}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Travel Style</label>
          <select
            value={profile.preferences?.travelStyle || 'mid-range'}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { ...profile.preferences, travelStyle: e.target.value }
            })}
          >
            <option value="budget">Budget</option>
            <option value="mid-range">Mid-Range</option>
            <option value="luxury">Luxury</option>
            <option value="backpacker">Backpacker</option>
          </select>
        </div>

        <button type="submit" className="save-button" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;

