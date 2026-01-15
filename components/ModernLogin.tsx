import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Loader2, AlertCircle } from 'lucide-react';

interface ModernLoginProps {
    onLogin: (username: string, password: string) => Promise<void>;
}

export const ModernLogin: React.FC<ModernLoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState({ username: false, password: false });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await onLogin(username, password);
        } catch (err: any) {
            setError(err.message || 'Credenciales incorrectas');
        } finally {
            setIsLoading(false);
        }
    };

    const isValid = username.length > 0 && password.length > 0;

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in">
            <div className="w-full max-w-md">
                {/* Glass Card */}
                <div className="relative bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl border border-neon-cyan/30 shadow-[0_0_50px_rgba(0,255,255,0.15)] rounded-2xl p-8 overflow-hidden">

                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-party-500/5 animate-pulse-slow pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 bg-neon-cyan/10 rounded-full mb-4 border border-neon-cyan/30">
                                <Lock className="w-8 h-8 text-neon-cyan" />
                            </div>
                            <h2 className="text-3xl font-pixel text-white text-glow-white mb-2">ADMIN ACCESS</h2>
                            <p className="text-gray-400 font-mono text-sm">Introduce tus credenciales</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-shake">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-400 text-sm font-mono">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username Field */}
                            <div>
                                <label className="block text-sm font-pixel text-gray-300 mb-2">USUARIO</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className={`w-5 h-5 transition-colors ${touched.username && !username ? 'text-red-400' : 'text-gray-500 group-focus-within:text-neon-cyan'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, username: true })}
                                        autoFocus
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 outline-none transition-all"
                                        placeholder="admin"
                                        disabled={isLoading}
                                    />
                                </div>
                                {touched.username && !username && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">Campo requerido</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-pixel text-gray-300 mb-2">CONTRASEÑA</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 transition-colors ${touched.password && !password ? 'text-red-400' : 'text-gray-500 group-focus-within:text-neon-cyan'}`} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, password: true })}
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 outline-none transition-all"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-neon-cyan transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {touched.password && !password && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">Campo requerido</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!isValid || isLoading}
                                className="w-full relative group overflow-hidden bg-gradient-to-r from-neon-cyan to-party-500 text-black font-pixel text-xl py-3 rounded-lg transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                <span className="relative flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            VERIFICANDO...
                                        </>
                                    ) : (
                                        'INICIAR SESIÓN'
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-500 text-xs font-mono">
                                Sistema protegido • v2.0
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
