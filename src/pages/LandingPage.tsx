import { Link } from 'react-router-dom';
import { ReactFlow, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuth } from '../context/AuthContext';
import { nodeTypes, getPreviewData } from '../components/admin/mindmap/nodes/registry';

export default function LandingPage() {
    const { token } = useAuth();

    // Initial nodes for the interactive demo
    const [nodes, , onNodesChange] = useNodesState([
        {
            id: 'demo-idea',
            type: 'ideaNode',
            position: { x: 50, y: 50 },
            data: getPreviewData('ideaNode'),
        },
        {
            id: 'demo-calendar',
            type: 'calendarNode',
            position: { x: 350, y: 0 },
            data: getPreviewData('calendarNode'),
        },
        {
            id: 'demo-todo',
            type: 'multiTodoNode',
            position: { x: 50, y: 250 },
            data: getPreviewData('multiTodoNode'),
        },
        {
            id: 'demo-percent',
            type: 'percentageNode',
            position: { x: 450, y: 320 },
            data: getPreviewData('percentageNode'),
        },
    ]);

    const [edges, , onEdgesChange] = useEdgesState([
        { id: 'e1', source: 'demo-idea', target: 'demo-percent', animated: true, style: { stroke: '#3b82f6' } },
        { id: 'e2', source: 'demo-todo', target: 'demo-percent', animated: true, style: { stroke: '#10b981' } },
        { id: 'e3', source: 'demo-calendar', target: 'demo-percent', animated: true, style: { stroke: '#6366f1' } },
    ]);

    return (
        <div className="landing-page relative min-h-screen overflow-hidden bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-500">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/5 dark:bg-blue-600/10 blur-[140px] rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] rounded-full" />
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-20 brightness-150 dark:brightness-50 contrast-150" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Nav */}
                <nav className="flex items-center justify-between py-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Mindflow</span>
                    </div>
                    <div className="flex items-center gap-6">
                        {token ? (
                            <Link 
                                to="/mindmaps" 
                                className="rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 px-5 py-2.5 text-sm font-bold backdrop-blur-md transition-all text-slate-900 dark:text-white"
                            >
                                Go to Console
                            </Link>
                        ) : (
                            <Link 
                                to="/login" 
                                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all text-white"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center text-center pt-24 pb-32">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Revolutionizing Thought Maps</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                        Design your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400">Future Flow</span>
                    </h1>
                    
                    <p className="text-xl text-slate-400 max-w-2xl mb-12 font-medium">
                        The world's most advanced interactive mind mapping engine. 
                        Visualize logic, track habits, and aggregate tasks in a stunning futuristic workspace.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link
                            to={token ? "/mindmaps" : "/login"}
                            className="w-full sm:w-auto rounded-2xl bg-white text-slate-900 px-10 py-5 text-lg font-black hover:scale-105 transition-transform shadow-2xl shadow-blue-500/10"
                        >
                            Launch Engine
                        </Link>
                        <a
                            href="#features"
                            className="w-full sm:w-auto rounded-2xl bg-white/5 border border-white/10 px-10 py-5 text-lg font-bold hover:bg-white/10 transition-all"
                        >
                            Explore Features
                        </a>
                    </div>

                    {/* App Preview Mockup */}
                    <div className="mt-24 relative w-full max-w-5xl group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500 rounded-[32px] blur opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-1000" />
                        <div className="relative rounded-[32px] overflow-hidden border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-3xl shadow-2xl">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500/10 dark:bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/10 dark:bg-amber-500/20" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20" />
                                <div className="ml-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mindflow Instance — workspace_01</div>
                            </div>
                            <div className="p-0 aspect-video bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 z-0">
                                    <ReactFlow
                                        nodes={nodes}
                                        edges={edges}
                                        onNodesChange={onNodesChange}
                                        onEdgesChange={onEdgesChange}
                                        nodeTypes={nodeTypes}
                                        fitView
                                        proOptions={{ hideAttribution: true }}
                                        style={{ background: 'transparent' }}
                                        colorMode={document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'}
                                        zoomOnScroll={true}
                                        panOnScroll={true}
                                        preventScrolling={true}
                                        minZoom={0.5}
                                        maxZoom={1.5}
                                    >
                                        <Background color="#cbd5e1" gap={20} />
                                    </ReactFlow>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section id="features" className="py-32 border-t border-white/5">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-black tracking-tight mb-4 uppercase italic">Advanced Capabilities</h2>
                        <p className="text-slate-500 max-w-xl mx-auto font-medium">
                            Beyond simple boxes and lines. Mindflow is a computational engine for your ideas.
                        </p>
                    </div>

                    <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Intelligent Logic Gates',
                                desc: 'Use Decision nodes to branch your flows and Summary nodes to recursively aggregate data from entire branches automatically.',
                                color: 'blue',
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                )
                            },
                            {
                                title: 'Embedded Habit streaks',
                                desc: 'Maintain consistency with integrated calendar nodes. Track daily habits directly inside your project planning nodes.',
                                color: 'teal',
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )
                            },
                            {
                                title: 'Computational Averages',
                                desc: 'Percentage nodes calculate weighted averages from all connected inputs, giving you a real-time health score of your projects.',
                                color: 'indigo',
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                )
                            },
                            {
                                title: 'Modern Aesthetics',
                                desc: 'Fully optimized for Dark Mode with a premium glassmorphism UI, smooth transitions, and a clean futuristic console.',
                                color: 'purple',
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )
                            },
                            {
                                title: 'Smart Search',
                                desc: 'Instantly locate any mind map or node using the lightning-fast workspace search engine.',
                                color: 'amber',
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )
                            },
                            {
                                title: 'Cloud Sync',
                                desc: 'Your maps are automatically persisted to the cloud, accessible from any device through secure Google authentication.',
                                color: 'rose',
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                    </svg>
                                )
                            }
                        ].map((feat) => (
                            <div key={feat.title} className="group relative">
                                <div className={`absolute -inset-4 rounded-3xl bg-${feat.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 text-${feat.color}-500 dark:text-${feat.color}-400 shadow-xl`}>
                                        {feat.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feat.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-500 font-medium">© 2026 Mindflow Engine. All rights reserved.</p>
                    <div className="flex items-center gap-8 text-sm text-slate-500 font-bold">
                        <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Github</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
