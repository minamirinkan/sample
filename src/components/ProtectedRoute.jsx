// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        navigate('/');
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (checking) return <div>読み込み中...</div>;

  return authenticated ? children : null;
};

export default ProtectedRoute;
