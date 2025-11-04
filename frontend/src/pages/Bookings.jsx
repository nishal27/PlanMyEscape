import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState('flight');
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    cityCode: '',
    checkInDate: '',
    checkOutDate: ''
  });
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/bookings/flights/search', {
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
        returnDate: searchData.returnDate,
        passengers: 1
      });
      setSearchResults({ type: 'flights', data: response.data.flights });
    } catch (error) {
      toast.error('Failed to search flights');
    }
  };

  const handleHotelSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/bookings/hotels/search', {
        cityCode: searchData.cityCode,
        checkInDate: searchData.checkInDate,
        checkOutDate: searchData.checkOutDate,
        guests: 1
      });
      setSearchResults({ type: 'hotels', data: response.data.hotels });
    } catch (error) {
      toast.error('Failed to search hotels');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="bookings">
      <h1>Bookings</h1>

      <div className="search-section">
        <div className="search-tabs">
          <button
            className={searchType === 'flight' ? 'active' : ''}
            onClick={() => setSearchType('flight')}
          >
            Search Flights
          </button>
          <button
            className={searchType === 'hotel' ? 'active' : ''}
            onClick={() => setSearchType('hotel')}
          >
            Search Hotels
          </button>
        </div>

        {searchType === 'flight' ? (
          <form onSubmit={handleFlightSearch} className="search-form">
            <input
              type="text"
              placeholder="Origin (e.g., JFK)"
              value={searchData.origin}
              onChange={(e) => setSearchData({ ...searchData, origin: e.target.value.toUpperCase() })}
              required
            />
            <input
              type="text"
              placeholder="Destination (e.g., LAX)"
              value={searchData.destination}
              onChange={(e) => setSearchData({ ...searchData, destination: e.target.value.toUpperCase() })}
              required
            />
            <input
              type="date"
              value={searchData.departureDate}
              onChange={(e) => setSearchData({ ...searchData, departureDate: e.target.value })}
              required
            />
            <input
              type="date"
              value={searchData.returnDate}
              onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
            />
            <button type="submit">Search Flights</button>
          </form>
        ) : (
          <form onSubmit={handleHotelSearch} className="search-form">
            <input
              type="text"
              placeholder="City Code (e.g., PAR)"
              value={searchData.cityCode}
              onChange={(e) => setSearchData({ ...searchData, cityCode: e.target.value.toUpperCase() })}
              required
            />
            <input
              type="date"
              value={searchData.checkInDate}
              onChange={(e) => setSearchData({ ...searchData, checkInDate: e.target.value })}
              required
            />
            <input
              type="date"
              value={searchData.checkOutDate}
              onChange={(e) => setSearchData({ ...searchData, checkOutDate: e.target.value })}
              required
            />
            <button type="submit">Search Hotels</button>
          </form>
        )}
      </div>

      {searchResults && (
        <div className="search-results">
          <h2>Search Results</h2>
          {searchResults.data.length === 0 ? (
            <p>No results found</p>
          ) : (
            <div className="results-list">
              {searchResults.data.map((item, idx) => (
                <div key={idx} className="result-card">
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bookings-list">
        <h2>My Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet</p>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <span className="booking-type">{booking.type}</span>
                  <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                </div>
                <div className="booking-ref">Ref: {booking.bookingReference}</div>
                <div className="booking-cost">
                  ${booking.cost.amount} {booking.cost.currency}
                </div>
                <div className="booking-date">
                  {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;

