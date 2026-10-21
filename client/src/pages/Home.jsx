import { ArrowDownRight, ArrowRight, ArrowUpRight, Camera, Compass, Feather, Globe2, LockKeyhole, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';

const landscape = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85';
const notebook = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80';
const coast = 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80';

export default function Home() {
  const { user } = useAuth();
  return (
    <main className="home-page">
      <header className="site-header shell">
        <Brand />
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#why-tripvault">Why TripVault</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="header-actions">
          {user ? <Link className="button button-primary button-small" to="/dashboard">Open journal <ArrowRight size={16} /></Link> : <>
            <Link className="header-signin" to="/login">Sign in</Link>
            <Link className="button button-primary button-small" to="/register">Create account <ArrowRight size={16} /></Link>
          </>}
        </div>
      </header>

      <section className="hero shell">
        <div className="hero-copy rise-in">
          <div className="eyebrow"><span className="status-dot" /> A little more meaning in every mile</div>
          <h1>Keep the places<br />that <em>changed you.</em></h1>
          <p className="hero-description">A quieter place for your travel stories. Save the details, hold on to the feeling, and revisit the moments that made a place unforgettable.</p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" to={user ? '/dashboard' : '/register'}>{user ? 'Return to your journal' : 'Start your journal'} <ArrowRight size={18} /></Link>
            <a className="text-link" href="#how-it-works">Take a look <ArrowDownRight size={16} /></a>
          </div>
          <div className="hero-footnote"><span className="avatar-stack"><i>✦</i><i>✧</i><i>◌</i></span><span>Made for the stories you want to keep.</span></div>
        </div>

        <div className="hero-visual rise-in rise-delay-1" aria-label="A peaceful mountain lake and travel journal">
          <div className="hero-photo" style={{ backgroundImage: `url(${landscape})` }}>
            <div className="photo-top-label"><span className="photo-live-dot" /> A PLACE TO COME BACK TO</div>
            <div className="photo-caption"><span className="caption-marker"><MapPin size={14} /></span><div><strong>Somewhere in the Alps</strong><small>46° 34′ N · 11° 51′ E</small></div><span className="caption-arrow"><ArrowUpRight size={18} /></span></div>
          </div>
          <div className="floating-note"><span className="note-icon"><Feather size={17} /></span><div><strong>Leave room for wonder.</strong><small>Your memories, thoughtfully kept.</small></div><Sparkles className="note-sparkle" size={17} /></div>
          <div className="photo-thumb photo-thumb-one" style={{ backgroundImage: `url(${notebook})` }} aria-label="Open travel journal" />
          <div className="photo-thumb photo-thumb-two" style={{ backgroundImage: `url(${coast})` }} aria-label="Coastal travel landscape" />
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        </div>
      </section>

      <section className="quiet-proof shell" id="why-tripvault">
        <div className="proof-line" />
        <p><span>TRAVEL IS MORE THAN A PIN ON A MAP.</span> It's the smell of the morning market, the wrong turn that became a story, the quiet you brought home.</p>
        <div className="proof-line" />
      </section>

      <section className="features shell" id="how-it-works">
        <div className="section-intro">
          <div className="eyebrow"><span className="eyebrow-icon"><Compass size={15} /></span> A home for your wanderings</div>
          <h2>Collect moments.<br /><em>Not just destinations.</em></h2>
          <p>TripVault is being built around the parts of travel that stay with you long after you've unpacked.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card feature-card-main"><span className="feature-icon"><Feather size={19} /></span><h3>Stories with a sense of place</h3><p>Keep each journey connected to the notes, little discoveries, and details that made it yours.</p><span className="feature-index">01 / REMEMBER</span><div className="feature-illustration illustration-notes"><span>field notes</span><div className="note-lines" /><div className="note-lines short" /><div className="note-stamp">TV</div></div></article>
          <article className="feature-card"><span className="feature-icon"><Camera size={19} /></span><h3>Make room for the details</h3><p>Photos and journal entries will sit together, so a memory feels like the moment it came from.</p><span className="feature-index">02 / COLLECT</span><div className="feature-illustration illustration-camera"><div className="camera-lens" /><div className="camera-sun" /></div></article>
          <article className="feature-card"><span className="feature-icon"><Globe2 size={19} /></span><h3>Your own atlas of memories</h3><p>Find your way back to a place through the story you wrote there.</p><span className="feature-index">03 / RETURN</span><div className="feature-illustration illustration-map"><span className="map-route route-a"/><span className="map-route route-b"/><span className="map-pin pin-a"/><span className="map-pin pin-b"/><span className="map-pin pin-c"/></div></article>
        </div>
      </section>

      <section className="cta-band shell">
        <div className="cta-decoration"><span /><span /><span /></div>
        <div><div className="eyebrow eyebrow-light"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</div><h2>Some memories deserve<br />a place of their own.</h2></div>
        <Link className="button button-cream button-large" to={user ? '/dashboard' : '/register'}>{user ? 'Open your journal' : 'Create your account'} <ArrowRight size={18} /></Link>
      </section>

      <footer className="site-footer shell"><Brand compact /><p>For everywhere you've been, and all the places still calling.</p><span>© {new Date().getFullYear()} TripVault</span><div className="footer-lock"><LockKeyhole size={14} /> Private by design</div></footer>
    </main>
  );
}
