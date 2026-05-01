import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MindmapsPage from './pages/MindmapsPage';
import MindmapEditorPage from './pages/MindmapEditorPage';
import LandingPage from './pages/LandingPage';
import './App.css';

export default function App() {
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [isDarkMode]);

    return (
        <AuthProvider>
            <div className="app-shell">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/mindmaps"
                        element={
                            <ProtectedRoute>
                                <MindmapsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/mindmaps/:mindmapId"
                        element={
                            <ProtectedRoute>
                                <MindmapEditorPage
                                    isDarkMode={isDarkMode}
                                    onToggleTheme={() => {
                                        setIsDarkMode((current) => !current);
                                    }}
                                />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </AuthProvider>
    );
}
