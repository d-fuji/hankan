"use client";

import { useState } from "react";

type TerritorySearchProps = {
  onSearch: (query: string) => void;
};

export function TerritorySearch({ onSearch }: TerritorySearchProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex overflow-hidden rounded-lg border border-[var(--color-navy)]/20 bg-white shadow-sm"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="領地名・藩主名で検索"
        className="flex-1 px-5 py-3.5 text-base outline-none placeholder:text-[var(--color-ink)]/40"
      />
      <button
        type="submit"
        className="bg-[var(--color-navy)] px-6 text-sm font-medium text-white transition-colors hover:bg-[var(--color-navy)]/90"
      >
        検索
      </button>
    </form>
  );
}
