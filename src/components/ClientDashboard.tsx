import React, { useState } from 'react';
import { Plus, Users, Briefcase, MapPin, Target, Trash2 } from 'lucide-react';
import { Client } from '../types/crm';

interface ClientDashboardProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  onSelectClient: (clientId: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ clients, setClients, onSelectClient }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStrategy, setNewStrategy] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newClient: Client = {
      id: crypto.randomUUID(),
      name: newName,
      strategy: newStrategy || 'Geral',
      assetLocation: newLocation || 'Brasil',
      portfolio: [],
      created_at: new Date().toISOString()
    };

    const updated = [...clients, newClient];
    setClients(updated);
    localStorage.setItem('b3_analise_clients', JSON.stringify(updated));
    
    setNewName('');
    setNewStrategy('');
    setNewLocation('');
    setShowAddModal(false);
  };

  const handleDeleteClient = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja remover este cliente e toda a sua carteira?')) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      localStorage.setItem('b3_analise_clients', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-dark-textPrimary tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-primary" />
            CRM & Gestão de Clientes
          </h2>
          <p className="text-xs text-dark-textSecondary font-medium mt-1">
            Gerencie carteiras, estratégias e asset location de múltiplos investidores
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-brand-primary hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-primary/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {showAddModal && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl animate-fadeIn">
          <h3 className="text-sm font-bold text-dark-textPrimary mb-4">Adicionar Novo Cliente</h3>
          <form onSubmit={handleAddClient} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Nome do Cliente</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 outline-none py-2 px-3 rounded-xl text-sm font-bold text-dark-textPrimary"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Estratégia Principal</label>
              <input
                type="text"
                value={newStrategy}
                onChange={e => setNewStrategy(e.target.value)}
                placeholder="Ex: Previdenciária"
                className="w-full bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 outline-none py-2 px-3 rounded-xl text-sm font-bold text-dark-textPrimary"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Asset Location (Custódia)</label>
              <input
                type="text"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                placeholder="Ex: XP / Avenue"
                className="w-full bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 outline-none py-2 px-3 rounded-xl text-sm font-bold text-dark-textPrimary"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-dark-bg border border-dark-border hover:bg-dark-cardHover text-dark-textPrimary font-bold rounded-xl text-xs transition-all w-full"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-4 py-2 bg-brand-success hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all w-full"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => {
            const totalItems = client.portfolio?.length || 0;
            const totalValue = client.portfolio?.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0) || 0;
            
            return (
              <div 
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className="bg-dark-card border border-dark-border hover:border-brand-primary/50 rounded-2xl p-6 shadow-lg cursor-pointer transition-all hover:-translate-y-1 group relative"
              >
                <button
                  onClick={(e) => handleDeleteClient(e, client.id)}
                  className="absolute top-4 right-4 p-2 text-dark-textSecondary hover:text-brand-danger hover:bg-rose-950/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Remover Cliente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <h3 className="text-lg font-black text-dark-textPrimary mb-4 pr-8">{client.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-dark-textSecondary">
                    <Target className="w-4 h-4 text-brand-success" />
                    <span className="font-medium">Estratégia:</span>
                    <span className="text-dark-textPrimary font-bold">{client.strategy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-textSecondary">
                    <MapPin className="w-4 h-4 text-brand-purple" />
                    <span className="font-medium">Custódia:</span>
                    <span className="text-dark-textPrimary font-bold">{client.assetLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-textSecondary">
                    <Briefcase className="w-4 h-4 text-brand-warning" />
                    <span className="font-medium">Ativos:</span>
                    <span className="text-dark-textPrimary font-bold">{totalItems} posições</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border/50">
                  <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block mb-1">Patrimônio Consolidado</span>
                  <span className="text-xl font-black text-brand-primary font-mono">
                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-dark-card border border-dashed border-dark-border rounded-2xl p-12 text-center shadow-lg">
          <Users className="w-12 h-12 text-dark-textSecondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-dark-textPrimary mb-2">Nenhum cliente cadastrado</h3>
          <p className="text-xs text-dark-textSecondary max-w-md mx-auto">
            Comece adicionando seu primeiro cliente para gerenciar alocações, carteiras e metas estruturadas.
          </p>
        </div>
      )}
    </div>
  );
};
