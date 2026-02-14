import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Overlay } from './components/Overlay';
import { useSettingsStore } from './stores/useSettingsStore';
import { useEffect } from 'react';
import { Toast } from './components/Toast';

function App() {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/overlay" element={<Overlay />} />
        </Routes>
      </Router>
      <Toast />
    </>
  );
}

export default App;
