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
const grandfather = {
  id: 1,
  name: "祖父",
  clan: { name: "徳川" },
  fatherId: 99, // 曽祖父がいるが遡らない
  isAdopted: false,
  adoptedFromClan: null,
};

const father = {
  id: 2,
  name: "父",
  clan: { name: "徳川" },
  fatherId: 1,
  isAdopted: false,
  adoptedFromClan: null,
  birthOrder: 1,
  birthOrderType: "男",
};

const focusPerson = {
  id: 3,
  name: "本人",
  clan: { name: "徳川" },
  fatherId: 2,
  isAdopted: false,
  adoptedFromClan: null,
  birthOrder: 3,
  birthOrderType: "男",
};

const child = {
  id: 4,
  name: "子",
  clan: { name: "徳川" },
  fatherId: 3,
  isAdopted: false,
  adoptedFromClan: null,
};

const grandchild = {
  id: 5,
  name: "孫",
  clan: { name: "徳川" },
  fatherId: 4,
  isAdopted: false,
  adoptedFromClan: null,
};

const adoptedPerson = {
  id: 10,
  name: "養子",
  clan: { name: "徳川" },
  fatherId: 20,
  isAdopted: true,
  adoptedFromClan: { name: "紀州徳川" },
};

const adoptedFather = {
  id: 20,
  name: "養父",
  clan: { name: "紀州徳川" },
  fatherId: null,
  isAdopted: false,
  adoptedFromClan: null,
};

describe("GET /api/persons/[id]/lineage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("祖父→父→本人→子→孫の5世代を返す", async () => {
    mockFindUnique
      .mockResolvedValueOnce(focusPerson) // 対象人物
      .mockResolvedValueOnce(father) // 1世代上: 父
      .mockResolvedValueOnce(grandfather); // 2世代上: 祖父（ここで止まる）

    // maxDepth = 2(ancestors) + 2 = 4。depth 4 では展開しないので4回のfindMany
    mockFindMany
      .mockResolvedValueOnce([father]) // depth0: 祖父の子
      .mockResolvedValueOnce([focusPerson]) // depth1: 父の子
      .mockResolvedValueOnce([child]) // depth2: 本人の子
      .mockResolvedValueOnce([grandchild]); // depth3: 子の子（孫）
    // depth4: 孫は展開されない（4 < 4 = false）

    const res = await GET(createRequest("3"), {
      params: Promise.resolve({ id: "3" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.focusPersonId).toBe(3);
    // ルートは祖父（曽祖父には遡らない）
    expect(json.tree.name).toBe("祖父");
    // 祖父→父→本人→子→孫
    expect(json.tree.children[0].name).toBe("父");
    expect(json.tree.children[0].children[0].name).toBe("本人");
    expect(json.tree.children[0].children[0].isFocusPerson).toBe(true);
    // 出生順が含まれる
    expect(json.tree.children[0].birthOrder).toBe(1);
    expect(json.tree.children[0].birthOrderType).toBe("男");
    expect(json.tree.children[0].children[0].birthOrder).toBe(3);
    expect(json.tree.children[0].children[0].birthOrderType).toBe("男");
    expect(json.tree.children[0].children[0].children[0].name).toBe("子");
    expect(json.tree.children[0].children[0].children[0].children[0].name).toBe("孫");
  });

  it("孫より下は表示しない", async () => {
    // 父なしなので本人がルート、ancestorDepth=0、maxDepth=2
    mockFindUnique.mockResolvedValueOnce({ ...focusPerson, fatherId: null });

    // maxDepth=2: depth0(本人)展開, depth1(子)展開, depth2(孫)展開しない
    mockFindMany
      .mockResolvedValueOnce([child]) // depth0: 本人の子
      .mockResolvedValueOnce([grandchild]); // depth1: 子の子（孫）
    // depth2: 孫は展開されない（maxDepth=2）

    const res = await GET(createRequest("3"), {
      params: Promise.resolve({ id: "3" }),
    });
    const json = await res.json();

    const grandchildNode = json.tree.children[0].children[0];
    expect(grandchildNode.name).toBe("孫");
    expect(grandchildNode.children).toHaveLength(0);
  });

  it("養子関係を正しくマーキングする", async () => {
    // adoptedPerson(fatherId:20) → adoptedFather(fatherId:null)
    // ancestorDepth=1, maxDepth=3
    mockFindUnique
      .mockResolvedValueOnce(adoptedPerson) // 対象人物
      .mockResolvedValueOnce(adoptedFather); // 1世代上: 養父（父なしで止まる）

    mockFindMany
      .mockResolvedValueOnce([adoptedPerson]) // depth0: 養父の子
      .mockResolvedValueOnce([]); // depth1: 養子の子

    const res = await GET(createRequest("10"), {
      params: Promise.resolve({ id: "10" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    const node = json.tree.children[0];
    expect(node.isAdopted).toBe(true);
    expect(node.adoptedFromClanName).toBe("紀州徳川");
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

  it("父なしの人物自身がルートになる", async () => {
    mockFindUnique.mockResolvedValueOnce({ ...focusPerson, fatherId: null });

    mockFindMany.mockResolvedValueOnce([child]).mockResolvedValueOnce([]);

    const res = await GET(createRequest("3"), {
      params: Promise.resolve({ id: "3" }),
    });
    const json = await res.json();

    expect(json.tree.name).toBe("本人");
    expect(json.tree.isFocusPerson).toBe(true);
  });
});
