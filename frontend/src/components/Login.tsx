// Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  roleButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    borderColor: '#4f46e5',
  },
  secondaryButton: {
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    borderColor: '#e0e7ff',
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

function Login() {
  const [email, setEmail] = useState('test@techmate.com');
  const [password, setPassword] = useState('password123');
  const [isElder, setIsElder] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'elder';
      navigate(role === 'grandkid' ? '/Grandkid_View' : '/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            role: isElder ? 'elder' : 'grandkid',
            email: email
          });
          navigate(isElder ? '/dashboard' : '/Grandkid_View');
        } catch (signupError: any) {
          setError(`Signup failed: ${signupError.message}`);
        }
      } else {
        setError(`Login failed: ${error.message}`);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>TechMate Login</h1>
      
      <div style={styles.buttonGroup}>
        <button
          style={{
            ...styles.roleButton,
            ...(isElder ? styles.primaryButton : styles.secondaryButton),
          }}
          onClick={() => setIsElder(true)}
        >
          Elder
        </button>
        <button
          style={{
            ...styles.roleButton,
            ...(!isElder ? styles.primaryButton : styles.secondaryButton),
          }}
          onClick={() => setIsElder(false)}
        >
          Grandkid
        </button>
      </div>

      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              ...styles.roleButton,
              ...styles.primaryButton,
              width: '100%',
              padding: '1rem',
            }}
            type="submit"
          >
            {isElder ? 'Login as Elder' : 'Login as Grandkid'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;