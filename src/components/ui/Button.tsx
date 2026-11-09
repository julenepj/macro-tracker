import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'secondary', size = 'md', className = '', style, ...props }: ButtonProps) {
  const styles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 'var(--radius-sm)',
    fontWeight: 500,
    transition: 'opacity 0.15s, background 0.15s',
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '14px 24px' : '10px 18px',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14,
    minHeight: size === 'sm' ? 36 : 44,
    ...(variant === 'primary' && {
      background: 'var(--accent)',
      color: '#000',
    }),
    ...(variant === 'secondary' && {
      background: 'var(--card)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    }),
    ...(variant === 'ghost' && {
      background: 'transparent',
      color: 'var(--muted)',
    }),
    ...(variant === 'danger' && {
      background: 'rgba(239,68,68,0.15)',
      color: 'var(--danger)',
      border: '1px solid rgba(239,68,68,0.3)',
    }),
    ...style,
  };

  return <button style={styles} className={className} {...props} />;
}
