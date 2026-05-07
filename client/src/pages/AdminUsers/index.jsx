import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, ShieldCheck, Sun, Users } from 'lucide-react';
import UserMenu from '../../components/UserMenu.jsx';
import { apiRequest } from '../../api.js';
import '../Admin/admin.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/admin/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUser(user) {
    setError('');
    try {
      const data = await apiRequest(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: { active: !user.active },
      });
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, ...data.user } : item));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-page">
      <header className="topbar">
        <Link to="/home" className="logo"><span>Q</span>QuestionApp</Link>
        <nav className="topbar-actions">
          <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Alternar tema">
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <UserMenu />
        </nav>
      </header>

      <main className="admin-main">
        <section className="admin-heading">
          <span className="eyebrow">Admin</span>
          <h1>Usuarios</h1>
          <p>Veja contas cadastradas, status e permissao. Administradores ficam sempre ativos.</p>
        </section>

        <section className="admin-card">
          <div className="admin-card-title">
            <Users size={22} />
            <h2>Lista de usuarios</h2>
            <Link className="secondary-button" to="/admin/rooms">Ver salas</Link>
          </div>

          {error && <div className="form-error">{error}</div>}
          {loading ? (
            <div className="table-empty">Carregando usuarios...</div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className="status-pill"><ShieldCheck size={14} />{user.role}</span></td>
                      <td><span className={`status-pill ${user.active ? 'is-active' : 'is-inactive'}`}>{user.active ? 'Ativo' : 'Inativo'}</span></td>
                      <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <button className={user.active ? 'danger-button compact' : 'primary-button compact'} type="button" onClick={() => toggleUser(user)} disabled={user.role === 'admin'}>
                          {user.active ? 'Inativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminUsers;
