'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${value ?? 'none'} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(null)}
          className={`
            transition-transform duration-100
            ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
            focus:outline-none
          `}
          aria-label={`Rate ${star} out of 5`}
        >
          <Star
            className={`${sizes[size]} transition-colors duration-100 ${
              star <= display
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface RatingDisplayProps {
  value: number | null;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingDisplay({ value, count, size = 'sm' }: RatingDisplayProps) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-slate-400 italic">No ratings yet</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <StarRating value={Math.round(value)} readonly size={size} />
      <span className="text-sm font-semibold text-slate-700">{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
}
