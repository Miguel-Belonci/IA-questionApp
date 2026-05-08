import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DoorOpen, Moon, Sun } from "lucide-react";
import UserMenu from "../../components/UserMenu.jsx";
import { apiRequest } from "../../api.js";
import "../Admin/admin.css";

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  const selectedUserName = useMemo(() => {
    const user = users.find(
      (item) => String(item.id) === String(selectedUserId),
    );
    return user ? user.name : "Todos os usuarios";
  }, [selectedUserId, users]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    apiRequest("/admin/users")
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetchRooms(selectedUserId);
  }, [selectedUserId]);

  async function fetchRooms(userId) {
    setLoading(true);
    setError("");
    try {
      const path = userId ? `/admin/rooms?userId=${userId}` : "/admin/rooms";
      const data = await apiRequest(path);
      setRooms(data.rooms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="topbar">
        <Link to="/home" className="logo">
          <span>Q</span>QuestionApp
        </Link>
        <nav className="topbar-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Alternar tema"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <UserMenu />
        </nav>
      </header>

      <main className="admin-main">
        <section className="admin-heading">
          <span className="eyebrow">Admin</span>
          <h1>Salas</h1>
          <p>
            Visualize todas as salas criadas e filtre por dono para acompanhar
            atividade.
          </p>
        </section>

        <section className="admin-card">
          <div className="admin-card-title">
            <DoorOpen size={22} />
            <h2>{selectedUserName}</h2>
            <Link className="secondary-button" to="/admin/users">
              Ver usuários
            </Link>
          </div>

          <label htmlFor="user-filter">Filtrar por usuário</label>
          <select
            id="user-filter"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
          >
            <option value="">Todos os usuários</option>
            {users.map((user) => (
              <option value={user.id} key={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>

          {error && <div className="form-error">{error}</div>}
          {loading ? (
            <div className="table-empty">Carregando salas...</div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Código</th>
                    <th>Dono</th>
                    <th>Status do dono</th>
                    <th>Perguntas</th>
                    <th>Abertas</th>
                    <th>Lidas</th>
                    <th>Criada em</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td>{room.name}</td>
                      <td>{room.code}</td>
                      <td>
                        {room.owner?.name || "Sem dono"}
                        <span className="muted-line">{room.owner?.email}</span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${room.owner?.active ? "is-active" : "is-inactive"}`}
                        >
                          {room.owner?.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>{room.questionsCount}</td>
                      <td>{room.openQuestionsCount}</td>
                      <td>{room.readQuestionsCount}</td>
                      <td>
                        {new Date(room.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rooms.length === 0 && (
                <div className="table-empty">Nenhuma sala encontrada.</div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminRooms;
