// src/components/TradingViewWidget.tsx
import React from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  // Format the ticker
  const cleanSym = symbol.toUpperCase().replace('.SA', '').trim();
  let tvSymbol = `BMFBOVESPA:${cleanSym}`;
  
  if (cleanSym === 'BVSP' || cleanSym === '^BVSP' || cleanSym === 'IBOV') {
    tvSymbol = 'BMFBOVESPA:IBOV';
  } else if (cleanSym === 'GSPC' || cleanSym === '^GSPC' || cleanSym === 'SPX') {
    tvSymbol = 'SP:SPX';
  } else if (cleanSym === 'IXIC' || cleanSym === '^IXIC') {
    tvSymbol = 'NASDAQ:IXIC';
  }

  // Construct the official TradingView Embed URL
  const embedUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tvSymbol}&interval=D&theme=dark&style=1&timezone=America%2FSao_Paulo&locale=br`;

  return (
    <iframe
      title={`TradingView Chart for ${symbol}`}
      src={embedUrl}
      className="w-full h-full border border-dark-border/80 rounded-2xl overflow-hidden shadow-lg bg-dark-bg/60"
      style={{ minHeight: '380px', width: '100%', height: '100%' }}
      frameBorder="0"
      allowFullScreen
      scrolling="no"
    />
  );
};
