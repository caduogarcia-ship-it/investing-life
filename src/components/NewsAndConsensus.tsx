// src/components/NewsAndConsensus.tsx
import React, { useState, useEffect } from 'react';
import { Newspaper, Bell, ChevronRight, BarChart, Search, Download, FileText, Globe, ExternalLink, TrendingUp, TrendingDown, Target, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchStockNews, fetchStockConsensus, normalizeText } from '../services/api';
import type { NewsItem, ConsensusData } from '../services/api';

interface NewsAndConsensusProps {
  symbol: string;
  currentPrice: number;
}

export const NewsAndConsensus: React.FC<NewsAndConsensusProps> = ({ symbol, currentPrice }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'ri'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [consensus, setConsensus] = useState<ConsensusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<'todos' | 'dividendos' | 'resultados' | 'fato-relevante'>('todos');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<'todos' | 'investimentos' | 'noticias'>('todos');

  const getDomainName = (url: string) => {
    try {
      if (!url || url === '#') return '';
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return '';
    }
  };

  const getSourceStyle = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('infomoney')) {
      return { initials: 'IM', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', color: '#f59e0b' };
    }
    if (s.includes('valor')) {
      return { initials: 'VE', bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.35)', color: '#0ea5e9' };
    }
    if (s.includes('bloomberg')) {
      return { initials: 'BL', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)', color: '#f97316' };
    }
    if (s.includes('brazil')) {
      return { initials: 'BJ', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#10b981' };
    }
    if (s.includes('money')) {
      return { initials: 'MT', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.35)', color: '#14b8a6' };
    }
    if (s.includes('suno')) {
      return { initials: 'SN', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', color: '#ef4444' };
    }
    if (s.includes('exame')) {
      return { initials: 'EX', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)', color: '#6366f1' };
    }
    if (s.includes('estadão') || s.includes('estadao')) {
      return { initials: 'ES', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)', color: '#8b5cf6' };
    }
    if (s.includes('globo') || s.includes('g1')) {
      return { initials: 'G1', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', color: '#3b82f6' };
    }
    if (s.includes('reuters')) {
      return { initials: 'RT', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.35)', color: '#ec4899' };
    }
    if (s.includes('cnbc')) {
      return { initials: 'CB', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.35)', color: '#06b6d4' };
    }
    if (s.includes('ri') || s.includes('cvm')) {
      return { initials: 'RI', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#10b981' };
    }
    return { initials: 'N', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.35)', color: '#94a3b8' };
  };

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [newsRes, consensusRes] = await Promise.all([
          fetchStockNews(symbol),
          fetchStockConsensus(symbol, currentPrice)
        ]);
        if (active) {
          setNews(newsRes);
          setConsensus(consensusRes);
        }
      } catch (err) {
        console.error('Failed to load news/consensus', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [symbol, currentPrice]);

  const getSentiment = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lucro') || t.includes('alta') || t.includes('recorde') || t.includes('descoberta') || t.includes('investimento') || t.includes('aprova pagamento') || t.includes('parceria') || t.includes('aumento')) {
      return { text: 'Otimista', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' };
    }
    if (t.includes('queda') || t.includes('prejuízo') || t.includes('rompimento') || t.includes('dívida') || t.includes('correção') || t.includes('volatilidade')) {
      return { text: 'Alerta', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' };
    }
    return { text: 'Neutro', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
  };

  const getCategory = (title: string, isRI: boolean) => {
    const t = title.toLowerCase();
    if (t.includes('dividendo') || t.includes('juros sobre capital') || t.includes('jcp') || t.includes('proventos') || t.includes('rendimento')) return 'Dividendos';
    if (t.includes('resultado') || t.includes('lucro') || t.includes('ebitda') || t.includes('receita') || t.includes('vso') || t.includes('vgv')) return 'Resultados';
    if (isRI) return 'Corporativo';
    return 'Mercado';
  };

  const filteredNews = news
    .filter(item => activeTab === 'news' ? !item.isRelevantFact : item.isRelevantFact)
    .filter(item => {
      const q = normalizeText(searchQuery);
      const matchesSearch = normalizeText(item.title).includes(q) ||
                            normalizeText(item.source).includes(q) ||
                            (item.summary && normalizeText(item.summary).includes(q));
      
      const category = getCategory(item.title, item.isRelevantFact).toLowerCase();
      const matchesTag = selectedTag === 'todos' ||
                         (selectedTag === 'dividendos' && category === 'dividendos') ||
                         (selectedTag === 'resultados' && category === 'resultados') ||
                         (selectedTag === 'fato-relevante' && item.isRelevantFact);

      const matchesSource = activeTab === 'ri' || selectedSourceFilter === 'todos' ||
                            (selectedSourceFilter === 'investimentos' && item.sourceCategory === 'investment') ||
                            (selectedSourceFilter === 'noticias' && item.sourceCategory === 'general');

      return matchesSearch && matchesTag && matchesSource;
    });

  const getConsensusColor = (rec: string) => {
    if (rec.includes('Compra')) return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' };
    if (rec.includes('Venda')) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' };
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
  };

  const totalRecommendations = consensus 
    ? consensus.buys + consensus.holds + consensus.sells 
    : 0;

  const getPercent = (count: number) => {
    if (totalRecommendations === 0) return 0;
    return (count / totalRecommendations) * 100;
  };

  // Calculate upside/downside
  const upsidePercent = consensus 
    ? ((consensus.targetMean - currentPrice) / currentPrice * 100)
    : 0;

  // Calculate price position within target range for gauge
  const getPricePosition = () => {
    if (!consensus) return 50;
    const range = consensus.targetHigh - consensus.targetLow;
    if (range === 0) return 50;
    const pos = ((currentPrice - consensus.targetLow) / range) * 100;
    return Math.min(100, Math.max(0, pos));
  };

  // Count badges for filters
  const newsTabCount = news.filter(n => !n.isRelevantFact).length;
  const riTabCount = news.filter(n => n.isRelevantFact).length;
  const investmentCount = news.filter(n => !n.isRelevantFact && n.sourceCategory === 'investment').length;
  const generalCount = news.filter(n => !n.isRelevantFact && n.sourceCategory === 'general').length;

  // Skeleton shimmer component
  const Skeleton = ({ w, h, className = '' }: { w: string; h: string; className?: string }) => (
    <div 
      className={`rounded-lg animate-pulse ${className}`}
      style={{ width: w, height: h, background: 'linear-gradient(90deg, rgba(148,163,184,0.06) 25%, rgba(148,163,184,0.12) 50%, rgba(148,163,184,0.06) 75%)' }}
    />
  );

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-2xs font-bold text-dark-textSecondary uppercase tracking-wider block" style={{ fontFamily: 'Outfit, sans-serif' }}>Sentimento de Mercado</span>
        <h3 className="text-lg font-bold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>Consenso e Comunicados (RI)</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* News Feed Panel (Tabbed) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex" style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
            <button
              onClick={() => {
                setActiveTab('news');
                setSelectedTag('todos');
                setSelectedSourceFilter('todos');
              }}
              className="cursor-pointer"
              style={{
                padding: '0 16px 10px',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: `2px solid ${activeTab === 'news' ? '#6366f1' : 'transparent'}`,
                color: activeTab === 'news' ? '#f1f5f9' : '#94a3b8',
                background: 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <Newspaper className="w-4 h-4" />
              Notícias
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                background: activeTab === 'news' ? 'rgba(99,102,241,0.15)' : 'rgba(148,163,184,0.08)',
                color: activeTab === 'news' ? '#818cf8' : '#64748b',
                borderRadius: '6px',
                padding: '1px 6px',
                minWidth: '20px',
                textAlign: 'center',
              }}>
                {newsTabCount}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ri');
                setSelectedTag('todos');
                setSelectedSourceFilter('todos');
              }}
              className="cursor-pointer"
              style={{
                padding: '0 16px 10px',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: `2px solid ${activeTab === 'ri' ? '#6366f1' : 'transparent'}`,
                color: activeTab === 'ri' ? '#f1f5f9' : '#94a3b8',
                background: 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <Bell className="w-4 h-4" />
              RI / Comunicados
              {riTabCount > 0 && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: activeTab === 'ri' ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.08)',
                  color: activeTab === 'ri' ? '#f87171' : '#64748b',
                  borderRadius: '6px',
                  padding: '1px 6px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {riTabCount}
                </span>
              )}
            </button>
          </div>

          {/* Local Search and Filter Row */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Filtrar publicações..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '34px',
                    paddingRight: '14px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    background: 'rgba(15,23,42,0.5)',
                    border: '1px solid rgba(148,163,184,0.15)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontFamily: 'Outfit, sans-serif',
                    color: '#f1f5f9',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                />
              </div>

              {/* Source Category Pills (only for news tab) */}
              {activeTab === 'news' && (
                <div className="flex flex-wrap gap-1.5 select-none">
                  {([
                    { key: 'todos' as const, label: 'Todas', count: newsTabCount },
                    { key: 'investimentos' as const, label: 'Investimento', count: investmentCount },
                    { key: 'noticias' as const, label: 'Notícias', count: generalCount },
                  ]).map(srcFilter => (
                    <button
                      key={srcFilter.key}
                      onClick={() => setSelectedSourceFilter(srcFilter.key)}
                      className="cursor-pointer"
                      style={{
                        padding: '3px 10px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 800,
                        fontFamily: 'Outfit, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: `1px solid ${selectedSourceFilter === srcFilter.key ? 'rgba(99,102,241,0.5)' : 'rgba(148,163,184,0.15)'}`,
                        background: selectedSourceFilter === srcFilter.key ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.3)',
                        color: selectedSourceFilter === srcFilter.key ? '#818cf8' : '#64748b',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {srcFilter.label}
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '9px',
                        opacity: 0.7,
                      }}>
                        ({srcFilter.count})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Topic Filter Tags */}
            <div className="flex flex-wrap gap-1.5 items-center select-none" style={{ paddingTop: '8px', borderTop: '1px solid rgba(148,163,184,0.06)' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginRight: '4px' }}>Tópico:</span>
              {(['todos', 'dividendos', 'resultados'] as const).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className="cursor-pointer"
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    fontFamily: 'Outfit, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: `1px solid ${selectedTag === tag ? 'rgba(99,102,241,0.5)' : 'rgba(148,163,184,0.15)'}`,
                    background: selectedTag === tag ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.3)',
                    color: selectedTag === tag ? '#818cf8' : '#64748b',
                    transition: 'all 0.2s',
                  }}
                >
                  {tag === 'todos' ? 'Todos' : tag === 'dividendos' ? '💰 Dividendos' : '📊 Resultados'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            /* Skeleton loading */
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  padding: '14px',
                  background: 'rgba(15,23,42,0.3)',
                  border: '1px solid rgba(148,163,184,0.08)',
                  borderRadius: '12px',
                }}>
                  <div className="flex items-start gap-3">
                    <Skeleton w="28px" h="28px" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Skeleton w="60px" h="16px" />
                        <Skeleton w="45px" h="16px" />
                      </div>
                      <Skeleton w="90%" h="14px" />
                      <Skeleton w="70%" h="12px" />
                      <Skeleton w="100px" h="10px" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed rgba(148,163,184,0.15)',
              borderRadius: '12px',
              padding: '40px 20px',
              gap: '8px',
            }}>
              <Search style={{ width: '24px', height: '24px', color: '#475569' }} />
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Outfit, sans-serif' }}>
                Sem publicações correspondentes encontradas.
              </span>
            </div>
          ) : (
            <div className="space-y-2.5" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredNews.map((item) => {
                const sentiment = getSentiment(item.title);
                const category = getCategory(item.title, item.isRelevantFact);
                const domain = getDomainName(item.url);
                const sourceStyle = getSourceStyle(item.source);

                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                    style={{
                      padding: '14px',
                      background: 'rgba(15,23,42,0.25)',
                      border: '1px solid rgba(148,163,184,0.1)',
                      borderRadius: '12px',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.background = 'rgba(30,41,59,0.5)';
                      el.style.borderColor = 'rgba(99,102,241,0.25)';
                      el.style.transform = 'translateY(-1px)';
                      el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.background = 'rgba(15,23,42,0.25)';
                      el.style.borderColor = 'rgba(148,163,184,0.1)';
                      el.style.transform = 'translateY(0)';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    {/* Colored accent line on left */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: sourceStyle.color,
                      opacity: 0.5,
                      borderRadius: '3px 0 0 3px',
                    }} />
                    
                    <div className="flex items-start justify-between gap-3" style={{ paddingLeft: '6px' }}>
                      {/* Initials badge */}
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        border: `1px solid ${sourceStyle.border}`,
                        background: sourceStyle.bg,
                        color: sourceStyle.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 800,
                        fontFamily: 'JetBrains Mono, monospace',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}>
                        {sourceStyle.initials}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-1.5" style={{ marginBottom: '6px' }}>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            fontFamily: 'Outfit, sans-serif',
                            padding: '1px 7px',
                            borderRadius: '5px',
                            border: `1px solid ${item.isRelevantFact ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}`,
                            background: item.isRelevantFact ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
                            color: item.isRelevantFact ? '#f87171' : '#818cf8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}>
                            {item.isRelevantFact ? <Bell style={{ width: '9px', height: '9px' }} /> : <Newspaper style={{ width: '9px', height: '9px' }} />}
                            {item.source}
                          </span>
                          
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            fontFamily: 'Outfit, sans-serif',
                            padding: '1px 7px',
                            borderRadius: '5px',
                            border: `1px solid ${sentiment.border}`,
                            background: sentiment.bg,
                            color: sentiment.color,
                          }}>
                            {sentiment.text}
                          </span>

                          <span style={{
                            fontSize: '9px',
                            fontWeight: 600,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: '#475569',
                          }}>
                            • {category}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h4 style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          fontFamily: 'Outfit, sans-serif',
                          color: '#e2e8f0',
                          lineHeight: 1.5,
                          transition: 'color 0.2s',
                        }} className="group-hover:text-brand-primary">
                          {item.title}
                        </h4>

                        {/* Summary */}
                        {item.summary && (
                          <p style={{
                            fontSize: '11px',
                            fontFamily: 'Outfit, sans-serif',
                            color: 'rgba(148,163,184,0.75)',
                            lineHeight: 1.5,
                            marginTop: '4px',
                          }}>
                            {item.summary}
                          </p>
                        )}
                        
                        {/* Footer */}
                        <div className="flex items-center gap-2" style={{
                          fontSize: '10px',
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'rgba(148,163,184,0.6)',
                          marginTop: '8px',
                        }}>
                          <span>{item.date}</span>
                          {domain && (
                            <>
                              <span style={{ color: 'rgba(148,163,184,0.3)' }}>•</span>
                              <span className="flex items-center gap-1 group-hover:text-brand-primary" style={{ transition: 'color 0.2s' }}>
                                <Globe style={{ width: '10px', height: '10px' }} />
                                {domain}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight 
                        className="group-hover:translate-x-0.5 transition-transform"
                        style={{ width: '16px', height: '16px', color: '#475569', flexShrink: 0, marginTop: '4px' }} 
                      />
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Quick RI Downloads section when activeTab === 'ri' */}
          {activeTab === 'ri' && !loading && (
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: '16px', marginTop: '8px' }} className="space-y-3 animate-fadeIn">
              <h4 style={{
                fontSize: '10px',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <FileText style={{ width: '14px', height: '14px', color: '#6366f1' }} /> Central de Documentos de RI
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a 
                  href={`https://statusinvest.com.br/acoes/${symbol.toLowerCase()}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(15,23,42,0.3)',
                    border: '1px solid rgba(148,163,184,0.1)',
                    borderRadius: '10px',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.4)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.3)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'; }}
                >
                  <span style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', color: '#94a3b8', fontWeight: 600 }}>📄 Central de Resultados 1T26.pdf</span>
                  <Download style={{ width: '14px', height: '14px', color: '#6366f1' }} />
                </a>
                <a 
                  href={`https://statusinvest.com.br/acoes/${symbol.toLowerCase()}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(15,23,42,0.3)',
                    border: '1px solid rgba(148,163,184,0.1)',
                    borderRadius: '10px',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.4)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.3)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'; }}
                >
                  <span style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', color: '#94a3b8', fontWeight: 600 }}>📊 Apresentação Corporativa.pdf</span>
                  <Download style={{ width: '14px', height: '14px', color: '#6366f1' }} />
                </a>
              </div>
            </div>
          )}

          {/* Quick search portals row - expanded */}
          {!loading && (
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between" style={{
              paddingTop: '12px',
              borderTop: '1px solid rgba(148,163,184,0.08)',
              fontSize: '10px',
            }}>
              <span style={{ color: 'rgba(148,163,184,0.6)', fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>
                Pesquise em portais externos:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Google', icon: <Globe style={{ width: '11px', height: '11px', color: '#6366f1' }} />, url: `https://www.google.com/search?q=${symbol}+noticias+mercado+financeiro` },
                  { label: 'InfoMoney', icon: <ExternalLink style={{ width: '11px', height: '11px', color: '#f59e0b' }} />, url: `https://www.infomoney.com.br/busca/?q=${symbol}` },
                  { label: 'Status Invest', icon: <ExternalLink style={{ width: '11px', height: '11px', color: '#10b981' }} />, url: `https://statusinvest.com.br/acoes/${symbol.toLowerCase()}` },
                  { label: 'Suno', icon: <ExternalLink style={{ width: '11px', height: '11px', color: '#ef4444' }} />, url: `https://www.suno.com.br/noticias/?q=${symbol}` },
                  { label: 'Investing', icon: <ExternalLink style={{ width: '11px', height: '11px', color: '#0ea5e9' }} />, url: `https://br.investing.com/search/?q=${symbol}` },
                ].map(portal => (
                  <a
                    key={portal.label}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      background: 'rgba(15,23,42,0.4)',
                      border: '1px solid rgba(148,163,184,0.12)',
                      borderRadius: '8px',
                      color: '#94a3b8',
                      fontSize: '10px',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.4)'; e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.4)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    {portal.icon}
                    {portal.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Analyst Consensus Panel - Premium Redesign */}
        <div className="lg:col-span-5" style={{
          background: 'rgba(15,23,42,0.35)',
          border: '1px solid rgba(148,163,184,0.12)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}>
          <div>
            <h4 style={{
              fontSize: '13px',
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              color: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <BarChart style={{ width: '16px', height: '16px', color: '#6366f1' }} />
              Consenso de Analistas
            </h4>
            <p style={{
              fontSize: '10px',
              fontFamily: 'Outfit, sans-serif',
              color: '#64748b',
              lineHeight: 1.5,
              marginTop: '2px',
            }}>
              Consolidação de recomendações de casas de análise para {symbol}.
            </p>
          </div>

          {loading || !consensus ? (
            <div className="space-y-3" style={{ padding: '10px 0' }}>
              <Skeleton w="100%" h="60px" />
              <Skeleton w="100%" h="40px" />
              <Skeleton w="100%" h="24px" />
              <Skeleton w="100%" h="24px" />
              <Skeleton w="100%" h="24px" />
            </div>
          ) : (() => {
            const recStyle = getConsensusColor(consensus.recommendation);
            return (
            <div className="space-y-4">
              
              {/* Recommendation + Upside Hero Card */}
              <div style={{
                background: `linear-gradient(135deg, ${recStyle.bg}, rgba(15,23,42,0.4))`,
                border: `1px solid ${recStyle.border}`,
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#64748b',
                    }}>Recomendação</span>
                    <div style={{
                      marginTop: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      border: `1px solid ${recStyle.border}`,
                      background: recStyle.bg,
                      color: recStyle.color,
                      fontSize: '13px',
                      fontWeight: 900,
                      fontFamily: 'Outfit, sans-serif',
                    }}>
                      {consensus.recommendation.includes('Compra') ? <TrendingUp style={{ width: '14px', height: '14px' }} /> : 
                       consensus.recommendation.includes('Venda') ? <TrendingDown style={{ width: '14px', height: '14px' }} /> :
                       <Target style={{ width: '14px', height: '14px' }} />}
                      {consensus.recommendation}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#64748b',
                    }}>Preço Alvo</span>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#f1f5f9',
                      marginTop: '2px',
                    }}>
                      R$ {consensus.targetMean.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>

                {/* Upside / Downside indicator */}
                <div style={{
                  marginTop: '14px',
                  padding: '10px 14px',
                  background: 'rgba(15,23,42,0.5)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div className="flex items-center gap-2">
                    {upsidePercent >= 0 ? (
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: '#10b981' }} />
                    ) : (
                      <ArrowDownRight style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                    )}
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'Outfit, sans-serif',
                      color: '#94a3b8',
                      fontWeight: 600,
                    }}>
                      {upsidePercent >= 0 ? 'Potencial de Alta' : 'Potencial de Queda'}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: upsidePercent >= 0 ? '#10b981' : '#ef4444',
                  }}>
                    {upsidePercent >= 0 ? '+' : ''}{upsidePercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Price Range Gauge */}
              <div style={{
                background: 'rgba(15,23,42,0.4)',
                border: '1px solid rgba(148,163,184,0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#64748b',
                  display: 'block',
                  marginBottom: '10px',
                }}>Posição do Preço vs Faixa de Alvos</span>
                
                <div style={{ position: 'relative', height: '8px', borderRadius: '4px', overflow: 'visible' }}>
                  {/* Background track */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '4px',
                    background: 'linear-gradient(90deg, rgba(239,68,68,0.3), rgba(245,158,11,0.3), rgba(16,185,129,0.3))',
                  }} />
                  {/* Filled progress */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${getPricePosition()}%`,
                    borderRadius: '4px',
                    background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)',
                    transition: 'width 0.5s ease',
                  }} />
                  {/* Marker */}
                  <div style={{
                    position: 'absolute',
                    left: `${getPricePosition()}%`,
                    top: '-3px',
                    transform: 'translateX(-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    border: '2px solid #6366f1',
                    boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                    transition: 'left 0.5s ease',
                  }} />
                </div>
                
                {/* Labels */}
                <div className="flex justify-between" style={{ marginTop: '10px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'Outfit, sans-serif', display: 'block' }}>Menor Alvo</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
                      R$ {consensus.targetLow.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'Outfit, sans-serif', display: 'block' }}>Atual</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' }}>
                      R$ {currentPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'Outfit, sans-serif', display: 'block' }}>Maior Alvo</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                      R$ {consensus.targetHigh.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vote Breakdown */}
              <div style={{
                background: 'rgba(15,23,42,0.4)',
                border: '1px solid rgba(148,163,184,0.08)',
                borderRadius: '10px',
                padding: '14px',
              }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '12px',
                }}>
                  <Users style={{ width: '12px', height: '12px' }} />
                  Votos de Analistas ({totalRecommendations})
                </span>
                
                {/* Stacked horizontal bar */}
                <div style={{ 
                  display: 'flex', 
                  height: '10px', 
                  borderRadius: '5px', 
                  overflow: 'hidden', 
                  marginBottom: '12px',
                  background: 'rgba(148,163,184,0.08)',
                }}>
                  <div style={{ 
                    width: `${getPercent(consensus.buys)}%`, 
                    background: 'linear-gradient(90deg, #059669, #10b981)', 
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{ 
                    width: `${getPercent(consensus.holds)}%`, 
                    background: 'linear-gradient(90deg, #d97706, #f59e0b)', 
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{ 
                    width: `${getPercent(consensus.sells)}%`, 
                    background: 'linear-gradient(90deg, #dc2626, #ef4444)', 
                    transition: 'width 0.5s ease',
                  }} />
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {[
                    { label: 'Compra', count: consensus.buys, color: '#10b981', pct: getPercent(consensus.buys) },
                    { label: 'Manter / Neutro', count: consensus.holds, color: '#f59e0b', pct: getPercent(consensus.holds) },
                    { label: 'Vender', count: consensus.sells, color: '#ef4444', pct: getPercent(consensus.sells) },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '3px',
                          background: item.color,
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'Outfit, sans-serif',
                          color: item.color,
                        }}>{item.label}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#64748b',
                        }}>({item.count})</span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#e2e8f0',
                      }}>{item.pct.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
          })()}

        </div>

      </div>

    </div>
  );
};
