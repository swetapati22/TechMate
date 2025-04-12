import { JSX, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setUserLoaded(true);
    });
    return unsubscribe;
  }, []);

  if (!userLoaded) return <div className="text-center mt-5">Loading...</div>;
  return auth.currentUser ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;