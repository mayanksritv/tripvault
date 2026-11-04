import { ArrowLeft, CalendarDays, ImagePlus, LoaderCircle, MapPin, Star, UploadCloud } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Brand from '../components/Brand';
import Notice from '../components/Notice';
import api, { getApiError } from '../api';

function formatDate(value) {
  if (!value) return 'Date not set';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadTrip = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/trips/${id}`);
      setTrip(data.trip);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not load this trip.'));
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { loadTrip(); }, [loadTrip]);

  const photos = useMemo(() => {
    if (!trip) return [];
    return [...new Set([trip.coverImage, ...(trip.photos || [])].filter(Boolean))];
  }, [trip]);

  async function uploadPhotos(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) return;
    if (selected.length > 10) {
      setError('Choose up to 10 images at a time.');
      return;
    }
    if (selected.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('Each image must be JPG, PNG, or WEBP and 5 MB or smaller.');
      return;
    }

    setUploading(true);
    setError('');
    setNotice('');
    let uploaded = 0;
    let uploadError = '';
    for (const file of selected) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        await api.post(`/trips/${id}/upload`, formData);
        uploaded += 1;
      } catch (requestError) {
        uploadError = getApiError(requestError, 'A photo could not be uploaded.');
        break;
      }
    }
    await loadTrip();
    if (uploaded) setNotice(`${uploaded} ${uploaded === 1 ? 'photo was' : 'photos were'} added to this trip.`);
    if (uploadError) setError(uploadError);
    setUploading(false);
  }

  return (
    <main className="trip-detail-page">
      <header className="public-profile-header shell"><Brand /><Link className="back-home back-home-dark" to="/dashboard"><ArrowLeft size={15} /> Back to dashboard</Link></header>
      <div className="trip-detail-content shell">
        {loading ? <div className="trip-detail-loading"><LoaderCircle className="spin-icon" /> Loading your trip…</div> : error && !trip ? <section className="public-profile-state"><h1>Trip unavailable</h1><p>{error}</p><button className="button button-primary" onClick={() => navigate('/dashboard')}>Return to dashboard</button></section> : trip ? <>
          <div className="trip-detail-back"><Link to="/dashboard"><ArrowLeft size={15} /> All journeys</Link></div>
          {trip.coverImage ? <div className="trip-detail-cover"><img src={trip.coverImage} alt={`${trip.title} cover`} /></div> : <div className="trip-detail-cover trip-detail-cover-fallback"><CompassIcon /></div>}
          <article className="trip-detail-paper">
            <span className="section-overline">YOUR TRAVEL JOURNAL</span>
            <h1>{trip.title}</h1>
            <div className="trip-detail-meta"><span><MapPin size={15} /> {trip.destination}</span><span><CalendarDays size={15} /> {formatDate(trip.startDate)}{trip.endDate ? ` — ${formatDate(trip.endDate)}` : ''}</span>{trip.rating ? <span><Star size={14} fill="currentColor" /> {trip.rating}/5</span> : null}</div>
            {trip.description ? <p className="trip-detail-description">{trip.description}</p> : <p className="trip-detail-description muted">No notes have been added to this trip yet.</p>}
            {notice ? <Notice type="success">{notice}</Notice> : null}
            {error ? <Notice type="error">{error}</Notice> : null}
            <section className="trip-photo-section"><div className="trip-photo-heading"><div><span className="section-overline">THE MOMENTS</span><h2>Trip photos</h2><p>{photos.length} {photos.length === 1 ? 'photo' : 'photos'} saved</p></div><label className={`button button-primary trip-photo-upload ${uploading ? 'is-uploading' : ''}`}><UploadCloud size={16} /> {uploading ? 'Uploading…' : 'Add photos'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadPhotos} disabled={uploading} /></label></div>
              {photos.length ? <div className="trip-photo-grid">{photos.map((url, index) => <a href={url} target="_blank" rel="noreferrer" className="trip-photo-tile" key={url}><img src={url} alt={`${trip.title} memory ${index + 1}`} loading="lazy" /><span><ImagePlus size={14} /> View original</span></a>)}</div> : <div className="trip-photo-empty"><ImagePlus size={25} /><h3>No photos added yet</h3><p>Upload a JPG, PNG, or WEBP image to start building this trip's photo collection.</p></div>}
            </section>
          </article>
        </> : null}
      </div>
    </main>
  );
}

function CompassIcon() {
  return <div className="trip-detail-placeholder"><MapPin size={34} /><span>THE JOURNEY</span></div>;
}
