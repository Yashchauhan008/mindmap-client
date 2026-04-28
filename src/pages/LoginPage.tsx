import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../services/api/auth';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    return (
        <div className="page login-page">
            <div className="card">
                <h1>Mindflow</h1>
                <p>Sign in with Google to create and edit your mind maps.</p>
                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        const credential = credentialResponse.credential;
                        if (!credential) return;

                        try {
                            const response = await loginWithGoogle(credential);
                            login(response.token, response.user);
                            navigate('/mindmaps');
                        } catch (error) {
                            if (axios.isAxiosError(error)) {
                                const message = error.response?.data?.message || 'Google login failed.';
                                window.alert(message);
                                return;
                            }
                            window.alert('Google login failed. Please try again.');
                        }
                    }}
                    onError={() => {
                        window.alert('Google login failed. Please try again.');
                    }}
                />
            </div>
        </div>
    );
}
