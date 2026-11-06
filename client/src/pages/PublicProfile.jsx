import { ArrowLeft, CalendarDays, Compass, MapPin, ShieldCheck, Star, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Brand from '../components/Brand';
import AppLoader from '../components/AppLoader';
import api, { getApiError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'T';
}
function formatDate(value) {
  if (!value) return 'Date not set';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export default function PublicProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get(`/users/${encodeURIComponent(username)}/profile`)
      .then(({ data }) => { if (active) setProfile(data.profile); })
      .catch((requestError) => { if (active) { const message = getApiError(requestError, 'Could not load this traveler profile.'); setError(message); toast('error', message); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [username, toast]);

  return (
    <main className="public-profile-page">
      <header className="public-profile-header shell"><Brand /><Link className="back-home back-home-dark" to={user ? '/dashboard' : '/'}><ArrowLeft size={15} /> {user ? 'Back to dashboard' : 'Back to TripVault'}</Link></header>
      {loading ? <AppLoader label="Opening this travel profile…" /> : error ? <section className="public-profile-state shell"><div className="public-profile-state-icon"><UserRound size={25} /></div><h1>Profile unavailable</h1><p>{error}</p><Link className="button button-primary" to="/">Return home</Link></section> : profile ? (
        <div className="public-profile-content shell">
          <section className="public-profile-hero">
            <div className="public-profile-avatar">{initials(profile.name)}</div>
            <div className="public-profile-intro"><span className="section-overline"><Compass size={13} /> A TRAVELER ON TRIPVAULT</span><h1>{profile.name}</h1><p className="public-profile-handle">@{profile.username}</p><p className="public-profile-bio">{profile.bio || 'Collecting places, stories, and little moments along the way.'}</p><div className="public-profile-stats"><span><strong>{profile.trips.length}</strong> {profile.trips.length === 1 ? 'journey shared' : 'journeys shared'}</span><span><ShieldCheck size={14} /> Public travel journal</span></div></div>
          </section>
          <section className="public-profile-trips"><div className="public-profile-section-heading"><div><span className="section-overline">THE JOURNEY SO FAR</span><h2>Travel memories</h2><p>A collection of destinations and stories shared by this traveler.</p></div><span className="public-trip-count">{profile.trips.length} {profile.trips.length === 1 ? 'TRIP' : 'TRIPS'}</span></div>
            {profile.trips.length ? <div className="public-trip-grid">{profile.trips.map((trip) => <article className="public-trip-card" key={trip.id}><div className="public-trip-image">{trip.coverImage ? <img src={trip.coverImage} alt={`${trip.title} in ${trip.destination}`} loading="lazy" /> : <div className="public-trip-image-fallback"><Compass size={30} /></div>}<span><MapPin size={13} /> {trip.destination}</span></div><div className="public-trip-copy"><div className="public-trip-meta"><span><CalendarDays size={13} /> {formatDate(trip.startDate)}{trip.endDate ? ` — ${formatDate(trip.endDate)}` : ''}</span>{trip.rating ? <span className="public-trip-rating"><Star size={12} fill="currentColor" /> {trip.rating}/5</span> : null}</div><h3>{trip.title}</h3></div></article>)}</div> : <div className="public-profile-empty"><Compass size={25} /><h3>No public trips yet</h3><p>This traveler hasn't shared any journeys yet. Check back later.</p></div>}
          </section>
        </div>
      ) : null}
    </main>
  );
}
