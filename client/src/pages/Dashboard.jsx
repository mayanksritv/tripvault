import { ArrowRight, CalendarDays, CheckCircle2, Compass, Feather, LogOut, MapPin, Plus, ShieldCheck, Star, Trash2, Pencil, X, PlaneTakeoff, LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import Modal from '../components/Modal';
import Notice from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import api, { getApiError } from '../api';

const landscape = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85';
const blankTrip = { title: '', destination: '', startDate: '', endDate: '', description: '', rating: '' };
function initials(name = '') { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'T'; }
function displayDate(value) { if (!value) return 'Date not set'; return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)); }

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSignOut, setShowSignOut] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripError, setTripError] = useState('');
  const [tripNotice, setTripNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankTrip);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const dateLabel = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  const loadTrips = useCallback(async () => {
    setTripsLoading(true); setTripError('');
    try { const response = await api.get('/trips'); setTrips(response.data.trips || []); }
    catch (error) { setTripError(getApiError(error, 'Could not load your trips.')); }
    finally { setTripsLoading(false); }
  }, []);
  useEffect(() => { loadTrips(); }, [loadTrips]);

  function handleLogout() { logout(); navigate('/login', { replace: true }); }
  function navigateToSection(section, elementId) {
    setActiveSection(section);
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function openCreate() { setEditingId(null); setForm(blankTrip); setTripError(''); setTripNotice(''); setFormOpen(true); }
  function openEdit(trip) {
    setEditingId(trip._id); setTripError(''); setTripNotice('');
    setForm({ title: trip.title || '', destination: trip.destination || '', startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : '', endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : '', description: trip.description || '', rating: trip.rating ? String(trip.rating) : '' });
    setFormOpen(true);
  }
  function changeField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  const journalTrips = [...trips].sort((a, b) => new Date(b.startDate || b.createdAt || 0) - new Date(a.startDate || a.createdAt || 0));
  async function submitTrip(event) {
    event.preventDefault(); setSaving(true); setTripError(''); setTripNotice('');
    const payload = { ...form, rating: form.rating ? Number(form.rating) : null, startDate: form.startDate || null, endDate: form.endDate || null };
    try {
      if (editingId) await api.put(`/trips/${editingId}`, payload); else await api.post('/trips', payload);
      setFormOpen(false); setForm(blankTrip); setEditingId(null); setTripNotice(editingId ? 'Your trip was updated.' : 'Your trip was added to the journal.'); await loadTrips();
    } catch (error) { setTripError(error.response?.data?.message || getApiError(error, 'Could not save this trip.')); }
    finally { setSaving(false); }
  }
  async function deleteTrip(trip) {
    if (!window.confirm(`Delete “${trip.title}”? This cannot be undone.`)) return;
    setDeletingId(trip._id); setTripError(''); setTripNotice('');
    try { await api.delete(`/trips/${trip._id}`); setTrips((current) => current.filter((item) => item._id !== trip._id)); setTripNotice('Trip deleted.'); }
    catch (error) { setTripError(getApiError(error, 'Could not delete this trip.')); }
    finally { setDeletingId(null); }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header"><div className="dashboard-header-inner shell"><Brand /><nav className="dashboard-nav" aria-label="Dashboard sections"><button type="button" className={activeSection === 'overview' ? 'nav-active' : ''} aria-current={activeSection === 'overview' ? 'page' : undefined} onClick={() => navigateToSection('overview', 'overview-section')}><Compass size={16} /> Overview</button><button type="button" className={activeSection === 'journeys' ? 'nav-active' : ''} aria-current={activeSection === 'journeys' ? 'page' : undefined} onClick={() => navigateToSection('journeys', 'trips-section')}><MapPin size={16} /> Journeys</button><button type="button" className={activeSection === 'journal' ? 'nav-active' : ''} aria-current={activeSection === 'journal' ? 'page' : undefined} onClick={() => navigateToSection('journal', 'journal-section')}><Feather size={16} /> Journal</button></nav><div className="dashboard-user"><span className="active-session"><span className="status-dot" /> ACTIVE SESSION</span><span className="user-avatar" aria-label={`${user?.name} profile`}>{initials(user?.name)}</span><button className="icon-button signout-icon" type="button" onClick={() => setShowSignOut(true)} aria-label="Sign out"><LogOut size={17} /></button></div></div></header>

      <div className="dashboard-content shell">
        <div className="dashboard-greeting-row" id="overview-section"><div><div className="eyebrow"><span className="status-dot" /> YOUR SPACE, YOUR STORIES</div><p className="dashboard-date"><CalendarDays size={14} /> {dateLabel}</p></div><div className="welcome-chip"><CheckCircle2 size={15} /> Week 2 · Trip journal</div></div>
        <section className="dashboard-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(18,49,35,.92) 0%, rgba(18,49,35,.77) 47%, rgba(18,49,35,.15) 100%), url(${landscape})` }}>
          <div className="dashboard-hero-copy"><span className="hero-kicker"><span className="status-dot status-dot-light" /> YOUR JOURNAL IS OPEN</span><h1>Welcome back,<br /><em>{user?.name?.split(' ')[0] || 'traveler'}.</em></h1><p>Every great journey starts with a first page. This one is yours.</p><button className="button button-cream" onClick={openCreate} type="button">Add a trip <Plus size={17} /></button></div>
          <div className="hero-coordinate-card"><MapPin size={15} /><span><strong>Made for the moments</strong><small>that stay with you.</small></span></div><div className="dashboard-hero-decoration"><span /><span /><span /></div>
        </section>

        <section className="dashboard-metrics" aria-label="Account and trip summary">
          <article className="metric-card"><div className="metric-top"><span className="metric-icon metric-icon-sage"><PlaneTakeoff size={18} /></span><span className="metric-state"><CheckCircle2 size={13} /> SAVED</span></div><span className="metric-label">YOUR JOURNEYS</span><strong className="metric-value">{tripsLoading ? '—' : trips.length}</strong><p>{trips.length === 1 ? 'memory in your collection.' : 'memories in your collection.'}</p><div className="metric-bottom"><span className="metric-bar"><i style={{ width: trips.length ? '100%' : '0%' }} /></span><small>Personal trip list</small></div></article>
          <article className="metric-card"><div className="metric-top"><span className="metric-icon metric-icon-cream"><ShieldCheck size={18} /></span><span className="metric-state"><span className="tiny-live-dot" /> ACTIVE</span></div><span className="metric-label">SESSION SECURITY</span><strong className="metric-value">JWT <span className="metric-muted">protected</span></strong><p>Your trips are private to your account.</p><div className="metric-bottom"><span className="security-pill"><ShieldCheck size={13} /> Signed session</span></div></article>
          <article className="metric-card metric-card-dark"><div className="metric-top"><span className="metric-icon metric-icon-dark"><Compass size={18} /></span><span className="metric-state metric-state-dark">YOUR NEXT CHAPTER</span></div><span className="metric-label">READY TO REMEMBER?</span><strong className="metric-value">Add a story<span className="metric-spark">✦</span></strong><p>Save the places and moments that matter.</p><button className="metric-text-action" onClick={openCreate} type="button">Create a trip <ArrowRight size={15} /></button></article>
        </section>

        <section className="trips-section" id="trips-section">
          <div className="trips-section-heading"><div><span className="section-overline">YOUR PERSONAL COLLECTION</span><h2>Your journeys</h2><p>Every destination has a story worth keeping.</p></div><button className="button button-primary" type="button" onClick={openCreate}><Plus size={17} /> Create trip</button></div>
          {tripNotice ? <div className="trip-inline-success"><CheckCircle2 size={16} /> {tripNotice}<button type="button" aria-label="Dismiss message" onClick={() => setTripNotice('')}><X size={14} /></button></div> : null}
          {tripError && !formOpen ? <div className="trip-inline-error">{tripError}<button className="button button-outline" onClick={loadTrips} type="button">Try again</button></div> : null}
          {tripsLoading ? <div className="trips-loading"><LoaderCircle className="spin-icon" size={22} /><span>Gathering your travel memories…</span></div> : trips.length ? <div className="trip-card-grid">{trips.map((trip) => <article className="trip-card" key={trip._id}><div className="trip-card-art"><span className="trip-card-pin"><MapPin size={15} /> {trip.destination}</span><span className="trip-card-rating"><Star size={13} fill="currentColor" /> {trip.rating ? `${trip.rating}/5` : 'Not rated'}</span><div className="trip-card-landscape"><span /><span /><span /></div></div><div className="trip-card-content"><div className="trip-card-dates"><CalendarDays size={14} /> {displayDate(trip.startDate)}{trip.endDate ? ` — ${displayDate(trip.endDate)}` : ''}</div><h3>{trip.title}</h3><p>{trip.description || 'A new chapter in your travel journal.'}</p><div className="trip-card-actions"><button type="button" className="trip-action-edit" onClick={() => openEdit(trip)}><Pencil size={14} /> Edit trip</button><button type="button" className="trip-action-delete" disabled={deletingId === trip._id} onClick={() => deleteTrip(trip)}>{deletingId === trip._id ? <LoaderCircle className="spin-icon" size={14} /> : <Trash2 size={14} />} Delete</button></div></div></article>)}</div> : <div className="trips-empty"><div className="trips-empty-icon"><Compass size={27} /></div><span className="section-overline">A FRESH PAGE</span><h3>Your first journey starts here.</h3><p>Save a destination, add a few notes, and keep the memory close.</p><button className="button button-primary" onClick={openCreate} type="button"><Plus size={16} /> Create your first trip</button></div>}
        </section>

        <section className="journal-section" id="journal-section" aria-labelledby="journal-section-title">
          <div className="journal-section-heading">
            <div><span className="section-overline">THE MEMORY ARCHIVE</span><h2 id="journal-section-title">Your travel journal</h2><p>A quieter view of the places you've been and the moments you chose to keep.</p></div>
            <button className="button button-outline" type="button" onClick={openCreate}><Plus size={16} /> Add a memory</button>
          </div>
          {tripError ? <div className="trip-inline-error">{tripError}<button className="button button-outline" onClick={loadTrips} type="button">Try again</button></div> : null}
          {tripsLoading ? <div className="journal-loading"><LoaderCircle className="spin-icon" size={20} /><span>Gathering your journal entries…</span></div> : trips.length ? <div className="journal-timeline">{journalTrips.map((trip) => <article className="journal-entry" key={trip._id}><div className="journal-entry-marker"><Feather size={16} /></div><div className="journal-entry-card"><div className="journal-entry-meta"><span><CalendarDays size={13} /> {displayDate(trip.startDate || trip.createdAt)}</span><span><MapPin size={13} /> {trip.destination}</span>{trip.rating ? <span className="journal-rating"><Star size={12} fill="currentColor" /> {trip.rating}/5</span> : null}</div><h3>{trip.title}</h3><p>{trip.description?.trim() || 'This memory is saved without notes. Add a few details when you want to remember more of the story.'}</p><div className="journal-entry-footer"><span><CheckCircle2 size={13} /> Saved to your private collection</span><button type="button" onClick={() => navigateToSection('journeys', 'trips-section')}>Manage in Journeys <ArrowRight size={14} /></button></div></div></article>)}</div> : <div className="journal-empty-state"><div className="journal-empty-state-icon"><Feather size={25} /></div><span className="section-overline">A FRESH PAGE</span><h3>Your journal is waiting for its first story.</h3><p>Create a trip in Journeys and its dates, destination, rating, and notes will appear here as a memory entry.</p><button className="button button-primary" type="button" onClick={openCreate}><Plus size={16} /> Add your first memory</button></div>}
        </section>

        <section className="dashboard-lower-grid"><article className="profile-panel"><div className="panel-title-row"><div><span className="section-overline">ACCOUNT DETAILS</span><h2>Your traveler profile</h2></div><span className="profile-round-icon"><ShieldCheck size={19} /></span></div><div className="profile-details"><div className="profile-avatar">{initials(user?.name)}</div><div className="profile-main"><strong>{user?.name}</strong><span>{user?.email}</span></div><span className="profile-verified"><ShieldCheck size={14} /> Signed in</span></div><div className="detail-row"><span>Account status</span><strong><span className="tiny-live-dot" /> Active</strong></div><div className="detail-row"><span>Authentication</span><strong>JWT + bcrypt</strong></div><div className="detail-row"><span>Trip privacy</span><strong className="detail-success"><CheckCircle2 size={14} /> Owner only</strong></div><button className="button button-outline button-full profile-signout" type="button" onClick={() => setShowSignOut(true)}><LogOut size={16} /> Sign out securely</button></article>
          <article className="journal-empty-panel"><div className="journal-panel-top"><div><span className="section-overline">A LITTLE SPACE FOR WONDER</span><h2>Collect places.<br />Keep the feeling.</h2></div><span className="journal-spark-icon"><Compass size={20} /></span></div><div className="journal-art"><div className="journal-art-sun" /><div className="journal-art-mountain mountain-back" /><div className="journal-art-mountain mountain-front" /><div className="journal-art-path" /><div className="journal-art-stamp"><Compass size={24} /><span>GO<br />SLOW</span></div></div><p>Create a trip for a destination you've loved or somewhere you're dreaming of going next.</p><button className="text-link dashboard-roadmap-link" type="button" onClick={openCreate}>Add a memory <ArrowRight size={16} /></button></article></section>
        <div className="dashboard-footer-note"><ShieldCheck size={15} /><span>Your trips are stored securely and only visible to your account.</span><span className="footer-note-separator">·</span><Link to="/">Back to the public site</Link></div>
      </div>

      {formOpen ? <div className="trip-form-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false); }}><section className="trip-form-modal" role="dialog" aria-modal="true" aria-labelledby="trip-form-title"><div className="trip-form-heading"><div><span className="section-overline">YOUR TRAVEL JOURNAL</span><h2 id="trip-form-title">{editingId ? 'Edit your trip' : 'Capture a journey'}</h2><p>A few details are all it takes to keep a memory.</p></div><button type="button" className="icon-button" aria-label="Close form" onClick={() => setFormOpen(false)} disabled={saving}><X size={18} /></button></div>{tripError ? <Notice type="error">{tripError}</Notice> : null}<form className="trip-form" onSubmit={submitTrip}><label>Trip title *<input name="title" value={form.title} onChange={changeField} required maxLength={120} placeholder="e.g. A weekend in the mountains" /></label><label>Destination *<input name="destination" value={form.destination} onChange={changeField} required maxLength={160} placeholder="City or country" /></label><div className="trip-form-two"><label>Start date<input type="date" name="startDate" value={form.startDate} onChange={changeField} /></label><label>End date<input type="date" name="endDate" value={form.endDate} onChange={changeField} min={form.startDate || undefined} /></label></div><label>Rating<select name="rating" value={form.rating} onChange={changeField}><option value="">Not rated yet</option><option value="5">5 — Unforgettable</option><option value="4">4 — Loved it</option><option value="3">3 — Good trip</option><option value="2">2 — Could be better</option><option value="1">1 — Not for me</option></select></label><label>Notes and memories<textarea name="description" value={form.description} onChange={changeField} rows={4} maxLength={3000} placeholder="What made this trip special?" /></label><div className="trip-form-footer"><span>{form.description.length}/3000 characters</span><button className="button button-outline" type="button" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin-icon" size={16} /> : <CheckCircle2 size={16} />}{saving ? 'Saving…' : editingId ? 'Save changes' : 'Save trip'}</button></div></form></section></div> : null}
      {showSignOut ? <Modal title="Leave your journal?" onClose={() => setShowSignOut(false)}><p>Your session token will be removed from this browser. You can sign back in whenever you're ready.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setShowSignOut(false)} type="button">Stay here</button><button className="button button-primary" onClick={handleLogout} type="button"><LogOut size={16} /> Sign out</button></div></Modal> : null}
      {showRoadmap ? <Modal title="Coming Soon" onClose={() => setShowRoadmap(false)} /> : null}
    </main>
  );
}
