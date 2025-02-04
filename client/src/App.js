import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Notice from './pages/Notice';
import Direct from './pages/direct';
import Login from './pages/Login';
import Proxy from './pages/Proxy';
import Signup from './pages/Signup';
import NotFound from './pages/404';
import GuestLayout from './components/GuestLayout';
import MainLayout from './components/Layout';
import NoPage from './components/404';
import PostDetail from './components/PostDetail';
import { AuthProvider, AuthContext } from './AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

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
    <Router>
      <div className={`container ${loading ? 'loading' : 'loaded'}`}>
        {loading ? (
          <LoadingScreen progress={progress} />
        ) : (
          // 배포할 때 이 코드대로 수정하지 않으면 좆될 것이 분명하니 꼭 수정할 것. FUCK.
          // ==================================================================
          //  <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          //     <Route path="/home" element={<Home />} />
          //     <Route path="/vote" element={<Vote />} />
          //     <Route path="/notice" element={<Notice />} />
          //     <Route path="/message" element={<Direct />} />
          //     <Route path="/proxy" element={<Proxy />} />
          //     <Route path="/posts/view/:id" element={<PostDetail/>} />
          //  </Route>
          // ==================================================================
          <Routes>
            <Route element={<GuestLayout />}>
              <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
              <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />
            </Route>

            <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/message" element={<Direct />} />
                <Route path="/proxy" element={<Proxy />} />
                <Route path="/posts/view/:id" element={<PostDetail/>} />
                <Route path="/webproxy" element={<Proxy/>} />
            </Route>

            <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            </Route>

            <Route element={<NoPage />}>
              <Route path="*"element={<NotFound />} />
            </Route>
          </Routes>
        )}
      </div>
    </Router>
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