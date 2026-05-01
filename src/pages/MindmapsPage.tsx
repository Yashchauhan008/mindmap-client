import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMindmap, deleteMindmap, getMindmaps } from '../services/api/mindmaps';
import { useAuth } from '../context/AuthContext';

export default function MindmapsPage() {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, logout } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['mindmaps', search],
        queryFn: () => getMindmaps(search),
    });

    const createMutation = useMutation({
        mutationFn: createMindmap,
        onSuccess: (newMindmap) => {
            queryClient.invalidateQueries({ queryKey: ['mindmaps'] });
            navigate(`/mindmaps/${newMindmap.id}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMindmap,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mindmaps'] });
        },
    });

    const mindmaps = useMemo(() => data?.data ?? [], [data]);

    return (
        <div className="mindmaps-page relative min-h-screen overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500">
            {/* Dynamic Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-teal-500/5 blur-[100px] rounded-full" />
                <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-indigo-500/5 blur-[80px] rounded-full" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">System Ready</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400">Mindflows</span>
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                            Welcome back, <span className="text-slate-900 dark:text-slate-200">{user?.email?.split('@')[0]}</span>. You have {mindmaps.length} maps ready.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-slate-900 dark:bg-white px-6 py-4 text-sm font-bold text-white dark:text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
                            onClick={() => createMutation.mutate('New Mind Map')}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Map
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                            onClick={logout}
                            title="Logout"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Search & Stats Bar */}
                <div className="mb-10 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            className="block w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={search}
                            placeholder="Filter your maps by name..."
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Main Content Grid */}
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 rounded-3xl bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {mindmaps.map((map) => (
                            <div
                                key={map.id}
                                className="group relative rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#111827] p-1 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/5 shadow-sm"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                
                                <div className="relative p-6 h-full flex flex-col">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const ok = window.confirm('Permanently delete this mind map?');
                                                if (ok) deleteMutation.mutate(map.id);
                                            }}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <Link to={`/mindmaps/${map.id}`} className="block flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {map.title}
                                        </h3>
                                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            Modified {new Date(map.updated_at || map.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </Link>

                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900/30" />
                                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-teal-100 dark:bg-teal-900/30" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flow Diagram</span>
                                        </div>
                                        <Link
                                            to={`/mindmaps/${map.id}`}
                                            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:gap-3 transition-all"
                                        >
                                            Launch
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && mindmaps.length === 0 ? (
                    <div className="mt-12 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
                        <div className="mx-auto w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Zero maps found</h3>
                        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Start your creative journey by designing your first interactive mind flow map.
                        </p>
                        <button
                            className="mt-8 rounded-2xl bg-slate-900 dark:bg-white px-8 py-3 text-sm font-bold text-white dark:text-slate-900 hover:scale-105 transition-transform"
                            onClick={() => createMutation.mutate('Initial Map')}
                        >
                            Create First Map
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
