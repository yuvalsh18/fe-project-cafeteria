import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import LoginModal from './components/LoginModal';

export default function RequireAuth({ children }) {
  const [user, loading, error] = useAuthState(auth);

  // Debug notes
  console.log('RequireAuth debug:', { user, loading, error });

  if (loading) {
    console.log('RequireAuth: loading user state...');
    return null; // spinner / skeleton, if you want
  }
  if (error) {
    console.error('RequireAuth: error in useAuthState', error);
  }
  if (!user) {
    console.log('RequireAuth: user not authenticated, showing LoginModal');
    return <LoginModal />;
  }
  console.log('RequireAuth: user authenticated', user);
  return children;
}