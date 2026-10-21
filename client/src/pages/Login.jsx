import { ArrowLeft, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppLoader from '../components/AppLoader';
import Brand from '../components/Brand';
import Notice from '../components/Notice';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../api';

const scene = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1500&q=85';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.registered ? 'Your account is ready. Sign in to open your journal.' : '');
  const [showResetInfo, setShowResetInfo] = useState(false);

  if (authLoading) return <AppLoader label="Checking your session…" />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password }, { remember });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" style={{ backgroundImage: `linear-gradient(180deg, rgba(14,39,27,.08) 0%, rgba(14,39,27,.3) 45%, rgba(14,39,27,.82) 100%), url(${scene})` }}>
        <Brand light />
        <Link className="back-home" to="/"><ArrowLeft size={15} /> Back to home</Link>
        <div className="auth-visual-content"><span className="image-eyebrow"><span className="status-dot status-dot-light" /> A JOURNAL THAT GOES WITH YOU</span><h1>Every journey<br />leaves a little<br /><em>light behind.</em></h1><p>Come back to the places, people, and small moments that made the trip yours.</p><div className="visual-bottom-meta"><span><Compass size={15} /> Your own private atlas</span><span>45° 49′ N · 6° 52′ E</span></div></div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top"><div className="secure-pill"><ShieldCheck size={15} /> SECURE ACCESS</div><div className="version-pill"><span className="status-dot" /> SESSION PROTECTED</div></div>
        <div className="auth-form-wrap">
          <div className="auth-heading"><div className="eyebrow"><span className="status-dot" /> WELCOME BACK</div><h2>Pick up where<br />you <em>left off.</em></h2><p>Sign in to return to your personal travel journal.</p></div>
          <div className="memory-preview"><div className="memory-preview-image" style={{ backgroundImage: `url(${scene})` }} /><div className="memory-preview-copy"><span className="field-label">A PLACE FOR WHAT MATTERS</span><strong>Your next memory is waiting.</strong><small>A little space to remember it all.</small></div><span className="memory-preview-mark"><Compass size={17} /></span></div>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <Notice>{error}</Notice><Notice type="success">{info}</Notice>
            <div className="field-group"><label className="field-label" htmlFor="login-email">Email address</label><div className="input-wrap"><span className="input-leading-char" aria-hidden="true">@</span><input className="form-input has-leading" id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></div>
            <PasswordField id="login-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
            <div className="form-options"><label className="check-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="custom-check" /> Keep me signed in</label><button className="subtle-link" type="button" onClick={() => setShowResetInfo((value) => !value)}>Forgot password?</button></div>
            {showResetInfo ? <Notice type="info">Password-reset emails are not part of the Week 1 API yet. For a local test account, create a new account or update it in your own database.</Notice> : null}
            <button className="button button-primary button-full button-submit" type="submit" disabled={submitting}>{submitting ? <><span className="spinner" /> Signing you in…</> : <>Sign in to your journal <ArrowRight size={18} /></>}</button>
            <div className="auth-divider"><span /> <small>YOUR MEMORIES, YOUR SPACE</small> <span /></div>
            <div className="privacy-note"><ShieldCheck size={18} /><p><strong>Private by design</strong><span>Your password is securely hashed. Your session uses a signed token.</span></p></div>
          </form>
          <p className="auth-switch">New to TripVault? <Link to="/register">Create an account <ArrowRight size={15} /></Link></p>
        </div>
        <footer className="auth-footer"><Brand compact /><span>For everywhere you've been.</span></footer>
      </section>
    </main>
  );
}
