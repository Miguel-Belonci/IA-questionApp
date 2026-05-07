import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DoorOpen, LogOut, Menu, User, Users } from 'lucide-react';
import { apiRequest, setToken } from '../api.js';

function UserMenu() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    apiRequest('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  function logout() {
    setToken('');
    navigate('/');
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="icon-button" type="button" onClick={() => setOpen((current) => !current)} title="Abrir menu">
        <Menu size={20} />
      </button>

      {open && (
        <div className="user-menu-popover">
          <Link to="/profile" onClick={() => setOpen(false)}>
            <User size={17} />
            Perfil
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/users" onClick={() => setOpen(false)}>
                <Users size={17} />
                Usuarios
              </Link>
              <Link to="/admin/rooms" onClick={() => setOpen(false)}>
                <DoorOpen size={17} />
                Salas
              </Link>
            </>
          )}
          <button type="button" onClick={logout}>
            <LogOut size={17} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
