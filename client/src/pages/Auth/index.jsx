import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Sparkles, UserPlus } from "lucide-react";
import { apiRequest, setToken } from "../../api.js";
import "./auth.css";

function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest(
        isRegister ? "/auth/register" : "/auth/login",
        {
          method: "POST",
          body: isRegister
            ? form
            : { email: form.email, password: form.password },
        },
      );
      setToken(data.token);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-hidden="true">
        <div className="brand-mark">
          <Sparkles size={24} />
          QuestionApp
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>{isRegister ? "Criar conta" : "Entrar"}</h1>
          <p>
            {isRegister
              ? "Crie sua conta para abrir salas e moderar perguntas."
              : "Acesse para criar salas, receber perguntas e organizar tudo ao vivo."}
          </p>

          {error && <div className="form-error">{error}</div>}

          {isRegister && (
            <label>
              Nome
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading ? "Aguarde..." : isRegister ? "Criar conta" : "Entrar"}
          </button>

          <p className="auth-switch">
            {isRegister ? "Ja tem conta?" : "Ainda nao tem conta?"}{" "}
            <Link to={isRegister ? "/" : "/register"}>
              {isRegister ? "Entrar" : "Criar conta"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
