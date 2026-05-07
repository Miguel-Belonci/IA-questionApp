import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Plus, Search, Sun, Users } from "lucide-react";
import UserMenu from "../../components/UserMenu.jsx";
import { apiRequest, setToken } from "../../api.js";
import "./home.css";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    apiRequest("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken("");
        navigate("/");
      });
  }, [navigate]);

  async function createRoom(event) {
    event.preventDefault();
    setError("");

    if (!roomName.trim()) {
      setError("Informe um nome para a sala.");
      return;
    }

    if (!/^\d{5,}$/.test(roomPassword)) {
      setError("A senha da sala precisa ter pelo menos 5 digitos.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/rooms", {
        method: "POST",
        body: { name: roomName.trim(), password: roomPassword },
      });
      navigate(`/room/${data.room.code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function enterRoom(event) {
    event.preventDefault();
    setError("");
    const code = roomCode.trim().toUpperCase();

    if (!code) {
      setError("Informe o codigo da sala.");
      return;
    }

    navigate(`/room/${code}`);
  }

  return (
    <div className="home">
      <header className="topbar">
        <Link to="/home" className="logo">
          <span>Q</span>
          QuestionApp
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

      <main className="home-main">
        <section className="home-hero">
          <div>
            <span className="eyebrow">Ola, {user?.name || "usuario"}</span>
            <h1>Salas para perguntas ao vivo.</h1>
            <p>
              Crie uma sala, compartilhe o codigo e gerencie as perguntas com
              leitura, exclusao e envio em tempo real pela interface.
            </p>
          </div>
        </section>

        <section className="home-panel" aria-label="Criar ou entrar em salas">
          {error && <div className="form-error">{error}</div>}

          <form className="action-card" onSubmit={createRoom}>
            <div className="card-title">
              <Plus size={22} />
              <h2>Criar sala</h2>
            </div>
            <label htmlFor="room-name">Nome da sala</label>
            <input
              id="room-name"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Ex: Perguntas da aula"
            />
            <label htmlFor="room-password">Senha da sala</label>
            <input
              id="room-password"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={roomPassword}
              onChange={(event) => setRoomPassword(event.target.value)}
              placeholder="Minimo 5 digitos"
            />
            <button className="primary-button" type="submit" disabled={loading}>
              <Users size={18} />
              {loading ? "Criando..." : "Criar e entrar"}
            </button>
          </form>

          <div className="separator">
            <span>ou</span>
          </div>

          <form className="action-card" onSubmit={enterRoom}>
            <div className="card-title">
              <Search size={22} />
              <h2>Entrar em sala</h2>
            </div>
            <label htmlFor="room-code">Codigo da sala</label>
            <input
              id="room-code"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Ex: 23456"
            />
            <button className="secondary-button" type="submit">
              Entrar na sala
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Home;
