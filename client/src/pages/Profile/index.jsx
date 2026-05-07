import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Moon, Sun } from 'lucide-react';
import UserMenu from '../../components/UserMenu.jsx';
import { apiRequest, setToken } from '../../api.js';
import './profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    apiRequest('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken('');
        navigate('/');
      });
  }, [navigate]);

  async function changePassword(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('A confirmacao precisa ser igual a nova senha.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/auth/password', {
        method: 'PATCH',
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });
      setSuccess(data.message);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-page">
      <header className="topbar">
        <Link to="/home" className="logo">
          <span>Q</span>
          QuestionApp
        </Link>

        <nav className="topbar-actions">
          <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Alternar tema">
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <UserMenu />
        </nav>
      </header>

      <main className="profile-main">
        <section className="profile-hero">
          <Link className="back-link" to="/home"><ArrowLeft size={18} /> Voltar</Link>
          <span className="eyebrow">Perfil</span>
          <h1>{user?.name || 'Usuario'}</h1>
          <p>{user?.email}</p>
        </section>

        <form className="profile-card" onSubmit={changePassword}>
          <div className="card-title">
            <KeyRound size={22} />
            <h2>Trocar senha</h2>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <label htmlFor="current-password">Senha atual</label>
          <input id="current-password" type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} required />

          <label htmlFor="new-password">Nova senha</label>
          <input id="new-password" type="password" minLength={6} value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} required />

          <label htmlFor="confirm-password">Confirmar nova senha</label>
          <input id="confirm-password" type="password" minLength={6} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Profile;
