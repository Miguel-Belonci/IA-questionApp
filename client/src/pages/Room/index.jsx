import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCheck, Copy, Moon, Send, Sun, Trash2 } from 'lucide-react';
import ConfirmRoomPasswordModal from '../../components/ConfirmRoomPasswordModal.jsx';
import UserMenu from '../../components/UserMenu.jsx';
import { apiRequest } from '../../api.js';
import './room.css';

function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const stats = useMemo(() => ({
    total: questions.length,
    read: questions.filter((question) => question.read).length,
    open: questions.filter((question) => !question.read).length,
  }), [questions]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    async function fetchRoom() {
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest(`/rooms/${code}`);
        setRoom(data.room);
        setQuestions([...(data.room.questions || [])].sort((a, b) => Number(a.read) - Number(b.read)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRoom();
  }, [code]);

  async function createQuestion(event) {
    event.preventDefault();
    const questionText = text.trim();
    setError('');

    if (!questionText) {
      setError('Digite sua pergunta antes de enviar.');
      return;
    }

    setSending(true);
    try {
      const data = await apiRequest('/questions', {
        method: 'POST',
        body: { roomCode: code, text: questionText },
      });
      setQuestions((current) => [data.question, ...current]);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function markAsRead(questionId, roomPassword) {
    setError('');
    try {
      const data = await apiRequest(`/questions/${questionId}/read`, {
        method: 'PATCH',
        body: { roomPassword },
      });
      setQuestions((current) => current.map((question) => question.id === questionId ? data.question : question));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteQuestion(questionId, roomPassword) {
    setError('');
    try {
      await apiRequest(`/questions/${questionId}`, {
        method: 'DELETE',
        body: { roomPassword },
      });
      setQuestions((current) => current.filter((question) => question.id !== questionId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteRoom(roomPassword) {
    setError('');
    try {
      await apiRequest(`/rooms/${code}`, {
        method: 'DELETE',
        body: { roomPassword },
      });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function confirmRoomAction(roomPassword) {
    if (!confirmAction) return;

    const currentAction = confirmAction;
    setConfirmAction(null);

    if (currentAction.type === 'read') {
      await markAsRead(currentAction.questionId, roomPassword);
      return;
    }

    if (currentAction.type === 'delete-question') {
      await deleteQuestion(currentAction.questionId, roomPassword);
      return;
    }

    if (currentAction.type === 'delete-room') {
      await deleteRoom(roomPassword);
    }
  }

  if (loading) {
    return <div className="loading-screen">Carregando sala...</div>;
  }

  return (
    <div className="room-page">
      <header className="room-header">
        <Link to="/home" className="logo">
          <span>Q</span>
          QuestionApp
        </Link>

        <div className="room-actions">
          <button className="code-button" type="button" onClick={copyCode} title="Copiar código da sala">
            {code}
            <Copy size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Alternar tema">
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <UserMenu />
        </div>
      </header>

      <main className="room-layout">
        <aside className="room-cover">
          <span className="eyebrow">{copied ? 'Código copiado' : 'Sala ativa'}</span>
          <h1>{room?.name || 'Sala'}</h1>
          <p>Compartilhe o código e acompanhe as perguntas. As ações de leitura e exclusão ficam na lista ao lado.</p>

          <div className="stats-grid">
            <div><strong>{stats.total}</strong><span>Total</span></div>
            <div><strong>{stats.open}</strong><span>Abertas</span></div>
            <div><strong>{stats.read}</strong><span>Lidas</span></div>
          </div>

          <button
            className="danger-button"
            type="button"
            onClick={() => setConfirmAction({
              type: 'delete-room',
              title: 'Excluir sala',
              description: 'Informe a senha da sala para excluir esta sala e todas as perguntas.',
              danger: true,
            })}
          >
            <Trash2 size={18} />
            Excluir sala
          </button>
        </aside>

        <section className="question-area">
          {error && <div className="form-error">{error}</div>}

          <form className="question-form" onSubmit={createQuestion}>
            <h2>Faça sua pergunta</h2>
            <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="O que você quer perguntar?" />
            <footer>
              <span>Pergunta anônima para os outros participantes</span>
              <button className="primary-button" type="submit" disabled={sending}>
                <Send size={18} />
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </footer>
          </form>

          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="empty-state">
                <h2>Nenhuma pergunta por aqui.</h2>
                <p>Envie a primeira pergunta ou compartilhe o código da sala com a galera.</p>
              </div>
            ) : (
              questions.map((question) => (
                <article className={`question-card ${question.read ? 'is-read' : ''}`} key={question.id}>
                  <p>{question.text}</p>
                  <div className="question-card-footer">
                    <span>{question.read ? 'Lida' : 'Aberta'}</span>
                    <div>
                      {!question.read && (
                        <button
                          className="small-action"
                          type="button"
                          onClick={() => setConfirmAction({
                            type: 'read',
                            questionId: question.id,
                            title: 'Marcar como lida',
                            description: 'Informe a senha da sala para marcar esta pergunta como lida.',
                          })}
                          title="Marcar como lida"
                        >
                          <CheckCheck size={17} />
                        </button>
                      )}
                      <button
                        className="small-action danger"
                        type="button"
                        onClick={() => setConfirmAction({
                          type: 'delete-question',
                          questionId: question.id,
                          title: 'Excluir pergunta',
                          description: 'Informe a senha da sala para excluir esta pergunta.',
                          danger: true,
                        })}
                        title="Excluir pergunta"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
      <ConfirmRoomPasswordModal
        action={confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmRoomAction}
      />
    </div>
  );
}

export default Room;
