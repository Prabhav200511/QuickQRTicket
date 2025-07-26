// hooks/useAuthRedirect.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useAuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'host') {
      navigate('/dashboard/host', { replace: true });
    } else {
      navigate('/dashboard/customer', { replace: true });
    }
  }, [user, navigate]);
};

export default useAuthRedirect;
