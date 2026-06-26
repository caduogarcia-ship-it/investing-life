import React from 'react';
import { BarChart2, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      borderTop: '1px solid rgba(31,41,55,0.6)',
      background: 'linear-gradient(180deg, rgba(9,13,22,0.0) 0%, rgba(9,13,22,0.95) 100%)',
      padding: '32px 24px 20px',
      marginTop: '40px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '6px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BarChart2 style={{ width: '16px', height: '16px', color: 'white' }} />
            </div>
            <div>
              <span style={{
                fontSize: '14px',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Investing Life</span>
              <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'Outfit, sans-serif', display: 'block', fontWeight: 500 }}>B3 Stock Analyzer</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {[
              { label: 'Status Invest', url: 'https://statusinvest.com.br' },
              { label: 'Fundamentus', url: 'https://fundamentus.com.br' },
              { label: 'B3', url: 'https://www.b3.com.br' },
            ].map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  fontFamily: 'Outfit, sans-serif',
                  color: '#64748b',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'color 0.2s',
                  fontWeight: 600,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
              >
                {link.label}
                <ExternalLink style={{ width: '10px', height: '10px' }} />
              </a>
            ))}
          </div>
        </div>
        
        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />
        
        {/* Bottom row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '10px',
            fontFamily: 'Outfit, sans-serif',
            color: '#475569',
            fontWeight: 500,
          }}>
            © {currentYear} Investing Life — Ferramenta educacional. Não constitui recomendação de investimento.
          </span>
          <span style={{
            fontSize: '10px',
            fontFamily: 'Outfit, sans-serif',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
          }}>
            Feito com <Heart style={{ width: '10px', height: '10px', color: '#ef4444', fill: '#ef4444' }} /> para investidores brasileiros
          </span>
        </div>
      </div>
    </footer>
  );
};
