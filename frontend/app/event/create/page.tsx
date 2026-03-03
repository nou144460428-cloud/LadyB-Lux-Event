'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function CreateEvent() {
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budgetRange, setBudgetRange] = useState('₦1,000,000 - ₦3,000,000');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [theme, setTheme] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const title = eventName.trim()
        ? `${eventName.trim()} (${eventType})`
        : `${eventType} Event`;

      const locationParts = [
        venueName.trim(),
        venueAddress.trim(),
        city.trim(),
        state.trim(),
      ].filter(Boolean);
      const computedLocation = locationParts.join(', ');

      const detailsLine = [
        guestCount ? `Guests: ${guestCount}` : null,
        startTime ? `Start: ${startTime}` : null,
        endTime ? `End: ${endTime}` : null,
        budgetRange ? `Budget: ${budgetRange}` : null,
        theme.trim() ? `Theme: ${theme.trim()}` : null,
        specialRequests.trim() ? `Notes: ${specialRequests.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const finalLocation = [computedLocation, detailsLine]
        .filter(Boolean)
        .join(' | ');

      await api.post('/events', {
        title,
        eventDate,
        location: finalLocation,
      });
      router.push('/dashboard/customer');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 rounded-2xl border border-[#4a3a22] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,124,0.16),_rgba(18,14,9,0.92)_52%)] p-7 text-[#efe7dc]">
        <p className="text-xs uppercase tracking-[0.2em] text-[#b99b67]">Event Intake Form</p>
        <h1
          className="mt-2 text-3xl uppercase tracking-[0.08em] text-[#f4eadf] md:text-4xl"
          style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
        >
          Create Event Brief
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-[#cdbca3]">
          Share complete details so we can match the right premium vendors to your event.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-[#4a3a22] bg-[#151008] p-6 text-[#efe7dc]"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Blessing's Birthday"
              className="input bg-[#efe7dc]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="input bg-[#efe7dc]"
              required
            >
              <option>Wedding</option>
              <option>Birthday</option>
              <option>Engagement</option>
              <option>Corporate</option>
              <option>Private Party</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input bg-[#efe7dc]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input bg-[#efe7dc]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input bg-[#efe7dc]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Expected Guests</label>
            <input
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="e.g. 150"
              className="input bg-[#efe7dc]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Budget Range</label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="input bg-[#efe7dc]"
            >
              <option>₦500,000 - ₦1,000,000</option>
              <option>₦1,000,000 - ₦3,000,000</option>
              <option>₦3,000,000 - ₦5,000,000</option>
              <option>₦5,000,000 - ₦10,000,000</option>
              <option>₦10,000,000+</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Venue Name</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g. Imperial Hall"
              className="input bg-[#efe7dc]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Venue Address</label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Street and area"
              className="input bg-[#efe7dc]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Lagos"
              className="input bg-[#efe7dc]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Lagos State"
              className="input bg-[#efe7dc]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Theme / Style</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Classic Gold"
              className="input bg-[#efe7dc]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Additional Notes (optional)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Special requests, accessibility, vendor preferences..."
            className="input min-h-28 bg-[#efe7dc]"
          />
        </div>

        <div className="rounded-xl border border-[#3a2d1b] bg-[#120d07] p-4 text-xs text-[#bca786]">
          Saved details are compacted into your event brief for now, so the current backend can process it without schema changes.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border border-[#d6b57c] bg-[#d6b57c] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating Event Brief...' : 'Create Detailed Event'}
        </button>
      </form>
    </div>
  );
}
