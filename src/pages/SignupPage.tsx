import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { messages } from '../lib/messages';
import { getSupabaseClient } from '../lib/supabase/client';

export function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [detailsAcknowledged, setDetailsAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setConfirmation(null);
    setSubmitting(true);

    try {
      const { data, error: signupError } = await getSupabaseClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            business_name: businessName.trim(),
          },
        },
      });

      if (signupError) throw signupError;
      if (data.session) {
        navigate('/', { replace: true });
        return;
      }

      setConfirmation(
        'Check your email for a confirmation link to finish creating your account.',
      );
    } catch (signupError) {
      setError(
        signupError instanceof Error ? signupError.message : messages.signUpError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <header className="auth-card__header">
          <span className="auth-card__brand-icon" aria-hidden="true">
            <Package size={28} />
          </span>
          <p className="auth-card__brand">ShelfWise<span>.</span></p>
          <h1 className="page-title" id="signup-title">Create your account</h1>
          <p className="page-subtitle">Start managing your business inventory today.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <TextField
            label="Full name"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            maxLength={120}
            required
          />
          <TextField
            label="Business name"
            name="businessName"
            autoComplete="organization"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            maxLength={120}
            required
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <div className="auth-form__password">
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              hint="Use at least 6 characters."
              required
            />
            <button
              className="auth-form__password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="auth-form__checks">
            <label>
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(event) => setAgeConfirmed(event.target.checked)}
                required
              />
              <span>I am 18 or older.</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={detailsAcknowledged}
                onChange={(event) => setDetailsAcknowledged(event.target.checked)}
                required
              />
              <span>
                I understand my details will be used to create and manage my account.
              </span>
            </label>
          </div>

          {error ? <p className="notice notice--error" role="alert">{error}</p> : null}
          {confirmation ? (
            <p className="notice notice--success" role="status">{confirmation}</p>
          ) : null}

          <Button type="submit" className="auth-form__submit" loading={submitting}>
            Create account
          </Button>
        </form>

        <p className="form-note">
          By creating an account, you agree to use ShelfWise responsibly.
        </p>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
