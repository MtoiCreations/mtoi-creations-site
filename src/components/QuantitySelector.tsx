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
    <div className="flex items-center border border-cream-dark rounded-button">
      <button
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className="p-3 text-primary hover:text-secondary disabled:text-text-light disabled:cursor-not-allowed transition-colors"
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="w-12 text-center font-display text-lg text-primary">
        {value}
      </span>

      <button
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className="p-3 text-primary hover:text-secondary disabled:text-text-light disabled:cursor-not-allowed transition-colors"
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
