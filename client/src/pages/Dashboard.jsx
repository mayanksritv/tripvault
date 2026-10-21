import { ArrowRight, CalendarDays, CheckCircle2, Compass, Feather, Globe2, KeyRound, LogOut, MapPin, ShieldCheck, Sparkles, UserRound, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const landscape = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85';

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'T';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSignOut, setShowSignOut] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const dateLabel = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header"><div className="dashboard-header-inner shell"><Brand /><nav className="dashboard-nav"><span className="nav-active"><Compass size={16} /> Overview</span><button type="button" onClick={() => setShowRoadmap(true)}><MapPin size={16} /> Journeys <small>SOON</small></button><button type="button" onClick={() => setShowRoadmap(true)}><Feather size={16} /> Journal <small>SOON</small></button></nav><div className="dashboard-user"><span className="active-session"><span className="status-dot" /> ACTIVE SESSION</span><span className="user-avatar" aria-label={`${user?.name} profile`}>{initials(user?.name)}</span><button className="icon-button signout-icon" type="button" onClick={() => setShowSignOut(true)} aria-label="Sign out"><LogOut size={17} /></button></div></div></header>

      <div className="dashboard-content shell">
        <div className="dashboard-greeting-row"><div><div className="eyebrow"><span className="status-dot" /> YOUR SPACE, YOUR STORIES</div><p className="dashboard-date"><CalendarDays size={14} /> {dateLabel}</p></div><div className="welcome-chip"><Sparkles size={15} /> Week 1 · Foundation ready</div></div>

        <section className="dashboard-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(18,49,35,.92) 0%, rgba(18,49,35,.77) 47%, rgba(18,49,35,.15) 100%), url(${landscape})` }}>
          <div className="dashboard-hero-copy"><span className="hero-kicker"><span className="status-dot status-dot-light" /> YOUR JOURNAL IS OPEN</span><h1>Welcome back,<br /><em>{user?.name?.split(' ')[0] || 'traveler'}.</em></h1><p>Every great journey starts with a first page. This one is yours.</p><Link className="button button-cream" to="/">Explore TripVault <ArrowRight size={17} /></Link></div>
          <div className="hero-coordinate-card"><MapPin size={15} /><span><strong>Made for the moments</strong><small>that stay with you.</small></span></div>
          <div className="dashboard-hero-decoration"><span /><span /><span /></div>
        </section>

        <section className="dashboard-metrics" aria-label="Account status">
          <article className="metric-card"><div className="metric-top"><span className="metric-icon metric-icon-sage"><UserRound size={18} /></span><span className="metric-state"><CheckCircle2 size={13} /> CREATED</span></div><span className="metric-label">YOUR ACCOUNT</span><strong className="metric-value">Ready</strong><p>Your profile is set up and connected.</p><div className="metric-bottom"><span className="metric-bar"><i style={{ width: '100%' }} /></span><small>Profile complete</small></div></article>
          <article className="metric-card"><div className="metric-top"><span className="metric-icon metric-icon-cream"><KeyRound size={18} /></span><span className="metric-state"><span className="tiny-live-dot" /> ACTIVE</span></div><span className="metric-label">SESSION SECURITY</span><strong className="metric-value">JWT <span className="metric-muted">protected</span></strong><p>Your token was verified by the API.</p><div className="metric-bottom"><span className="security-pill"><ShieldCheck size={13} /> Signed session</span></div></article>
          <article className="metric-card metric-card-dark"><div className="metric-top"><span className="metric-icon metric-icon-dark"><Compass size={18} /></span><span className="metric-state metric-state-dark">NEXT CHAPTER</span></div><span className="metric-label">TRAVEL MEMORIES</span><strong className="metric-value">On the way<span className="metric-spark">✦</span></strong><p>Trip entries and photo uploads are planned for Week 2.</p><button className="metric-text-action" onClick={() => setShowRoadmap(true)} type="button">View project roadmap <ArrowRight size={15} /></button></article>
        </section>

        <section className="dashboard-lower-grid">
          <article className="profile-panel"><div className="panel-title-row"><div><span className="section-overline">ACCOUNT DETAILS</span><h2>Your traveler profile</h2></div><span className="profile-round-icon"><UserRound size={19} /></span></div><div className="profile-details"><div className="profile-avatar">{initials(user?.name)}</div><div className="profile-main"><strong>{user?.name}</strong><span>{user?.email}</span></div><span className="profile-verified"><ShieldCheck size={14} /> Signed in</span></div><div className="detail-row"><span>Account status</span><strong><span className="tiny-live-dot" /> Active</strong></div><div className="detail-row"><span>Authentication</span><strong>JWT + bcrypt</strong></div><div className="detail-row"><span>Protected profile</span><strong className="detail-success"><CheckCircle2 size={14} /> Verified</strong></div><button className="button button-outline button-full profile-signout" type="button" onClick={() => setShowSignOut(true)}><LogOut size={16} /> Sign out securely</button></article>

          <article className="journal-empty-panel"><div className="journal-panel-top"><div><span className="section-overline">A LITTLE SPACE FOR WONDER</span><h2>Your first story<br />is still ahead.</h2></div><span className="journal-spark-icon"><WandSparkles size={20} /></span></div><div className="journal-art"><div className="journal-art-sun" /><div className="journal-art-mountain mountain-back" /><div className="journal-art-mountain mountain-front" /><div className="journal-art-path" /><div className="journal-art-stamp"><Compass size={24} /><span>GO<br />SLOW</span></div></div><p>Your account is ready. In the next project phase, you'll be able to save trips, add photos, and keep notes from the road.</p><button className="text-link dashboard-roadmap-link" type="button" onClick={() => setShowRoadmap(true)}>What comes next <ArrowRight size={16} /></button></article>
        </section>

        <div className="dashboard-footer-note"><ShieldCheck size={15} /><span>Your password is stored as a hash. Your dashboard is protected by a verified JWT.</span><span className="footer-note-separator">·</span><Link to="/">Back to the public site</Link></div>
      </div>

      {showSignOut ? <Modal title="Leave your journal?" onClose={() => setShowSignOut(false)}><p>Your session token will be removed from this browser. You can sign back in whenever you're ready.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setShowSignOut(false)} type="button">Stay here</button><button className="button button-primary" onClick={handleLogout} type="button"><LogOut size={16} /> Sign out</button></div></Modal> : null}
      {showRoadmap ? <Modal title="The journey ahead" onClose={() => setShowRoadmap(false)}><p>Your Week 1 foundation is in place. These features are intentionally shown as upcoming because they are outside the authentication scope of the supplied Week 1 brief.</p><div className="roadmap-list"><div className="roadmap-item roadmap-done"><span><CheckCircle2 size={16} /></span><div><strong>Week 1 · Project setup & authentication</strong><small>Register, login, hashed passwords, JWT, protected profile.</small></div><b>DONE</b></div><div className="roadmap-item"><span><MapPin size={16} /></span><div><strong>Week 2 · Trips and memories</strong><small>Create and organize journeys.</small></div><b>UP NEXT</b></div><div className="roadmap-item"><span><Feather size={16} /></span><div><strong>Week 3 · Photos and journal</strong><small>Add visual memories and trip notes.</small></div><b>PLANNED</b></div><div className="roadmap-item"><span><Globe2 size={16} /></span><div><strong>Week 4 · Sharing and polish</strong><small>Share stories and round out the experience.</small></div><b>PLANNED</b></div></div></Modal> : null}
    </main>
  );
}
