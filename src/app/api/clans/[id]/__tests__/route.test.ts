import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    clan: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

function createRequest(id: string) {
  return new NextRequest(`http://localhost:3000/api/clans/${id}`);
}

describe("GET /api/clans/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("家詳細を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "徳川",
      nameKana: "とくがわ",
      nameRomaji: "Tokugawa",
      crestName: "三つ葉葵",
      members: [
        {
          id: 1,
          name: "徳川家康",
          appointments: [{ roleType: "征夷大将軍", generation: 1, territory: null }],
        },
        {
          id: 2,
          name: "徳川秀忠",
          appointments: [{ roleType: "征夷大将軍", generation: 2, territory: null }],
        },
      ],
    });

    const res = await GET(createRequest("1"), {
      params: Promise.resolve({ id: "1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.name).toBe("徳川");
    expect(json.crestName).toBe("三つ葉葵");
    expect(json.members).toHaveLength(2);
    expect(json.members[0].name).toBe("徳川家康");
    expect(json.members[0].primaryAppointment.roleType).toBe("征夷大将軍");
    expect(json.members[0].primaryAppointment.generation).toBe(1);
    expect(json.members[0].totalAppointments).toBe(1);
  });

  it("関連領地を導出して返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: 2,
      name: "前田",
      nameKana: "まえだ",
      nameRomaji: "Maeda",
      crestName: "加賀梅鉢",
      members: [
        {
          id: 3,
          name: "前田利家",
          appointments: [
            {
              roleType: "藩主",
              generation: null,
              territory: { id: 10, name: "加賀藩", territoryType: "藩" },
            },
          ],
        },
        {
          id: 4,
          name: "前田利長",
          appointments: [
            {
              roleType: "藩主",
              generation: null,
              territory: { id: 10, name: "加賀藩", territoryType: "藩" },
            },
          ],
        },
      ],
    });

    const res = await GET(createRequest("2"), {
      params: Promise.resolve({ id: "2" }),
    });
    const json = await res.json();

    expect(json.territories).toHaveLength(1); // 重複排除
    expect(json.territories[0].name).toBe("加賀藩");
  });

  it("存在しないIDで404を返す", async () => {
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
});
