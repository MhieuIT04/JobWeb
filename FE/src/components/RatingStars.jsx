import React from 'react';

export default function RatingStars({ value = 0, size = 16 }) {
  const full = Math.floor(value || 0);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const star = (cls, key, char) => (
    <span key={key} style={{ fontSize: size }} className={cls}>{char}</span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 align-middle text-yellow-500">
      {Array.from({ length: full }).map((_, i) => star('text-yellow-500', 'f'+i, '★'))}
      {half && star('text-yellow-500', 'h', '☆')}
      {Array.from({ length: empty }).map((_, i) => star('text-gray-300', 'e'+i, '☆'))}
    </span>
  );
}


