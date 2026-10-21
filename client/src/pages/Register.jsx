import { ArrowLeft, ArrowRight, Check, Compass, ShieldCheck, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLoader from '../components/AppLoader';
import Brand from '../components/Brand';
import Modal from '../components/Modal';
import Notice from '../components/Notice';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../api';

const scenes = [
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=520&q=80',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=520&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=520&q=80'
];

export default function Register() {
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoModal, setInfoModal] = useState('');

  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 3);
  }, [password]);
  const strengthLabel = ['Add 8+ characters', 'Getting there', 'Good', 'Strong'][strength];

  if (authLoading) return <AppLoader label="Opening your journal…" />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (name.trim().length < 2) return setError('Please enter your full name.');
    if (password.length < 8) return setError('Use at least 8 characters for your password.');
    if (new TextEncoder().encode(password).length > 72) return setError('Password must be no more than 72 UTF-8 bytes.');
    if (password !== confirm) return setError('Those passwords do not match yet.');
    if (!agreed) return setError('Please accept the Terms of Service and Privacy Policy to continue.');

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/login', { replace: true, state: { registered: true, registeredEmail: email.trim() } });
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="register-page">
      <header className="register-header shell"><Brand /><Link className="back-home back-home-dark" to="/"><ArrowLeft size={15} /> Back to home</Link></header>
      <div className="register-layout shell">
        <section className="register-intro">
          <div className="eyebrow"><span className="status-dot" /> START YOUR JOURNEY</div>
          <h1>Start logging<br />your adventures <em>today.</em></h1>
          <p>Create your account to set up your own little corner of the world — a home for the places you've been and the moments worth keeping.</p>
          <div className="register-photo-strip">{scenes.map((src, index) => <div className={`register-photo photo-${index + 1}`} key={src} style={{ backgroundImage: `url(${src})` }} />)}</div>
          <div className="register-promise"><span className="promise-icon"><ShieldCheck size={18} /></span><div><strong>Your memories stay yours.</strong><span>Passwords are hashed, and your journal is behind a signed login session.</span></div></div>
          <div className="register-orbit register-orbit-one" /><div className="register-orbit register-orbit-two" />
        </section>

        <section className="register-form-card">
          <div className="card-topline"><span>YOUR PERSONAL JOURNAL</span><span className="card-top-icon"><Compass size={16} /></span></div>
          <div className="register-form-heading"><h2>Make it yours.</h2><p>A few details and you're on your way.</p></div>
          <form className="auth-form register-form" onSubmit={handleSubmit} noValidate>
            <Notice>{error}</Notice>
            <div className="field-group"><label className="field-label" htmlFor="full-name">Full name</label><div className="input-wrap"><UserRound className="input-icon" size={18} /><input className="form-input has-leading" id="full-name" type="text" placeholder="Alex Morgan" autoComplete="name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} required /></div></div>
            <div className="field-group"><label className="field-label" htmlFor="register-email">Email address</label><div className="input-wrap"><span className="input-leading-char" aria-hidden="true">@</span><input className="form-input has-leading" id="register-email" type="email" placeholder="you@example.com" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required /></div></div>
            <div className="field-group"><div className="field-label-row"><label className="field-label" htmlFor="register-password">Password</label><span className={`strength-label strength-${strength}`}>{strengthLabel}</span></div><PasswordField id="register-password" label="" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" autoComplete="new-password" hint={null} /><div className="strength-meter" aria-label={`Password strength: ${strengthLabel}`}>{[1, 2, 3].map((bar) => <span className={strength >= bar ? 'filled' : ''} key={bar} />)}</div><small className="field-help">At least 8 characters. A mix of letters and numbers is even better.</small></div>
            <PasswordField id="confirm-password" label="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Enter it one more time" autoComplete="new-password" />
            <label className="check-label agreement-check"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span className="custom-check"><Check size={13} /></span><span>I agree to the <button type="button" className="inline-legal-link" onClick={() => setInfoModal('terms')}>Terms of Service</button> and <button type="button" className="inline-legal-link" onClick={() => setInfoModal('privacy')}>Privacy Policy</button>.</span></label>
            <button className="button button-primary button-full button-submit" type="submit" disabled={submitting}>{submitting ? <><span className="spinner" /> Creating your account…</> : <>Create account & start journal <ArrowRight size={18} /></>}</button>
          </form>
          <div className="register-login-switch">Already have a journal? <Link to="/login">Sign in <ArrowRight size={15} /></Link></div>
          <div className="register-vault-note"><ShieldCheck size={16} /><span><strong>TripVault promise</strong> · Private travel memories, thoughtfully kept.</span></div>
        </section>
      </div>
      <footer className="register-footer shell"><span>TripVault · Week 1 foundation</span><span>Small moments. Long memories.</span></footer>
      {infoModal ? <Modal title={infoModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'} onClose={() => setInfoModal('')}>
        {infoModal === 'terms' ? <><p>TripVault is a Week 1 internship project for building a secure account and session foundation. Use an email address you control and keep your password private.</p><p>Trip and photo features are planned for later project weeks and are not active in this build.</p></> : <><p>This Week 1 build stores your name, email address, and a bcrypt-hashed password in the configured MongoDB database. It does not store your raw password.</p><p>After sign-in, a JWT is stored in this browser's local storage to maintain the session. Sign out to remove it from this browser.</p></>}
      </Modal> : null}
    </main>
  );
}
