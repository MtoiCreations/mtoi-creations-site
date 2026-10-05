"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center rounded-[4px] border border-encre/25 bg-surface">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className="p-3 text-encre transition-colors hover:text-framboise disabled:cursor-not-allowed disabled:text-encre/40"
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="w-12 text-center font-titre text-lg text-encre">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className="p-3 text-encre transition-colors hover:text-framboise disabled:cursor-not-allowed disabled:text-encre/40"
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
