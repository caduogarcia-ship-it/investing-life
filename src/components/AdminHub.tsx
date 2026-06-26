import React, { useState, useEffect } from 'react';
import { Shield, Users, Wallet, Eye, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAllUsersData, ADMIN_EMAIL } from '../services/supabase';
import type { UserDataRow } from '../services/supabase';

interface AdminHubProps {
  currentEmail: string;
}

export const AdminHub: React.FC<AdminHubProps> = ({ currentEmail }) => {
  const [users, setUsers] = useState<UserDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const isAdmin = currentEmail === ADMIN_EMAIL;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsersData();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-fadeIn">
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Shield className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-extrabold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>Acesso Restrito</h2>
        <p className="text-sm text-dark-textSecondary text-center max-w-md">
          Este painel é exclusivo para o administrador da plataforma. Seu e-mail não possui permissão de acesso.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssets = users.reduce((sum, u) => {
    const portfolio = Array.isArray(u.portfolio) ? u.portfolio : [];
    return sum + portfolio.length;
  }, 0);

  const totalInvested = users.reduce((sum, u) => {
    const portfolio = Array.isArray(u.portfolio) ? u.portfolio : [];
    return sum + portfolio.reduce((s: number, p: any) => s + (p.quantity || 0) * (p.averagePrice || 0), 0);
  }, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-dark-border shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(15,18,30,0.98))' }}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.15))', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold" style={{ fontFamily: 'Outfit, sans-serif', background: 'linear-gradient(135deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Hub do Administrador
                </h2>
                <p className="text-sm text-dark-textSecondary font-medium mt-0.5">
                  Painel exclusivo — Visualização de todos os investidores
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-dark-textSecondary hover:text-dark-textPrimary transition-all cursor-pointer select-none active-scale"
            style={{ background: 'rgba(9,13,22,0.5)', border: '1px solid rgba(31,41,55,0.8)' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 space-y-2" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(31,41,55,0.5)' }}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider">Usuários Cadastrados</span>
          </div>
          <p className="text-3xl font-black text-dark-textPrimary font-mono">{users.length}</p>
        </div>
        <div className="rounded-xl p-5 space-y-2" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(31,41,55,0.5)' }}>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider">Total de Posições</span>
          </div>
          <p className="text-3xl font-black text-dark-textPrimary font-mono">{totalAssets}</p>
        </div>
        <div className="rounded-xl p-5 space-y-2" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(31,41,55,0.5)' }}>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider">Capital Total Investido</span>
          </div>
          <p className="text-3xl font-black text-dark-textPrimary font-mono">
            R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-dark-textSecondary" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por e-mail..."
          className="w-full bg-dark-card border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-dark-textPrimary placeholder:text-dark-textSecondary/40 font-mono"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-dark-textSecondary/30 mx-auto mb-4" />
          <p className="text-sm text-dark-textSecondary">
            {searchTerm ? 'Nenhum usuário encontrado com esse e-mail.' : 'Nenhum usuário cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const portfolio = Array.isArray(user.portfolio) ? user.portfolio : [];
            const watchlist = Array.isArray(user.watchlist) ? user.watchlist : [];
            const isExpanded = expandedUser === user.user_id;
            const userInvested = portfolio.reduce((s: number, p: any) => s + (p.quantity || 0) * (p.averagePrice || 0), 0);

            return (
              <div
                key={user.user_id}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{ border: '1px solid rgba(31,41,55,0.5)', background: isExpanded ? 'rgba(17,24,39,0.8)' : 'rgba(17,24,39,0.4)' }}
              >
                {/* User Row */}
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : user.user_id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-dark-card/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white uppercase"
                      style={{ background: `linear-gradient(135deg, hsl(${(user.email.charCodeAt(0) * 7) % 360}, 60%, 50%), hsl(${(user.email.charCodeAt(1) * 13) % 360}, 50%, 40%))` }}
                    >
                      {user.email.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-dark-textPrimary font-mono">{user.email}</p>
                      <p className="text-[11px] text-dark-textSecondary">
                        {portfolio.length} ativo{portfolio.length !== 1 ? 's' : ''} na carteira • {watchlist.length} em estudo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-dark-textPrimary font-mono hidden sm:block">
                      R$ {userInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-dark-textSecondary" /> : <ChevronDown className="w-4 h-4 text-dark-textSecondary" />}
                  </div>
                </button>

                {/* Expanded Portfolio View */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 animate-fadeIn" style={{ borderTop: '1px solid rgba(31,41,55,0.4)' }}>
                    {/* Watchlist */}
                    {watchlist.length > 0 && (
                      <div className="pt-4 space-y-2">
                        <span className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> Ativos em Estudo ({watchlist.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {watchlist.map((ticker: string) => (
                            <span key={ticker} className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary font-mono"
                              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                              {ticker}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Portfolio Table */}
                    {portfolio.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5" /> Carteira ({portfolio.length} ativos)
                        </span>
                        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(31,41,55,0.4)' }}>
                          <table className="w-full text-xs">
                            <thead>
                              <tr style={{ background: 'rgba(9,13,22,0.6)' }}>
                                <th className="text-left px-3 py-2.5 font-extrabold text-dark-textSecondary uppercase tracking-wider">Ticker</th>
                                <th className="text-right px-3 py-2.5 font-extrabold text-dark-textSecondary uppercase tracking-wider">Qtd</th>
                                <th className="text-right px-3 py-2.5 font-extrabold text-dark-textSecondary uppercase tracking-wider">PM (R$)</th>
                                <th className="text-right px-3 py-2.5 font-extrabold text-dark-textSecondary uppercase tracking-wider">Total (R$)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {portfolio.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-dark-card/20 transition-colors" style={{ borderTop: '1px solid rgba(31,41,55,0.3)' }}>
                                  <td className="px-3 py-2.5 font-bold text-dark-textPrimary font-mono">{item.symbol}</td>
                                  <td className="px-3 py-2.5 text-right text-dark-textSecondary font-mono">{item.quantity}</td>
                                  <td className="px-3 py-2.5 text-right text-dark-textSecondary font-mono">{(item.averagePrice || 0).toFixed(2)}</td>
                                  <td className="px-3 py-2.5 text-right text-dark-textPrimary font-mono font-bold">
                                    {((item.quantity || 0) * (item.averagePrice || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-dark-textSecondary italic py-3">Este usuário ainda não adicionou ativos à carteira.</p>
                    )}

                    <p className="text-[10px] text-dark-textSecondary/50 font-mono">
                      Última atualização: {new Date(user.updated_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
