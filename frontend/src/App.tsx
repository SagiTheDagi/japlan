import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PreferencesPage from './pages/PreferencesPage';
import SandboxPage from './pages/SandboxPage';
import { ThemeProvider } from './components/theme-provider';

function App() {
  try {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PreferencesPage />} />
            <Route path="/sandbox" element={<SandboxPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error loading app</h1>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}

export default App;
