"use client";

const REGIONS = [
  "畿内",
  "東海道",
  "東山道",
  "北陸道",
  "山陰道",
  "山陽道",
  "南海道",
  "西海道",
  "北海道",
];

type RegionFilterProps = {
  selected: string | undefined;
  onSelect: (region: string | undefined) => void;
};

export function RegionFilter({ selected, onSelect }: RegionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(undefined)}
        className={`rounded-full px-3 py-1 text-sm transition-colors ${
          selected === undefined
            ? "bg-[var(--color-navy)] text-white"
            : "bg-[var(--color-navy)]/10 text-[var(--color-navy)] hover:bg-[var(--color-navy)]/20"
        }`}
      >
        すべて
      </button>
      {REGIONS.map((region) => (
        <button
          key={region}
          onClick={() => onSelect(region)}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            selected === region
              ? "bg-[var(--color-navy)] text-white"
              : "bg-[var(--color-navy)]/10 text-[var(--color-navy)] hover:bg-[var(--color-navy)]/20"
          }`}
        >
          {region}
        </button>
      ))}
    </div>
  );
}
