import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockClanFindUnique = vi.fn();
const mockAppointmentFindMany = vi.fn();
const mockKokudakaFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    clan: {
      findUnique: (...args: unknown[]) => mockClanFindUnique(...args),
    },
    appointment: {
      findMany: (...args: unknown[]) => mockAppointmentFindMany(...args),
    },
    kokudaka: {
      findMany: (...args: unknown[]) => mockKokudakaFindMany(...args),
    },
  },
}));

function createRequest(id: string) {
  return new NextRequest(`http://localhost:3000/api/clans/${id}/kokudaka`);
}

describe("GET /api/clans/[id]/kokudaka", () => {
  beforeEach(() => vi.resetAllMocks());

  it("家が治めた領地の石高推移データを返す", async () => {
    mockClanFindUnique.mockResolvedValue({ id: 1, name: "前田" });
    mockAppointmentFindMany.mockResolvedValue([{ territoryId: 10 }]);
    mockKokudakaFindMany.mockResolvedValue([
      {
        year: 1600,
        amount: { toNumber: () => 102.5 },
        territory: { name: "加賀藩" },
      },
      {
        year: 1700,
        amount: { toNumber: () => 102.5 },
        territory: { name: "加賀藩" },
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
    mockClanFindUnique.mockResolvedValue(null);

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

  it("藩主としての領地がない家は空配列を返す", async () => {
    mockClanFindUnique.mockResolvedValue({ id: 2, name: "徳川" });
    mockAppointmentFindMany.mockResolvedValue([]);

    const res = await GET(createRequest("2"), {
      params: Promise.resolve({ id: "2" }),
    });
    const json = await res.json();

    expect(json.data).toHaveLength(0);
  });
});
