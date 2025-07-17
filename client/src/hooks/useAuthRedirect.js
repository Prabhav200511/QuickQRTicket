// hooks/useAuthRedirect.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuthRedirect = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'host') navigate('/dashboard/host');
    else navigate('/dashboard/customer');
  }, [user, navigate]);
};

export default useAuthRedirect;
