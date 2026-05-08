import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";

function ConfirmRoomPasswordModal({ action, onClose, onConfirm }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPassword("");
    setError("");
  }, [action]);

  if (!action) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!/^\d{5,}$/.test(password)) {
      setError("Informe a senha da sala com pelo menos 5 digitos.");
      return;
    }

    onConfirm(password);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-password-title"
      >
        <div className="modal-icon">
          <LockKeyhole size={22} />
        </div>
        <h2 id="room-password-title">{action.title}</h2>
        <p>{action.description}</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="room-password">Senha da sala</label>
          <input
            id="room-password"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className={action.danger ? "danger-button" : "primary-button"}
              type="submit"
            >
              Confirmar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ConfirmRoomPasswordModal;
