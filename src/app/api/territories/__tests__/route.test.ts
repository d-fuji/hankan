import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

// Prisma モック
const mockFindMany = vi.fn();
const mockCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    territory: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

function createRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/territories");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe("GET /api/territories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("領地一覧をページネーション付きで返す", async () => {
    mockCount.mockResolvedValue(2);
    mockFindMany.mockResolvedValue([
      {
        id: 1,
        name: "加賀藩",
        nameKana: "かがはん",
        nameRomaji: "Kaga-han",
        territoryType: "藩",
        modernPrefecture: "石川県",
        province: { name: "加賀" },
        kokudakaHistory: [{ amount: 102.5, year: 1600 }],
      },
      {
        id: 2,
        name: "薩摩藩",
        nameKana: "さつまはん",
        nameRomaji: "Satsuma-han",
        territoryType: "藩",
        modernPrefecture: "鹿児島県",
        province: { name: "薩摩" },
        kokudakaHistory: [{ amount: 72.95, year: 1601 }],
      },
    ]);

    const res = await GET(createRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.total).toBe(2);
    expect(json.page).toBe(1);
    expect(json.limit).toBe(20);
    expect(json.data[0].name).toBe("加賀藩");
    expect(json.data[0].kokudaka).toBe(102.5);
  });

  it("qパラメータでテキスト検索する", async () => {
    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue([
      {
        id: 1,
        name: "加賀藩",
        nameKana: "かがはん",
        nameRomaji: "Kaga-han",
        territoryType: "藩",
        modernPrefecture: "石川県",
        province: { name: "加賀" },
        kokudakaHistory: [{ amount: 102.5, year: 1600 }],
      },
    ]);

    const res = await GET(createRequest({ q: "加賀" }));
    const json = await res.json();

    expect(json.data).toHaveLength(1);
    // whereにOR条件が含まれることを確認
    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.OR).toBeDefined();
  });

  it("regionパラメータで地域フィルタする", async () => {
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);

    await GET(createRequest({ region: "北陸道" }));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.province.region).toBe("北陸道");
  });

  it("pageとlimitパラメータでページネーションする", async () => {
    mockCount.mockResolvedValue(30);
    mockFindMany.mockResolvedValue([]);

    const res = await GET(createRequest({ page: "2", limit: "10" }));
    const json = await res.json();

    expect(json.page).toBe(2);
    expect(json.limit).toBe(10);
    expect(json.totalPages).toBe(3);
    const args = mockFindMany.mock.calls[0][0];
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
  });
});
