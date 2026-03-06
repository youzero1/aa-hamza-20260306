'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Display from './Display';
import Button from './Button';

interface CalcProps {
  onCalculation: (expression: string, result: string) => void;
}

type Operator = '+' | '-' | '×' | '÷' | null;

interface CalcState {
  display: string;
  expression: string;
  firstOperand: number | null;
  operator: Operator;
  waitingForSecond: boolean;
  isResult: boolean;
  isError: boolean;
}

const initialState: CalcState = {
  display: '0',
  expression: '',
  firstOperand: null,
  operator: null,
  waitingForSecond: false,
  isResult: false,
  isError: false,
};

function evaluate(a: number, b: number, op: Operator): number | string {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      if (b === 0) return 'Error: ÷0';
      return a / b;
    default:
      return b;
  }
}

function formatNumber(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return 'Error';
  // Avoid floating point weirdness
  const str = parseFloat(num.toPrecision(12)).toString();
  return str;
}

export default function Calculator({ onCalculation }: CalcProps) {
  const [state, setState] = useState<CalcState>(initialState);

  const handleDigit = useCallback((digit: string) => {
    setState((prev) => {
      if (prev.isError) return { ...initialState, display: digit === '0' ? '0' : digit };

      if (prev.waitingForSecond) {
        return {
          ...prev,
          display: digit,
          waitingForSecond: false,
          isResult: false,
        };
      }

      if (prev.isResult) {
        return {
          ...initialState,
          display: digit,
        };
      }

      if (prev.display === '0' && digit !== '.') {
        return { ...prev, display: digit };
      }

      if (digit === '.' && prev.display.includes('.')) {
        return prev;
      }

      if (prev.display.replace('-', '').replace('.', '').length >= 15) {
        return prev;
      }

      return { ...prev, display: prev.display + digit };
    });
  }, []);

  const handleOperator = useCallback((op: Operator) => {
    setState((prev) => {
      if (prev.isError) return prev;

      const current = parseFloat(prev.display);

      if (prev.firstOperand !== null && prev.operator && !prev.waitingForSecond) {
        const res = evaluate(prev.firstOperand, current, prev.operator);
        if (typeof res === 'string') {
          return { ...initialState, display: res, isError: true, expression: '' };
        }
        const formatted = formatNumber(res);
        return {
          display: formatted,
          expression: `${formatted} ${op}`,
          firstOperand: res,
          operator: op,
          waitingForSecond: true,
          isResult: false,
          isError: false,
        };
      }

      return {
        ...prev,
        expression: `${prev.display} ${op}`,
        firstOperand: current,
        operator: op,
        waitingForSecond: true,
        isResult: false,
      };
    });
  }, []);

  const handleEquals = useCallback(() => {
    setState((prev) => {
      if (prev.isError) return prev;
      if (prev.firstOperand === null || prev.operator === null) return prev;

      const second = parseFloat(prev.display);
      const expression = `${prev.firstOperand} ${prev.operator} ${second}`;
      const res = evaluate(prev.firstOperand, second, prev.operator);

      if (typeof res === 'string') {
        return { ...initialState, display: res, isError: true, expression: expression };
      }

      const formatted = formatNumber(res);

      // Save to DB via callback
      onCalculation(expression, formatted);

      return {
        display: formatted,
        expression: `${expression} =`,
        firstOperand: null,
        operator: null,
        waitingForSecond: false,
        isResult: true,
        isError: false,
      };
    });
  }, [onCalculation]);

  const handleClear = useCallback(() => {
    setState(initialState);
  }, []);

  const handleBackspace = useCallback(() => {
    setState((prev) => {
      if (prev.isError || prev.isResult || prev.waitingForSecond) return prev;
      if (prev.display.length <= 1 || (prev.display.length === 2 && prev.display.startsWith('-'))) {
        return { ...prev, display: '0' };
      }
      return { ...prev, display: prev.display.slice(0, -1) };
    });
  }, []);

  const handleToggleSign = useCallback(() => {
    setState((prev) => {
      if (prev.isError) return prev;
      if (prev.display === '0') return prev;
      if (prev.display.startsWith('-')) {
        return { ...prev, display: prev.display.slice(1) };
      }
      return { ...prev, display: '-' + prev.display };
    });
  }, []);

  const handlePercent = useCallback(() => {
    setState((prev) => {
      if (prev.isError) return prev;
      const val = parseFloat(prev.display);
      const result = val / 100;
      return { ...prev, display: formatNumber(result), isResult: false };
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === '.') handleDigit('.');
      else if (e.key === '+') handleOperator('+');
      else if (e.key === '-') handleOperator('-');
      else if (e.key === '*') handleOperator('×');
      else if (e.key === '/') { e.preventDefault(); handleOperator('÷'); }
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Escape') handleClear();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === '%') handlePercent();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleDigit, handleOperator, handleEquals, handleClear, handleBackspace, handlePercent]);

  return (
    <div className="calculator">
      <Display
        expression={state.expression}
        value={state.display}
        isError={state.isError}
      />
      <div className="button-grid">
        <Button label="C" onClick={handleClear} variant="clear" />
        <Button label="+/-" onClick={handleToggleSign} variant="special" />
        <Button label="%" onClick={handlePercent} variant="special" />
        <Button label="÷" onClick={() => handleOperator('÷')} variant="operator" />

        <Button label="7" onClick={() => handleDigit('7')} variant="digit" />
        <Button label="8" onClick={() => handleDigit('8')} variant="digit" />
        <Button label="9" onClick={() => handleDigit('9')} variant="digit" />
        <Button label="×" onClick={() => handleOperator('×')} variant="operator" />

        <Button label="4" onClick={() => handleDigit('4')} variant="digit" />
        <Button label="5" onClick={() => handleDigit('5')} variant="digit" />
        <Button label="6" onClick={() => handleDigit('6')} variant="digit" />
        <Button label="-" onClick={() => handleOperator('-')} variant="operator" />

        <Button label="1" onClick={() => handleDigit('1')} variant="digit" />
        <Button label="2" onClick={() => handleDigit('2')} variant="digit" />
        <Button label="3" onClick={() => handleDigit('3')} variant="digit" />
        <Button label="+" onClick={() => handleOperator('+')} variant="operator" />

        <Button label="⌫" onClick={handleBackspace} variant="special" />
        <Button label="0" onClick={() => handleDigit('0')} variant="digit" />
        <Button label="." onClick={() => handleDigit('.')} variant="digit" />
        <Button label="=" onClick={handleEquals} variant="equal" />
      </div>
    </div>
  );
}
