import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import LoadingScreen from './components/LoadingScreen.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Archives from './pages/Archives.jsx';
import Message from './pages/message.jsx';
import Login from './pages/Login.jsx';
import About from './pages/About.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/404.jsx';
import GuestLayout from './components/GuestLayout.jsx';
import MainLayout from './components/Layout.jsx';
import NoPage from './components/404.jsx';
import PostDetail from './components/PostDetail.jsx';
import { AuthProvider, AuthContext } from './AuthContext.jsx';

import SettingLayout from './components/SettingLayout.jsx';
import SettingsAccount from './pages/SettingPage/account.jsx';
import SettingsPreferences from './pages/SettingPage/preferences.jsx';

// function PrivateRoute({ children }) {
//   const { isAuthenticated } = useContext(AuthContext);
//   const location = useLocation();

//   return isAuthenticated ? (
//     children
//   ) : (
//     <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} />
//   );
// }

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://kit.fontawesome.com/3c78583699.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const initialResources = performance.getEntriesByType('resource').length;
    let loadedResources = 0;
    let databaseLoaded = false;

    const updateProgressBar = () => {
      const totalItems = initialResources + 1;
      const loadedItems = loadedResources + (databaseLoaded ? 1 : 0);
      setProgress((loadedItems / totalItems) * 100);
    };

    const resourceLoadListener = (entryList) => {
      const entries = entryList.getEntries();
      loadedResources += entries.length;
      updateProgressBar();
    };

    const observer = new PerformanceObserver(resourceLoadListener);
    observer.observe({ entryTypes: ['resource'] });

    const fetchDatabaseData = () => {
      setTimeout(() => {
        databaseLoaded = true;
        updateProgressBar();
        setLoading(false);
      }, 300);
    };

    fetchDatabaseData();

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      <div className={`container ${loading ? 'loading' : 'loaded'}`}>
        {loading ? (
          <LoadingScreen progress={progress} />
        ) : (
          <Routes>
            <Route element={<GuestLayout />}>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/auth/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
              <Route path="/auth/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />
            </Route>

            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/direct" element={<Message />} />
              <Route path="/posts/view/:id" element={<PostDetail />} />
              <Route path="/posts/view/:id/:title" element={<PostDetail />} />
              <Route path="/about" element={<About />} />
            </Route>

            {/* 설정 페이지 */}
            <Route path="/settings/*" element={<SettingLayout />} >
              <Route index element={isAuthenticated ? <Navigate to="/settings/account"/> : <Navigate to="/settings/preferences" />} />
              <Route path="account" element={isAuthenticated ? <SettingsAccount /> : <Navigate to="/settings/preferences" />} />
              <Route path="preferences" element={<SettingsPreferences />} />
            </Route>

            {/* <Route path="/settings/" element={<PrivateRoute><SettingLayout /></PrivateRoute>} >
              <Route path="/settings/" element={<Navigate to="/settings/account" />} />
              <Route path="/settings/account" element={<SettingsAccount />} />
            </Route> */}

            <Route element={<NoPage />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        )}
      </div>
    </div>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
