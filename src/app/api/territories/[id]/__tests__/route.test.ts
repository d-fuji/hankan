import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    territory: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

function createRequest(id: string) {
  return new NextRequest(`http://localhost:3000/api/territories/${id}`);
}

describe("GET /api/territories/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("領地詳細を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "加賀藩",
      nameKana: "かがはん",
      nameRomaji: "Kaga-han",
      territoryType: "藩",
      modernPrefecture: "石川県",
      modernCity: "金沢市",
      location: "金沢城",
      establishedYear: 1583,
      abolishedYear: null,
      province: { name: "加賀", region: "北陸道" },
      appointments: [
        {
          person: { id: 10, name: "前田利家", clan: { name: "前田" } },
          generation: 1,
          startYear: 1583,
          endYear: 1599,
        },
      ],
      kokudakaHistory: [
        {
          year: 1600,
          amount: 102.5,
          changeType: "立藩",
          changeDetail: "加賀・能登・越中三カ国",
        },
      ],
    });

    const res = await GET(createRequest("1"), { params: Promise.resolve({ id: "1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.name).toBe("加賀藩");
    expect(json.provinceName).toBe("加賀");
    expect(json.region).toBe("北陸道");
    expect(json.lords).toHaveLength(1);
    expect(json.lords[0].clanName).toBe("前田");
  });

  it("存在しないIDで404を返す", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(createRequest("999"), { params: Promise.resolve({ id: "999" }) });

    expect(res.status).toBe(404);
  });

  it("不正なIDで400を返す", async () => {
    const res = await GET(createRequest("abc"), { params: Promise.resolve({ id: "abc" }) });

    expect(res.status).toBe(400);
  });
});
