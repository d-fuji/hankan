import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockFindUnique = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    person: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

function createRequest(id: string) {
  return new NextRequest(`http://localhost:3000/api/persons/${id}/lineage`);
}

// テスト用の人物データ
const ieyasu = {
  id: 1,
  name: "徳川家康",
  clan: { name: "徳川" },
  fatherId: null,
  isAdopted: false,
  adoptedFromClan: null,
};

const hidetada = {
  id: 2,
  name: "徳川秀忠",
  clan: { name: "徳川" },
  fatherId: 1,
  isAdopted: false,
  adoptedFromClan: null,
};

const iemitsu = {
  id: 3,
  name: "徳川家光",
  clan: { name: "徳川" },
  fatherId: 2,
  isAdopted: false,
  adoptedFromClan: null,
};

const yoshimune = {
  id: 4,
  name: "徳川吉宗",
  clan: { name: "徳川" },
  fatherId: 5,
  isAdopted: true,
  adoptedFromClan: { name: "紀州徳川" },
};

const mitsusada = {
  id: 5,
  name: "徳川光貞",
  clan: { name: "紀州徳川" },
  fatherId: null,
  isAdopted: false,
  adoptedFromClan: null,
};

describe("GET /api/persons/[id]/lineage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("3世代の血統ツリーを返す（家康→秀忠→家光）", async () => {
    // findUnique: 対象人物を取得
    mockFindUnique.mockResolvedValue(hidetada);

    // findMany: 先祖の探索（秀忠の父 → 家康、家康の父 → null）
    mockFindUnique
      .mockResolvedValueOnce(hidetada) // 最初の呼び出し: 対象人物
      .mockResolvedValueOnce(ieyasu); // 先祖探索: 家康

    // findMany: ルートからの子孫ツリー構築
    // 家康の子
    mockFindMany
      .mockResolvedValueOnce([hidetada]) // 家康の子供
      .mockResolvedValueOnce([iemitsu]) // 秀忠の子供
      .mockResolvedValueOnce([]); // 家光の子供

    const res = await GET(createRequest("2"), {
      params: Promise.resolve({ id: "2" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.focusPersonId).toBe(2);
    // ルートは家康
    expect(json.tree.name).toBe("徳川家康");
    expect(json.tree.isFocusPerson).toBe(false);
    // 秀忠は家康の子
    expect(json.tree.children).toHaveLength(1);
    expect(json.tree.children[0].name).toBe("徳川秀忠");
    expect(json.tree.children[0].isFocusPerson).toBe(true);
    // 家光は秀忠の子
    expect(json.tree.children[0].children).toHaveLength(1);
    expect(json.tree.children[0].children[0].name).toBe("徳川家光");
  });

  it("養子関係を正しくマーキングする", async () => {
    mockFindUnique
      .mockResolvedValueOnce(yoshimune) // 対象人物
      .mockResolvedValueOnce(mitsusada); // 父: 光貞

    mockFindMany
      .mockResolvedValueOnce([yoshimune]) // 光貞の子供
      .mockResolvedValueOnce([]); // 吉宗の子供

    const res = await GET(createRequest("4"), {
      params: Promise.resolve({ id: "4" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    // 吉宗は養子
    const yoshimuneNode = json.tree.children[0];
    expect(yoshimuneNode.isAdopted).toBe(true);
    expect(yoshimuneNode.adoptedFromClanName).toBe("紀州徳川");
  });

  it("存在しない人物で404を返す", async () => {
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

  it("ルート人物（父なし）自身を指定した場合、本人がルートになる", async () => {
    mockFindUnique.mockResolvedValueOnce(ieyasu); // 対象人物（父なし）

    mockFindMany
      .mockResolvedValueOnce([hidetada]) // 家康の子供
      .mockResolvedValueOnce([]); // 秀忠の子供

    const res = await GET(createRequest("1"), {
      params: Promise.resolve({ id: "1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.tree.name).toBe("徳川家康");
    expect(json.tree.isFocusPerson).toBe(true);
    expect(json.tree.children).toHaveLength(1);
  });
});
