import { JSX, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'elder' | 'grandkid';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (requiredRole) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const role = userDoc.data()?.role;
          
          if (role !== requiredRole) {
            navigate(role === 'grandkid' ? '/kid_view' : '/dashboard');
            setIsLoading(false);
            return;
          }
        }
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [navigate, requiredRole]);

  if (isLoading) return <div className="text-center mt-5">Loading...</div>;
  
  if (!auth.currentUser) return <Navigate to="/" replace />;
  
  return children;
};

export default ProtectedRoute;