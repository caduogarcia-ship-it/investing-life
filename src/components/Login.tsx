import React, { useState } from 'react';
import { BarChart2, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email regex validation
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Por favor, preencha o campo de e-mail.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setError('Por favor, insira um endereço de e-mail válido (ex: nome@exemplo.com).');
      return;
    }
    if (!password) {
      setError('Por favor, preencha o campo de senha.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    // Simulate network authentication request
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(cleanEmail);
    }, 1200);
  };

  const handleDemoFill = () => {
    setEmail('demo@investidor.com');
    setPassword('senha123');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark-bg text-dark-textPrimary relative overflow-hidden select-none px-4 py-12">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/[0.12] rounded-full blur-[110px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-purple/[0.12] rounded-full blur-[110px] translate-x-1/2 translate-y-1/2" />

      {/* Floating dots */}
      <div className="absolute" style={{ top: '12%', left: '18%', width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', animation: 'float 6s ease-in-out infinite', animationDelay: '0s' }} />
      <div className="absolute" style={{ top: '30%', right: '15%', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }} />
      <div className="absolute" style={{ bottom: '20%', left: '10%', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }} />
      <div className="absolute" style={{ top: '60%', right: '22%', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', animation: 'float 6s ease-in-out infinite', animationDelay: '3s' }} />
      <div className="absolute" style={{ top: '18%', right: '35%', width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', animation: 'float 6s ease-in-out infinite', animationDelay: '0.5s' }} />
      <div className="absolute" style={{ bottom: '35%', left: '28%', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', animation: 'float 6s ease-in-out infinite', animationDelay: '1.5s' }} />
      <div className="absolute" style={{ bottom: '12%', right: '30%', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', animation: 'float 6s ease-in-out infinite', animationDelay: '2.5s' }} />
      <div className="absolute" style={{ top: '45%', left: '8%', width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', animation: 'float 6s ease-in-out infinite', animationDelay: '4s' }} />

      {/* Main Glass Card */}
      <div className="bg-dark-card/50 border border-dark-border/80 w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 space-y-7 backdrop-blur-xl animate-fadeIn" style={{ borderTop: '1px solid rgba(99,102,241,0.3)' }}>
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-brand-primary to-brand-purple rounded-2xl text-white shadow-xl shadow-brand-primary/20">
            <BarChart2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-dark-textPrimary" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Outfit, sans-serif' }}>
            Investing Life
          </h2>
          <p className="text-2xs font-semibold text-dark-textSecondary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Painel de Estudos & Análise de Ativos
          </p>
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="p-4 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-2xl flex items-start gap-3.5 shadow-lg animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4.5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
              E-mail do Investidor
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-dark-textSecondary" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                placeholder="exemplo@investidor.com"
                className="w-full bg-dark-bg/60 border border-dark-border/80 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-dark-textPrimary placeholder:text-dark-textSecondary/40 font-mono"
                style={{ transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Senha de Acesso
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-dark-textSecondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                placeholder="••••••••"
                className="w-full bg-dark-bg/60 border border-dark-border/80 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none rounded-xl py-3 pl-11 pr-11 text-sm text-dark-textPrimary placeholder:text-dark-textSecondary/40 font-mono"
                style={{ transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3.5 top-3.5 text-dark-textSecondary hover:text-dark-textPrimary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-purple hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-primary/15 hover:shadow-brand-primary/25 flex items-center justify-center gap-2 cursor-pointer active-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-none relative overflow-hidden group"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {/* Shine effect on hover */}
            <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', transition: 'left 0.5s ease' }} className="group-hover:!left-[100%]" />
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar no Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Helper Block */}
        <div className="border-t border-dark-border/40 pt-5 space-y-3">
          <div className="bg-dark-bg/40 border border-dark-border/40 p-4 rounded-2xl text-[10px] leading-relaxed text-dark-textSecondary font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-dark-textPrimary font-bold block mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>💡 Acesso Demonstrativo:</span>
            Para fins de teste, você pode utilizar qualquer endereço de e-mail e senha válidos (mínimo de 6 caracteres), ou usar os dados rápidos de homologação abaixo.
          </div>

          <button
            type="button"
            onClick={handleDemoFill}
            disabled={loading}
            className="w-full py-2.5 bg-dark-bg border border-dark-border/60 hover:border-gray-700 text-dark-textPrimary hover:text-white font-bold text-3xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Preencher Conta de Teste
          </button>

          {/* Features grid */}
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {['📊 Análise Fundamentalista', '💰 Mapa de Dividendos', '📈 Gráficos Avançados', '🏆 Rankings B3'].map(f => (
              <div key={f} style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', color: '#64748b', padding: '6px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.08)' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
