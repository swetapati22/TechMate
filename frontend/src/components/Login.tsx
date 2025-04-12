import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore'; // Add this import

function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
  const [isElder, setIsElder] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // In Login.tsx
const [email, setEmail] = useState('test@techmate.com');
const [password, setPassword] = useState('password123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Attempting login with:', email);
    console.log('Network status:', navigator.onLine ? 'Online' : 'Offline');
    try {
      // Try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login success:', userCredential.user.uid);

      // navigate('/dashboard');

      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'elder';

      // Navigate based on role
      navigate(role === 'grandkid' ? '/Grandkid_View' : '/dashboard');

    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        try {
          // Create user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Add 2-second delay to ensure user is authenticated
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Store role in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            role: isElder ? 'elder' : 'grandkid',
            email: email
          });
          navigate(isElder ? '/dashboard' : '/Grandkid_View');
        } catch (signupError: any) {
          console.error('Login error:', error);
          setError(`Signup failed: ${signupError.message}`);
        }
      } else {
        console.log(error);
        setError(`Login failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="container py-5" style={{ fontSize: '24px' }}>
      <h1 className="text-center mb-5">TechMate Login</h1>
      
      <div className="d-flex justify-content-center mb-4">
        <button 
          className={`btn btn-lg ${isElder ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIsElder(true)}
        >
          Elder
        </button>
        <button 
          className={`btn btn-lg ${!isElder ? 'btn-primary' : 'btn-secondary'} ms-2`}
          onClick={() => setIsElder(false)}
        >
          Grandkid
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control form-control-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="mb-3">
          <input
            type="password"
            className="form-control form-control-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-100"
        >
          {isElder ? 'Login as Elder' : 'Login as Grandkid'}
        </button>
      </form>
    </div>
  );
}

export default Login;