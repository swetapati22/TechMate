import { useState } from 'react';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isElder, setIsElder] = useState(true); // Toggle between roles
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // Redirect if logged in
  if (user) navigate('/dashboard');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sign in existing user
      await auth.signInWithEmailAndPassword(email, password);
      // (Optional) Store role in Firestore
    } catch (error) {
      // Create new user if not found
      if (error.code === 'auth/user-not-found') {
        await auth.createUserWithEmailAndPassword(email, password);
      }
      console.error(error);
    }
  };

  return (
    <div className="login-container" style={{ fontSize: '24px', color: '#333' }}>
      <h1>Welcome to TechMate</h1>
      <button 
        onClick={() => setIsElder(!isElder)}
        style={{ padding: '15px', margin: '20px' }}
      >
        Switch to {isElder ? "Grandkid" : "Elder"} Mode
      </button>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ padding: '15px', fontSize: '20px' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ padding: '15px', fontSize: '20px', marginTop: '10px' }}
        />
        <button 
          type="submit"
          style={{ 
            padding: '15px 30px',
            fontSize: '22px',
            marginTop: '20px',
            backgroundColor: '#0066cc',
            color: 'white'
          }}
        >
          {isElder ? "Login as Elder" : "Login as Grandkid"}
        </button>
      </form>
    </div>
  );
};

export default Login;