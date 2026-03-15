import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    person: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

function createRequest(id: string) {
  return new NextRequest(`http://localhost:3000/api/persons/${id}`);
}

describe("GET /api/persons/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("人物詳細を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "徳川家康",
      nameKana: "とくがわいえやす",
      nameRomaji: "Tokugawa Ieyasu",
      imina: "家康",
      commonName: "竹千代",
      clan: { name: "徳川", crestName: "三つ葉葵" },
      father: null,
      motherName: null,
      birthOrder: null,
      birthOrderType: null,
      isAdopted: false,
      adoptedFromClan: null,
      appointments: [
        {
          roleType: "征夷大将軍",
          territory: null,
          generation: 1,
          startYear: 1603,
          endYear: 1605,
        },
      ],
      children: [
        { id: 2, name: "徳川秀忠", birthOrder: 3, birthOrderType: "男" },
      ],
    });

    const res = await GET(createRequest("1"), { params: Promise.resolve({ id: "1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.name).toBe("徳川家康");
    expect(json.clanName).toBe("徳川");
    expect(json.appointments).toHaveLength(1);
    expect(json.children).toHaveLength(1);
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
