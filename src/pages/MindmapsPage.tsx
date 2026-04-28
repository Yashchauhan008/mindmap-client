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
        <div className="relative min-h-screen overflow-hidden bg-[#f4f6fb] px-4 py-8 text-slate-900 sm:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(236,72,153,0.15),transparent_32%),radial-gradient(circle_at_80%_25%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_60%_85%,rgba(244,114,182,0.1),transparent_34%)]" />
            <div className="relative mx-auto max-w-6xl space-y-6">
                <header className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-pink-100/60 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-pink-500">Mindflow Console</p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Your Mind Maps</h2>
                            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                className="rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-300/50 transition hover:brightness-110"
                                onClick={() => createMutation.mutate('Untitled mind map')}
                            >
                                + New Map
                            </button>
                            <button
                                className="rounded-xl border border-pink-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-pink-50"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <input
                            className="w-full rounded-xl border border-pink-100 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/40"
                            value={search}
                            placeholder="Search mind maps..."
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>

                {isLoading ? (
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-6 text-sm text-slate-500 shadow-lg shadow-pink-100/40 backdrop-blur-xl">
                        Loading mind maps...
                    </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {mindmaps.map((map) => (
                        <div
                            key={map.id}
                            className="group rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-pink-100/50 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-pink-300/70 hover:bg-white"
                        >
                            <Link to={`/mindmaps/${map.id}`} className="block">
                                <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{map.title}</h3>
                                <p className="mt-2 text-xs text-slate-500">
                                    Updated {new Date(map.updated_at || map.created_at).toLocaleString()}
                                </p>
                            </Link>
                            <div className="mt-4 flex items-center justify-between">
                                <Link
                                    to={`/mindmaps/${map.id}`}
                                    className="text-sm font-medium text-pink-600 transition group-hover:text-pink-500"
                                >
                                    Open editor →
                                </Link>
                                <button
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                                    onClick={() => {
                                        const ok = window.confirm('Delete this mind map?');
                                        if (!ok) return;
                                        deleteMutation.mutate(map.id);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {!isLoading && mindmaps.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-pink-200 bg-white/70 p-10 text-center shadow-lg shadow-pink-100/40 backdrop-blur-xl">
                        <p className="text-sm text-slate-500">No mind maps yet. Create your first futuristic flow.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
