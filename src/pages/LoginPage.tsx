import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../services/api/auth';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    return (
        <div className="login-page relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-500">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 dark:bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-10 brightness-150 dark:brightness-50" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/20 mb-6 mx-auto">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Access Engine</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Connect your neural network to start mapping.</p>
                </div>

                <div className="rounded-[32px] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-10 shadow-2xl">
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Identify Yourself</p>
                        </div>

                        <div className="flex justify-center transform hover:scale-[1.02] transition-transform">
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
                                theme={document.documentElement.getAttribute('data-theme') === 'dark' ? 'filled_black' : 'outline'}
                                shape="pill"
                                size="large"
                                width="300px"
                            />
                        </div>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100 dark:border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white/50 dark:bg-slate-900/50 px-2 text-slate-400 dark:text-slate-500 font-bold tracking-widest">Secure Handshake</span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-500 leading-relaxed">
                            By continuing, you grant access to the Mindflow workspace environment and agree to our secure data protocols.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-sm font-bold text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-white transition-colors"
                    >
                        ← Back to Surface
                    </button>
                </div>
            </div>
        </div>
    );
}
