import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';

export default function PasswordField({ id = 'password', label = 'Password', value, onChange, placeholder = 'Enter your password', autoComplete = 'current-password', hint, required = true }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field-group">
      <div className="field-label-row">
        <label className="field-label" htmlFor={id}>{label}</label>
        {hint ? <span className="field-hint">{hint}</span> : null}
      </div>
      <div className="input-wrap">
        <LockKeyhole className="input-icon" size={18} aria-hidden="true" />
        <input
          id={id}
          name={id}
          className="form-input has-leading has-trailing"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={8}
          required={required}
        />
        <button className="input-icon-button" type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide password' : 'Show password'}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
