import { useState, type FormEvent } from 'react';
import { CircleAlert, Eye, EyeOff, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthProvider';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { messages } from '../lib/messages';
import { getSupabaseClient } from '../lib/supabase/client';

export function ForgotPasswordPage() {
  const { session, loading, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const settingNewPassword = Boolean(session && isPasswordRecovery);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setConfirmation(null);

    if (!online) {
      setError(messages.authOffline);
      return;
    }

    if (settingNewPassword && password.length < 6) {
      setError(messages.passwordTooShort);
      return;
    }

    setSubmitting(true);

    try {
      const auth = getSupabaseClient().auth;
      if (settingNewPassword) {
        const { error: updateError } = await auth.updateUser({ password });
        if (updateError) {
          setError(messages.passwordResetUpdateError);
          return;
        }

        clearPasswordRecovery();
        navigate('/', { replace: true });
        return;
      }

      const { error: requestError } = await auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/forgot-password`,
      });
      if (requestError) {
        setError(messages.passwordResetRequestError);
        return;
      }

      setConfirmation(messages.passwordResetSent);
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message === messages.configurationError
          ? requestError.message
          : settingNewPassword
            ? messages.passwordResetUpdateError
            : messages.passwordResetRequestError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="center-state" role="status">
        <span className="loading-spinner" aria-hidden="true" />
        <span>Loading your account…</span>
      </main>
    );
  }

  if (session && !isPasswordRecovery) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1 className="page-title">You’re already signed in</h1>
          <p className="page-subtitle">Open your password reset email to set a new password.</p>
          <p className="auth-switch"><Link to="/">Back to ShelfWise</Link></p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="forgot-password-title">
        <header className="auth-card__header">
          <span className="auth-card__brand-icon" aria-hidden="true">
            <Package size={28} />
          </span>
          <p className="auth-card__brand">ShelfWise<span>.</span></p>
          <h1 className="page-title" id="forgot-password-title">
            {settingNewPassword ? 'Create a new password' : 'Forgot your password?'}
          </h1>
          <p className="page-subtitle">
            {settingNewPassword
              ? 'Choose a new password for your account.'
              : 'Enter your email and we’ll send you a password reset link.'}
          </p>
        </header>

        {!online ? (
          <p className="notice notice--offline" role="status">{messages.authOffline}</p>
        ) : null}

        <form
          className="auth-form"
          aria-label={settingNewPassword ? 'Set new password' : 'Request password reset'}
          onSubmit={(event) => void handleSubmit(event)}
        >
          {settingNewPassword ? (
            <div className="auth-form__password">
              <TextField
                label="New password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                hint="Use at least 6 characters."
                disabled={submitting}
                required
              />
              <button
                className="auth-form__password-toggle"
                type="button"
                disabled={submitting}
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          ) : (
            <TextField
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              required
            />
          )}

          {error ? (
            <p className="notice notice--error" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{error}</span>
            </p>
          ) : null}
          {confirmation ? (
            <p className="notice notice--success" role="status">{confirmation}</p>
          ) : null}

          <Button type="submit" className="auth-form__submit" loading={submitting}>
            {settingNewPassword ? 'Update password' : 'Send reset link'}
          </Button>
        </form>

        {!settingNewPassword ? (
          <p className="auth-switch">
            <Link to="/login">Back to log in</Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}
