import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../../lib/supabase/client';

type Props = { title: string; signedIn?: boolean };

export function AppHeader({ title, signedIn = false }: Props) {
  const navigate = useNavigate();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function signOut() {
    setSignOutError(null);
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) {
        setSignOutError('We couldn’t log you out. Please try again.');
        return;
      }
      navigate('/', { replace: true });
    } catch {
      setSignOutError('We couldn’t log you out. Please try again.');
    }
  }

  return (
    <header className="app-header">
      <Link className="brand" to={signedIn ? '/products' : '/'} aria-label="ShelfWise home">
        ShelfWise
      </Link>
      <div className="app-header__right">
        <span className="app-header__title">{title}</span>
        {signOutError ? <span role="alert" className="header-error">{signOutError}</span> : null}
        {signedIn ? (
          <details className="account-menu">
            <summary className="account-button">
              <span>Account</span>
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <div className="account-menu__panel">
              <button type="button" className="account-menu__item" onClick={signOut}>
                <LogOut size={16} aria-hidden="true" />
                Log out
              </button>
            </div>
          </details>
        ) : null}
      </div>
    </header>
  );
}
