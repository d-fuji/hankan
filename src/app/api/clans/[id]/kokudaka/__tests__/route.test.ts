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
    mockAppointmentFindMany.mockResolvedValue([
      { territoryId: 10, startYear: 1583, endYear: 1871 },
    ]);
    mockKokudakaFindMany.mockResolvedValue([
      { year: 1600, amount: { toNumber: () => 102.5 }, territoryId: 10, territory: { name: "加賀藩" } },
      { year: 1700, amount: { toNumber: () => 102.5 }, territoryId: 10, territory: { name: "加賀藩" } },
    ]);

    const res = await GET(createRequest("1"), {
      params: Promise.resolve({ id: "1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.summary).toHaveLength(2);
    expect(json.summary[0].totalAmount).toBe(102.5);
    expect(json.detail).toHaveLength(2);
  });

  it("他家が治めた時代の石高を除外する", async () => {
    // 久松松平家: 白河藩を1783-1823に治めた（1823年に阿部家へ交代）
    mockClanFindUnique.mockResolvedValue({ id: 5, name: "久松松平" });
    mockAppointmentFindMany.mockResolvedValue([
      { territoryId: 20, startYear: 1783, endYear: 1823 },
    ]);
    mockKokudakaFindMany.mockResolvedValue([
      // 1627年は丹羽家時代 → 除外
      { year: 1627, amount: { toNumber: () => 10.0 }, territoryId: 20, territory: { name: "白河藩" } },
      // 1800年は久松松平家時代 → 含まれる
      { year: 1800, amount: { toNumber: () => 11.0 }, territoryId: 20, territory: { name: "白河藩" } },
      // 1823年は阿部家への交代年 → 除外（endYear未満でフィルタ）
      { year: 1823, amount: { toNumber: () => 11.0 }, territoryId: 20, territory: { name: "白河藩" } },
    ]);

    const res = await GET(createRequest("5"), {
      params: Promise.resolve({ id: "5" }),
    });
    const json = await res.json();

    expect(json.detail).toHaveLength(1);
    expect(json.detail[0].year).toBe(1800);
    expect(json.summary).toHaveLength(1);
  });

  it("複数領地の同年石高を合算する", async () => {
    mockClanFindUnique.mockResolvedValue({ id: 3, name: "松平" });
    mockAppointmentFindMany.mockResolvedValue([
      { territoryId: 20, startYear: 1600, endYear: 1871 },
      { territoryId: 30, startYear: 1600, endYear: 1871 },
    ]);
    mockKokudakaFindMany.mockResolvedValue([
      { year: 1639, amount: { toNumber: () => 6.0 }, territoryId: 20, territory: { name: "川越藩" } },
      { year: 1639, amount: { toNumber: () => 5.0 }, territoryId: 30, territory: { name: "忍藩" } },
    ]);

    const res = await GET(createRequest("3"), {
      params: Promise.resolve({ id: "3" }),
    });
    const json = await res.json();

    expect(json.summary).toHaveLength(1);
    expect(json.summary[0].totalAmount).toBe(11.0);
    expect(json.detail).toHaveLength(2);
  });

  it("存在しない家で404を返す", async () => {
    mockClanFindUnique.mockResolvedValue(null);
    const res = await GET(createRequest("999"), { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });

  it("不正なIDで400を返す", async () => {
    const res = await GET(createRequest("abc"), { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("藩主としての領地がない家は空配列を返す", async () => {
    mockClanFindUnique.mockResolvedValue({ id: 2, name: "徳川" });
    mockAppointmentFindMany.mockResolvedValue([]);
    const res = await GET(createRequest("2"), { params: Promise.resolve({ id: "2" }) });
    const json = await res.json();
    expect(json.summary).toHaveLength(0);
    expect(json.detail).toHaveLength(0);
  });
});
