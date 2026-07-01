import React, { useState, useEffect } from 'react';
import { X, Search, Save, Database, AlertCircle } from 'lucide-react';
import { getFundamentalsDb, saveFundamentalData } from '../data/fundamentalsDb';
import type { QuarterlyFundamentals } from '../data/fundamentalsDb';

interface AdminFundamentalsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminFundamentals: React.FC<AdminFundamentalsProps> = ({ isOpen, onClose }) => {
  const [db, setDb] = useState<Record<string, QuarterlyFundamentals>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuarterlyFundamentals>>({});
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDb(getFundamentalsDb());
      setEditingSymbol(null);
      setSavedMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEdit = (symbol: string, data: QuarterlyFundamentals) => {
    setEditingSymbol(symbol);
    setEditForm({ ...data });
    setSavedMessage('');
  };

  const handleAddNew = () => {
    if (!searchQuery) return;
    const cleanSymbol = searchQuery.toUpperCase().trim();
    setEditingSymbol(cleanSymbol);
    setEditForm({
      symbol: cleanSymbol,
      lpa: 0,
      vpa: 0,
      margemLiquida: 0,
      roe: 0,
      dy: 0,
    });
    setSavedMessage('');
  };

  const handleSave = () => {
    if (editingSymbol && editForm) {
      saveFundamentalData(editingSymbol, editForm);
      setDb(getFundamentalsDb());
      setEditingSymbol(null);
      setSavedMessage(`Fundamentos de ${editingSymbol} salvos com sucesso!`);
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

  const filteredAssets = Object.values(db)
    .filter(asset => asset.symbol.includes(searchQuery.toUpperCase()))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-4xl bg-dark-card border border-brand-primary/30 rounded-xl shadow-2xl flex flex-col h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-gray-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/20 rounded-lg">
              <Database className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-textPrimary">Banco de Dados Local (B3)</h3>
              <p className="text-xs text-dark-textSecondary">Gerencie lucros e balanços (LPA, VPA) a cada trimestre</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-dark-textSecondary hover:text-white hover:bg-dark-cardHover rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar - List of Assets */}
          <div className="w-full md:w-1/3 border-r border-dark-border flex flex-col bg-dark-bg/30">
            <div className="p-4 border-b border-dark-border shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-textSecondary" />
                <input 
                  type="text" 
                  placeholder="Buscar ou Adicionar Ticker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-card border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-dark-textPrimary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              {searchQuery && !filteredAssets.find(a => a.symbol === searchQuery.toUpperCase()) && (
                <button 
                  onClick={handleAddNew}
                  className="mt-3 w-full py-2 bg-dark-card border border-dashed border-brand-primary text-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary/10 transition-colors"
                >
                  + Adicionar {searchQuery.toUpperCase()} ao DB
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredAssets.map(asset => (
                <button
                  key={asset.symbol}
                  onClick={() => handleEdit(asset.symbol, asset)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                    editingSymbol === asset.symbol 
                      ? 'bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-medium' 
                      : 'hover:bg-dark-card text-dark-textPrimary border border-transparent'
                  }`}
                >
                  <span>{asset.symbol}</span>
                  <span className="text-xs text-dark-textSecondary opacity-70">
                    LPA: R$ {asset.lpa.toFixed(2)}
                  </span>
                </button>
              ))}
              {filteredAssets.length === 0 && !searchQuery && (
                <div className="text-center p-6 text-dark-textSecondary text-sm">
                  Nenhum ativo na base local ainda.
                </div>
              )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-dark-bg/10 relative">
            {savedMessage && (
              <div className="absolute top-4 right-6 left-6 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-lg z-10 animate-fade-in-up">
                <AlertCircle className="w-4 h-4" />
                {savedMessage}
              </div>
            )}

            {editingSymbol ? (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="border-b border-dark-border pb-4">
                  <h4 className="text-xl font-bold text-dark-textPrimary flex items-center gap-2">
                    <span className="bg-brand-primary text-white px-2.5 py-1 rounded-md text-sm">{editingSymbol}</span>
                    <span className="font-light">Edição Trimestral</span>
                  </h4>
                  <p className="text-xs text-dark-textSecondary mt-2">
                    Última atualização: {db[editingSymbol]?.lastUpdated || 'Novo registro'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-textSecondary ml-1">LPA (Lucro por Ação - R$)</label>
                    <input 
                      type="number" step="0.01"
                      value={editForm.lpa || ''}
                      onChange={e => setEditForm({...editForm, lpa: parseFloat(e.target.value) || 0})}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-sm text-dark-textPrimary focus:border-brand-primary"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-textSecondary ml-1">VPA (Valor Patrimonial - R$)</label>
                    <input 
                      type="number" step="0.01"
                      value={editForm.vpa || ''}
                      onChange={e => setEditForm({...editForm, vpa: parseFloat(e.target.value) || 0})}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-sm text-dark-textPrimary focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-textSecondary ml-1">Margem Líquida (%)</label>
                    <input 
                      type="number" step="0.1"
                      value={editForm.margemLiquida || ''}
                      onChange={e => setEditForm({...editForm, margemLiquida: parseFloat(e.target.value) || 0})}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-sm text-dark-textPrimary focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-textSecondary ml-1">ROE (%)</label>
                    <input 
                      type="number" step="0.1"
                      value={editForm.roe || ''}
                      onChange={e => setEditForm({...editForm, roe: parseFloat(e.target.value) || 0})}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-sm text-dark-textPrimary focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-medium text-dark-textSecondary ml-1">Dividend Yield Secundário (%)</label>
                    <p className="text-[10px] text-dark-textSecondary ml-1 mb-1 leading-tight">Será usado apenas se o cálculo automático de histórico de dividendos falhar.</p>
                    <input 
                      type="number" step="0.1"
                      value={editForm.dy || ''}
                      onChange={e => setEditForm({...editForm, dy: parseFloat(e.target.value) || 0})}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-sm text-dark-textPrimary focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border">
                  <button 
                    onClick={handleSave}
                    className="w-full py-3 bg-brand-primary hover:bg-indigo-600 text-white font-medium rounded-lg shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Fundamentos Trimestrais
                  </button>
                  <p className="text-center mt-3 text-xs text-dark-textSecondary">
                    Estes dados sobrescreverão todas as APIs e serão a base para calcular o P/L e o P/VP dinamicamente na tela.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center border border-dark-border">
                  <Database className="w-8 h-8 text-dark-textSecondary opacity-50" />
                </div>
                <div>
                  <h4 className="text-dark-textPrimary font-medium mb-1">Gerenciador do Banco Local</h4>
                  <p className="text-sm text-dark-textSecondary">
                    Selecione um ativo na barra lateral ou adicione um novo para preencher o LPA e VPA lançados nos balanços da empresa.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
