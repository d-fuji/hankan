import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

const mockTerritoryCount = vi.fn();
const mockPersonCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    territory: { count: (...args: unknown[]) => mockTerritoryCount(...args) },
    person: { count: (...args: unknown[]) => mockPersonCount(...args) },
  },
}));

describe("GET /api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("領地数と人物数を返す", async () => {
    mockTerritoryCount.mockResolvedValue(13);
    mockPersonCount.mockResolvedValue(42);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      territoryCount: 13,
      personCount: 42,
    });
  });
});
