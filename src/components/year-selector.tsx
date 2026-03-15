"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type YearSelectorProps = {
  currentYear: number;
};

const MIN_YEAR = 1603;
const MAX_YEAR = 1868;

export function YearSelector({ currentYear }: YearSelectorProps) {
  const router = useRouter();
  const [year, setYear] = useState(currentYear);

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    setYear(Number(e.target.value));
  }

  function handleSliderCommit() {
    if (year !== currentYear) {
      router.push(`/annual/${year}`);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    if (!Number.isNaN(v) && v >= MIN_YEAR && v <= MAX_YEAR) {
      setYear(v);
      router.push(`/annual/${v}`);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--color-gold)]/20 bg-white p-4 shadow-sm">
      <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]/60">
        年を選択
      </label>
      <div className="flex items-center gap-4">
        <span className="text-xs text-[var(--color-ink)]/40">{MIN_YEAR}</span>
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={year}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="flex-1"
          aria-label="年スライダー"
        />
        <span className="text-xs text-[var(--color-ink)]/40">{MAX_YEAR}</span>
        <input
          type="number"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={year}
          onChange={handleInputChange}
          className="w-20 rounded border border-[var(--color-gold)]/20 px-2 py-1 text-center font-[family-name:var(--font-noto-serif)] text-lg font-bold text-[var(--color-navy)]"
          aria-label="年入力"
        />
        <span className="font-[family-name:var(--font-noto-serif)] text-lg text-[var(--color-ink)]">
          年
        </span>
      </div>
    </div>
  );
}
