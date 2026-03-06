'use client';

import React from 'react';

interface DisplayProps {
  expression: string;
  value: string;
  isError?: boolean;
}

export default function Display({ expression, value, isError }: DisplayProps) {
  const len = value.length;
  let sizeClass = '';
  if (len > 14) sizeClass = 'xsmall';
  else if (len > 9) sizeClass = 'small';

  return (
    <div className="display">
      <div className="display-expression">{expression || '\u00A0'}</div>
      <div className={`display-value${sizeClass ? ` ${sizeClass}` : ''}${isError ? ' error-text' : ''}`}>
        {value}
      </div>
    </div>
  );
}
