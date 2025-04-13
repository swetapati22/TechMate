import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../App.css';

function DashBoard() {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email || '');
    }
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="senior-navbar">
        <div className="navbar-content text-center">
          <span className="welcome-message">Welcome ! Tap a mode to begin 👇</span>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1 className="text-center main-title">
          
        </h1>

        <div className="cards-container">
          {/* EZMode Card */}
          <div
            className="card animated-card slide-in-1"
            onClick={() => handleNavigation('/ezmode')}
            role="button"
          >
            <div className="card-body text-center">
              <div className="emoji">🎙️</div>
              <h2 className="card-title">EZMode – Ask a Question</h2>
              <p className="card-text">Talk and get help instantly 🗣️</p>
            </div>
          </div>

          {/* Ask Grandkid Card */}
          <div
            className="card animated-card slide-in-2"
            onClick={() => handleNavigation('/ask-grandkid')}
            role="button"
          >
            <div className="card-body text-center">
              <div className="emoji">👨‍👩‍👧</div>
              <h2 className="card-title">Ask Grandkid</h2>
              <p className="card-text">Send your issue to grandkids around the globe 💬</p>
            </div>
          </div>

          {/* TapTutor Card */}
          <div
            className="card animated-card slide-in-3"
            onClick={() => handleNavigation('/taptutor')}
            role="button"
          >
            <div className="card-body text-center">
              <div className="emoji">📖</div>
              <h2 className="card-title">TapTutor</h2>
              <p className="card-text">Common Issues: Step-by-step tutorials 🧠</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;