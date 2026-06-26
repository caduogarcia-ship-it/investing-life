// src/components/InvestingWidget.tsx
import React from 'react';
import { INVESTING_PAIR_MAP } from '../services/investingMap';

interface InvestingWidgetProps {
  symbol: string;
}

export const InvestingWidget: React.FC<InvestingWidgetProps> = ({ symbol }) => {
  const cleanSym = symbol.toUpperCase().replace('.SA', '').trim();
  
  // Lookup the Investing.com pair ID, default to PETR4 (18750) if not found
  const pairId = INVESTING_PAIR_MAP[cleanSym] || 18750;
  
  // Construct the official Investing.com iframe technical chart URL
  // pair_ID: numerical index representing the asset
  // plotStyle: candles (draws candlesticks)
  // domain_ID: 18 (Investing.com Brazil)
  // lang_ID: 12 (Portuguese language)
  // timezone_ID: 12 (America/Sao_Paulo timezone)
  const embedUrl = `https://ssltvc.investing.com/?pair_ID=${pairId}&height=380&width=100%25&interval=D&plotStyle=candles&domain_ID=18&lang_ID=12&timezone_ID=12`;

  return (
    <iframe
      title={`Investing.com Chart for ${symbol}`}
      src={embedUrl}
      className="w-full h-full border border-dark-border/80 rounded-2xl overflow-hidden shadow-lg bg-dark-bg/60"
      style={{ minHeight: '380px', width: '100%', height: '100%' }}
      frameBorder="0"
      allowFullScreen
      scrolling="no"
    />
  );
};
