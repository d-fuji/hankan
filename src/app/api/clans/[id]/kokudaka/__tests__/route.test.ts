import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockFindUnique = vi.fn();
const mockQueryRaw = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    clan: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    kokudaka: {
      findMany: (...args: unknown[]) => mockQueryRaw(...args),
    },
  },
}));

function createRequest(id: string) {
  return new NextRequest(`http://localhost:3000/api/clans/${id}/kokudaka`);
}

describe("GET /api/clans/[id]/kokudaka", () => {
  beforeEach(() => vi.resetAllMocks());

  it("家の石高推移データを返す", async () => {
    mockFindUnique.mockResolvedValue({ id: 1, name: "前田" });

    mockQueryRaw.mockResolvedValue([
      {
        year: 1600,
        amount: { toNumber: () => 102.5 },
        territory: { name: "加賀藩" },
        appointment: { person: { clanId: 1 } },
      },
      {
        year: 1700,
        amount: { toNumber: () => 102.5 },
        territory: { name: "加賀藩" },
        appointment: { person: { clanId: 1 } },
      },
    ]);

    const res = await GET(createRequest("1"), {
      params: Promise.resolve({ id: "1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.clanId).toBe(1);
    expect(json.clanName).toBe("前田");
    expect(json.data).toHaveLength(2);
    expect(json.data[0].year).toBe(1600);
    expect(json.data[0].amount).toBe(102.5);
    expect(json.data[0].territoryName).toBe("加賀藩");
  });

  it("存在しない家で404を返す", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(createRequest("999"), {
      params: Promise.resolve({ id: "999" }),
    });
    expect(res.status).toBe(404);
  });

  it("不正なIDで400を返す", async () => {
    const res = await GET(createRequest("abc"), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(res.status).toBe(400);
  });

  it("石高データがない家は空配列を返す", async () => {
    mockFindUnique.mockResolvedValue({ id: 2, name: "徳川" });
    mockQueryRaw.mockResolvedValue([]);

    const res = await GET(createRequest("2"), {
      params: Promise.resolve({ id: "2" }),
    });
    const json = await res.json();

    expect(json.data).toHaveLength(0);
  });
});
