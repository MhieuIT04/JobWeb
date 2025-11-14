import React, { useEffect, useState } from 'react';

export function Slider({ defaultValue = [0, 50], max = 100, step = 1, onValueChange }) {
  const [minV, setMinV] = useState(defaultValue[0] ?? 0);
  const [maxV, setMaxV] = useState(defaultValue[1] ?? max);

  useEffect(() => {
    if (typeof onValueChange === 'function') onValueChange([minV, maxV]);
  }, [minV, maxV]);

  const clamp = (v) => Math.min(max, Math.max(0, v));

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={minV}
        onChange={(e) => {
          const v = clamp(Number(e.target.value));
          setMinV(Math.min(v, maxV));
        }}
        className="w-28"
      />
      <span className="text-xs text-gray-500">{minV}</span>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={maxV}
        onChange={(e) => {
          const v = clamp(Number(e.target.value));
          setMaxV(Math.max(v, minV));
        }}
        className="w-28"
      />
      <span className="text-xs text-gray-500">{maxV}</span>
    </div>
  );
}

export default Slider;


