import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const OnboardingGuard = () => {
  const { user } = useSelector(state => state.auth);

  if (!user) return <Navigate to="/login" />;

  if (!user.hasSelectedLanguage) return <Navigate to="/select-language" />;
  if (!user.hasSelectedInterests) return <Navigate to="/select-interests" />;

  return <Outlet />;
};

export default OnboardingGuard;