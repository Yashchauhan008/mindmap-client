import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MindmapsPage from './pages/MindmapsPage';
import MindmapEditorPage from './pages/MindmapEditorPage';
import './App.css';

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/mindmaps" replace />} />
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
                            <MindmapEditorPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
}
