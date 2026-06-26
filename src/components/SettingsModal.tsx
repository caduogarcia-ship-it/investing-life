// src/components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Wifi, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setStatus('testing');
    setStatusMessage('Verificando conexões com Yahoo Finance e Investidor10...');

    try {
      // Test Yahoo Finance using PETR4.SA
      const yfResponse = await fetch('/yahoo-chart/PETR4.SA?range=1d&interval=1d');
      if (!yfResponse.ok) {
        setStatus('error');
        setStatusMessage('Erro ao conectar com o Yahoo Finance (HTTP ' + yfResponse.status + '). O proxy pode estar indisponível.');
        return;
      }

      // Test Investidor10 using PETR4 acoes page
      const invResponse = await fetch('/investidor10/acoes/petr4/');
      if (!invResponse.ok) {
        setStatus('error');
        setStatusMessage('Conexão com Yahoo Finance OK, mas falhou ao carregar do Investidor10 (HTTP ' + invResponse.status + ').');
        return;
      }

      setStatus('success');
      setStatusMessage('Conexões realizadas com sucesso! Yahoo Finance e Investidor10 estão online e respondendo.');
    } catch (e) {
      setStatus('error');
      setStatusMessage('Falha de rede ao tentar se comunicar com os proxies locais.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-gray-900/30">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold text-dark-textPrimary">Status da Conexão</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-dark-textSecondary hover:text-dark-textPrimary transition-colors p-1 hover:bg-dark-cardHover rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-dark-textSecondary leading-relaxed">
            Nossa plataforma está integrada diretamente com a API do <strong className="text-dark-textPrimary">Yahoo Finance</strong> através do nosso proxy de desenvolvimento do Vite.
          </p>

          <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-lg space-y-2 text-xs text-dark-textSecondary leading-relaxed">
            <p className="font-semibold text-dark-textPrimary">💡 Não são necessárias chaves de API!</p>
            <p>
              As cotações, múltiplos fundamentalistas e preços-alvo são coletados de forma pública. Em caso de quedas de rede ou limitações, fallbacks locais de alta fidelidade assumirão os estudos automaticamente.
            </p>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-lg border text-sm flex items-start gap-2.5 ${
              status === 'success' ? 'bg-emerald-950/20 border-brand-success/30 text-brand-success' :
              status === 'error' ? 'bg-rose-950/20 border-brand-danger/30 text-brand-danger' :
              'bg-blue-950/20 border-brand-info/30 text-brand-info'
            }`}>
              {status === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
              {status === 'success' && <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />}
              {status === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-900/30 border-t border-dark-border flex gap-3 justify-end">
          <button
            onClick={handleTestConnection}
            disabled={status === 'testing'}
            className="px-5 py-2 bg-brand-primary hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-md shadow-brand-primary/20"
          >
            Testar Conexão
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-dark-border text-dark-textPrimary hover:bg-dark-cardHover rounded-lg text-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
