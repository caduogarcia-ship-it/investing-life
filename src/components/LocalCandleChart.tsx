import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, ColorType, createSeriesMarkers } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';

interface LocalCandleChartProps {
  data: Array<{
    date: string;
    price: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  }>;
  resistance?: number;
  support?: number;
  precoTeto?: number;
}

interface ChartDataPoint {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const LocalCandleChart: React.FC<LocalCandleChartProps> = ({
  data,
  resistance,
  support,
  precoTeto
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [hoveredData, setHoveredData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  } | null>(null);

  // Prepare sorted and deduplicated chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const seen = new Set<string>();
    return [...data]
      .map(item => ({
        time: item.date as Time,
        open: item.open ?? item.price,
        high: item.high ?? item.price,
        low: item.low ?? item.price,
        close: item.close ?? item.price,
        volume: item.volume ?? 0,
      }))
      .filter(item => {
        const key = String(item.time);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }, [data]);

  const latestPoint = chartData[chartData.length - 1] || null;
  const activePoint = hoveredData || (latestPoint ? {
    time: String(latestPoint.time),
    open: latestPoint.open,
    high: latestPoint.high,
    low: latestPoint.low,
    close: latestPoint.close,
    volume: latestPoint.volume,
  } : null);

  const formatVolume = (val: number) => {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(1)}k`;
    return val.toString();
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6B7280',
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(31, 41, 55, 0.25)', style: 1 },
        horzLines: { color: 'rgba(31, 41, 55, 0.25)', style: 1 },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          width: 1,
          color: 'rgba(99, 102, 241, 0.4)',
          style: 2,
          labelBackgroundColor: '#4F46E5',
        },
        horzLine: {
          width: 1,
          color: 'rgba(99, 102, 241, 0.4)',
          style: 2,
          labelBackgroundColor: '#4F46E5',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(55, 65, 81, 0.5)',
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
      },
      timeScale: {
        borderColor: 'rgba(55, 65, 81, 0.5)',
        timeVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    candleSeries.setData(chartData as CandlestickData[]);
    candleSeriesRef.current = candleSeries;

    // Volume Series (as histogram on a separate price scale)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    volumeSeries.setData(
      chartData.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
      }))
    );
    volumeSeriesRef.current = volumeSeries;

    // Add horizontal reference lines (price lines)
    if (resistance && resistance > 0) {
      candleSeries.createPriceLine({
        price: resistance,
        color: '#EF4444',
        lineWidth: 2, // integer
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `RESISTÊNCIA R$${resistance.toFixed(2)}`,
        axisLabelColor: '#EF4444',
        axisLabelTextColor: '#FFFFFF',
      });
    }

    if (support && support > 0) {
      candleSeries.createPriceLine({
        price: support,
        color: '#10B981',
        lineWidth: 2, // integer
        lineStyle: 2,
        axisLabelVisible: true,
        title: `SUPORTE R$${support.toFixed(2)}`,
        axisLabelColor: '#10B981',
        axisLabelTextColor: '#FFFFFF',
      });
    }

    if (precoTeto && precoTeto > 0) {
      candleSeries.createPriceLine({
        price: precoTeto,
        color: '#F59E0B',
        lineWidth: 2, // integer
        lineStyle: 2,
        axisLabelVisible: true,
        title: `PREÇO TETO R$${precoTeto.toFixed(2)}`,
        axisLabelColor: '#F59E0B',
        axisLabelTextColor: '#FFFFFF',
      });
    }

    // Set Buy/Sell markers on candlestick series based on proximity to support/resistance
    let markersPlugin: any = null;
    if (support && resistance && support > 0 && resistance > 0) {
      let lastBuyIndex = -10;
      let lastSellIndex = -10;
      const markersList: any[] = [];

      chartData.forEach((d, idx) => {
        // Proximity checks: within 2.5% range of support/resistance
        const isNearSupport = d.low <= support * 1.025;
        const isNearResistance = d.high >= resistance * 0.975;

        // Bullish confirmation at support
        if (isNearSupport && d.close > d.open && (idx - lastBuyIndex > 5)) {
          markersList.push({
            time: d.time,
            position: 'belowBar',
            color: '#10B981',
            shape: 'arrowUp',
            text: 'Compra',
            size: 1.2
          });
          lastBuyIndex = idx;
        } 
        // Bearish confirmation at resistance
        else if (isNearResistance && d.close < d.open && (idx - lastSellIndex > 5)) {
          markersList.push({
            time: d.time,
            position: 'aboveBar',
            color: '#EF4444',
            shape: 'arrowDown',
            text: 'Venda',
            size: 1.2
          });
          lastSellIndex = idx;
        }
      });

      markersPlugin = createSeriesMarkers(candleSeries, markersList);
    }

    // Crosshair move handler for hover data
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setHoveredData(null);
        return;
      }

      const candleData = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      const volumeData = param.seriesData.get(volumeSeries) as any;

      if (candleData) {
        setHoveredData({
          time: String(param.time),
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volumeData?.value ?? 0,
        });
      } else {
        setHoveredData(null);
      }
    });

    // Fit content to view
    chart.timeScale().fitContent();

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      if (markersPlugin) {
        markersPlugin.detach();
      }
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [chartData, resistance, support, precoTeto]);

  // Calculate OHLCV display values
  const oVal = activePoint?.open ?? 0;
  const cVal = activePoint?.close ?? 0;
  const hVal = activePoint?.high ?? 0;
  const lVal = activePoint?.low ?? 0;
  const vVal = activePoint?.volume ?? 0;
  const changePercent = oVal > 0 ? ((cVal - oVal) / oVal) * 100 : 0;
  const isUp = cVal >= oVal;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T12:00:00');
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-dark-bg/60 border border-dark-border/80 rounded-2xl p-4 flex flex-col space-y-4 shadow-lg h-full">
      
      {/* Top Professional Overlay Data Bar */}
      <div className="flex flex-wrap items-center gap-4 text-3xs font-mono border-b border-dark-border/40 pb-3 select-none">
        <span className="text-dark-textSecondary font-bold uppercase">
          {activePoint?.time ? formatDate(activePoint.time) : '---'}
        </span>
        <div className="flex gap-3">
          <span>A: <strong className={isUp ? 'text-brand-success' : 'text-brand-danger'}>R$ {oVal.toFixed(2)}</strong></span>
          <span>M: <strong className="text-dark-textPrimary">R$ {hVal.toFixed(2)}</strong></span>
          <span>Mín: <strong className="text-dark-textPrimary">R$ {lVal.toFixed(2)}</strong></span>
          <span>F: <strong className={isUp ? 'text-brand-success' : 'text-brand-danger'}>R$ {cVal.toFixed(2)}</strong></span>
          <span>Var: <strong className={changePercent >= 0 ? 'text-brand-success' : 'text-brand-danger'}>{changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%</strong></span>
          <span>Vol: <strong className="text-dark-textPrimary">{formatVolume(vVal)}</strong></span>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full min-h-[420px]"
        style={{ position: 'relative' }}
      />

    </div>
  );
};
