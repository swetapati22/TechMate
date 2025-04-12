import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isElder, setIsElder] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          role: isElder ? 'elder' : 'grandkid',
          email: email
        });
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '500px', fontSize: '18px' }}>
      <h1 className="text-center mb-4 display-4">
        {isSignUp ? 'Create Account' : 'Welcome to TechMate'}
      </h1>

      {/* Role Toggle (Only for Sign Up) */}
      {isSignUp && (
        <div className="d-flex gap-3 mb-4 justify-content-center">
          <button
            type="button"
            className={`btn ${isElder ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setIsElder(true)}
          >
            👴 Elder
          </button>
          <button
            type="button"
            className={`btn ${!isElder ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setIsElder(false)}
          >
            👨👧 Grandkid
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control form-control-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            className="form-control form-control-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-100 mb-3"
        >
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp 
              ? 'Already have an account? Login'
              : 'New user? Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuthPage;