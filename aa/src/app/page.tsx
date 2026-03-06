'use client';

import { useEffect, useState, useCallback } from 'react';
import Calculator from '@/components/Calculator';

interface CalculationRecord {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

export default function Home() {
  const [history, setHistory] = useState<CalculationRecord[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/calculations');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCalculation = async (expression: string, result: string) => {
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression, result }),
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (e) {
      console.error('Failed to save calculation', e);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="app-container">
      <h1 className="app-title">{process.env.NEXT_PUBLIC_APP_NAME || 'aa'}</h1>
      <div className="main-content">
        <Calculator onCalculation={handleCalculation} />
        <div className="history-panel">
          <div className="history-title">
            <span>History</span>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <p className="history-empty">No calculations yet</p>
            ) : (
              [...history].reverse().map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-expression">{item.expression}</div>
                  <div className="history-result">= {item.result}</div>
                  <div className="history-time">{formatTime(item.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
