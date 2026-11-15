import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Package } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { messages } from '../lib/messages';
import { getSupabaseClient } from '../lib/supabase/client';

type LoginLocationState = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(messages.signInError);
        return;
      }

      const from = (location.state as LoginLocationState | null)?.from;
      const pathname = from?.pathname;
      const destination =
        pathname?.startsWith('/') && !pathname.startsWith('//')
          ? { pathname, search: from?.search ?? '', hash: from?.hash ?? '' }
          : '/';
      navigate(destination, { replace: true });
    } catch (signInError) {
      setError(
        signInError instanceof Error && signInError.message === messages.configurationError
          ? signInError.message
          : messages.signInError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <header className="auth-card__header">
          <span className="auth-card__brand-icon" aria-hidden="true">
            <Package size={28} />
          </span>
          <p className="auth-card__brand">ShelfWise<span>.</span></p>
          <h1 className="page-title" id="login-title">Welcome back</h1>
          <p className="page-subtitle">Sign in to manage your business inventory.</p>
        </header>

        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
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
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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

          {error ? <p className="notice notice--error" role="alert">{error}</p> : null}

          <Button type="submit" className="auth-form__submit" loading={submitting}>
            Sign in
          </Button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </main>
  );
}
