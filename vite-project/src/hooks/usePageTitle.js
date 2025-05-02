import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = (titleMap, defaultTitle = 'Vite + React') => {
  const location = useLocation();

  useEffect(() => {
    const currentTitle = titleMap[location.pathname] || defaultTitle;
    document.title = currentTitle;
  }, [location.pathname, titleMap, defaultTitle]);
};

export default usePageTitle;
