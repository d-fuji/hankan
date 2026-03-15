import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockFindMany = vi.fn();
const mockCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    person: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

function createRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/persons");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe("GET /api/persons", () => {
  beforeEach(() => vi.clearAllMocks());

  it("人物一覧をページネーション付きで返す", async () => {
    mockCount.mockResolvedValue(2);
    mockFindMany.mockResolvedValue([
      {
        id: 1,
        name: "徳川家康",
        nameKana: "とくがわいえやす",
        clan: { name: "徳川" },
        appointments: [{ roleType: "征夷大将軍" }],
      },
      {
        id: 2,
        name: "前田利家",
        nameKana: "まえだとしいえ",
        clan: { name: "前田" },
        appointments: [{ roleType: "藩主" }],
      },
    ]);

    const res = await GET(createRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.data[0].clanName).toBe("徳川");
    expect(json.data[0].roles).toEqual(["征夷大将軍"]);
  });

  it("qパラメータで名前検索する", async () => {
    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue([
      {
        id: 1,
        name: "徳川家康",
        nameKana: "とくがわいえやす",
        clan: { name: "徳川" },
        appointments: [],
      },
    ]);

    await GET(createRequest({ q: "徳川" }));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.OR).toBeDefined();
  });

  it("clanパラメータで家フィルタする", async () => {
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);

    await GET(createRequest({ clan: "徳川" }));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.clan.name).toBe("徳川");
  });
});
