import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
    territory: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

function createRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/annual");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe("GET /api/annual", () => {
  beforeEach(() => vi.clearAllMocks());

  it("yearパラメータが必須", async () => {
    const res = await GET(createRequest());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("yearが数値でない場合400を返す", async () => {
    const res = await GET(createRequest({ year: "abc" }));
    expect(res.status).toBe(400);
  });

  it("yearが範囲外の場合400を返す", async () => {
    const res = await GET(createRequest({ year: "1500" }));
    expect(res.status).toBe(400);
  });

  it("指定年のスナップショットを返す", async () => {
    mockFindFirst.mockResolvedValue({
      person: { id: 1, name: "徳川綱吉" },
      generation: 5,
      startYear: 1680,
      endYear: 1709,
    });

    mockFindMany.mockResolvedValue([
      {
        id: 10,
        name: "加賀藩",
        territoryType: "藩",
        province: { name: "加賀" },
        modernPrefecture: "石川県",
        appointments: [
          {
            person: { id: 20, name: "前田綱紀", clan: { name: "前田" } },
            roleType: "藩主",
            generation: 4,
          },
        ],
        kokudakaHistory: [{ amount: 102.5 }],
      },
    ]);

    const res = await GET(createRequest({ year: "1700" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.year).toBe(1700);
    expect(json.shogun).toEqual({
      id: 1,
      name: "徳川綱吉",
      generation: 5,
      startYear: 1680,
      endYear: 1709,
    });
    expect(json.territories).toHaveLength(1);
    expect(json.territories[0].name).toBe("加賀藩");
    expect(json.territories[0].lord.name).toBe("前田綱紀");
    expect(json.territories[0].kokudaka).toBe(102.5);
  });

  it("将軍が存在しない年はshogunがundefined", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockFindMany.mockResolvedValue([]);

    const res = await GET(createRequest({ year: "1603" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.shogun).toBeUndefined();
  });

  it("typeパラメータで領地種別フィルタする", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockFindMany.mockResolvedValue([]);

    await GET(createRequest({ year: "1700", type: "藩" }));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.territoryType).toBe("藩");
  });
});
