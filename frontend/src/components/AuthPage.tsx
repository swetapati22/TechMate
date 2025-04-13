// AuthPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import RoleSelector from '../components/RoleSelector';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#2c3e50',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    letterSpacing: '-0.025em',
  },
  formContainer: {
    maxWidth: '500px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  input: {
    fontSize: '1rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    width: '100%',
    transition: 'all 0.2s ease',
    marginBottom: '1rem',
  },
  button: {
    padding: '1rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    width: '100%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#4f46e5',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          role: isElder ? 'elder' : 'grandkid',
          email: email
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {isSignUp ? 'Create Account' : 'Welcome to TechMate'}
      </h1>

      {isSignUp && <RoleSelector isElder={isElder} setIsElder={setIsElder} />}

      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <input
            style={{ ...styles.input, marginBottom: '1.5rem' }}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div style={styles.errorMessage}>
              <svg
                style={{ width: '1.25rem', height: '1.25rem' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              marginBottom: '1rem',
            }}
            type="submit"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            style={{
              ...styles.button,
              ...styles.secondaryButton,
            }}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New user? Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;