import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Bookmark, Briefcase, AlertCircle, Check } from 'lucide-react';
import { searchTickers } from '../services/api';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string, type: 'studying' | 'portfolio', quantity?: number, averagePrice?: number) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [type, setType] = useState<'studying' | 'portfolio'>('studying');
  const [quantity, setQuantity] = useState('100');
  const [averagePrice, setAveragePrice] = useState('30.00');
  const [error, setError] = useState<string | null>(null);

  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedSymbol('');
      setSelectedName('');
      setType('studying');
      setQuantity('100');
      setAveragePrice('30.00');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // Hide suggestions on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    return searchTickers(searchQuery, 6);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectSuggestion = (sym: string, name: string) => {
    setSelectedSymbol(sym);
    setSelectedName(name);
    setSearchQuery(sym);
    setShowSuggestions(false);
    setError(null);
  };

  const handleConfirm = () => {
    setError(null);
    const sym = selectedSymbol || searchQuery.toUpperCase().trim();
    if (!sym) {
      setError('Por favor, digite ou selecione um ativo.');
      return;
    }

    if (type === 'portfolio') {
      const qty = parseInt(quantity);
      const avgPrice = parseFloat(averagePrice);

      if (isNaN(qty) || qty <= 0) {
        setError('Por favor, insira uma quantidade válida maior que zero.');
        return;
      }
      if (isNaN(avgPrice) || avgPrice <= 0) {
        setError('Por favor, insira um preço médio válido maior que zero.');
        return;
      }

      onAdd(sym, 'portfolio', qty, avgPrice);
    } else {
      onAdd(sym, 'studying');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-gray-900/30">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-primary" />
            <h3 className="text-sm font-bold text-dark-textPrimary uppercase tracking-wider">Acompanhar Novo Ativo</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-dark-textSecondary hover:text-dark-textPrimary transition-colors p-1 hover:bg-dark-cardHover rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-xl flex items-center gap-2.5 text-2xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Asset */}
          <div className="space-y-1.5 relative" ref={suggestionsRef}>
            <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">
              Código do Ativo (Ticker B3)
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-dark-textSecondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSymbol('');
                  setSelectedName('');
                  setShowSuggestions(true);
                  setError(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ex: PETR4, VALE3, MXRF11..."
                className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-dark-textPrimary placeholder:text-dark-textSecondary/40 transition-all font-mono"
              />
            </div>
            {selectedName && (
              <span className="block text-3xs text-brand-primary font-bold">{selectedName}</span>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-dark-border rounded-xl shadow-2xl overflow-hidden z-20">
                {suggestions.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelectSuggestion(item.symbol, item.name)}
                    className="w-full text-left px-4 py-2.5 hover:bg-dark-cardHover flex items-center justify-between border-b border-dark-border/40 last:border-none transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-bold text-xs text-dark-textPrimary">{item.symbol}</span>
                    <span className="text-3xs text-dark-textSecondary truncate max-w-44">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selection options: watch or portfolio */}
          <div className="space-y-2">
            <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">
              Finalidade do Acompanhamento
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              {/* Option A: Study */}
              <button
                type="button"
                onClick={() => setType('studying')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                  type === 'studying'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm shadow-brand-primary/10'
                    : 'border-dark-border/80 hover:border-gray-700 text-dark-textSecondary hover:text-dark-textPrimary bg-dark-bg/30'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-2xs font-extrabold uppercase tracking-wide">Estudar</span>
                <span className="text-[10px] opacity-75 font-semibold leading-tight">Ficar de olho e analisar</span>
              </button>

              {/* Option B: Portfolio */}
              <button
                type="button"
                onClick={() => setType('portfolio')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                  type === 'portfolio'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm shadow-brand-primary/10'
                    : 'border-dark-border/80 hover:border-gray-700 text-dark-textSecondary hover:text-dark-textPrimary bg-dark-bg/30'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span className="text-2xs font-extrabold uppercase tracking-wide">Carteira</span>
                <span className="text-[10px] opacity-75 font-semibold leading-tight">Adicionar às minhas posições</span>
              </button>
            </div>
          </div>

          {/* Portfolio Inputs */}
          {type === 'portfolio' && (
            <div className="grid grid-cols-2 gap-3.5 border-t border-dark-border/40 pt-4.5 animate-fadeIn">
              {/* Quantity */}
              <div className="space-y-1">
                <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">
                  Quantidade
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="100"
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none rounded-xl py-2.5 px-3.5 text-xs text-dark-textPrimary font-mono transition-all"
                />
              </div>

              {/* Average Price */}
              <div className="space-y-1">
                <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">
                  Preço Médio (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={averagePrice}
                  onChange={(e) => setAveragePrice(e.target.value)}
                  placeholder="30.00"
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none rounded-xl py-2.5 px-3.5 text-xs text-dark-textPrimary font-mono transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-900/30 border-t border-dark-border flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-dark-border hover:border-gray-700 text-dark-textPrimary hover:bg-dark-cardHover/40 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-brand-primary text-white hover:opacity-95 rounded-xl text-xs font-black uppercase tracking-wide shadow-md shadow-brand-primary/10 cursor-pointer flex items-center gap-1.5 active-scale"
          >
            <Check className="w-3.5 h-3.5" />
            Confirmar Ativo
          </button>
        </div>
      </div>
    </div>
  );
};
