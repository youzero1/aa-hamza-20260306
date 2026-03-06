'use client';

import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'digit' | 'operator' | 'equal' | 'special' | 'clear';
  span2?: boolean;
}

export default function Button({ label, onClick, variant = 'digit', span2 = false }: ButtonProps) {
  return (
    <button
      className={`calc-button ${variant}${span2 ? ' span2' : ''}`}
      onClick={onClick}
      aria-label={label}
    >
      {label}
    </button>
  );
}
