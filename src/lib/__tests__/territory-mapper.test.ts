import { describe, it, expect } from "vitest";
import { toTerritorySummary, toTerritoryDetail } from "@/lib/territory-mapper";
import type { TerritoryWithRelations, TerritoryDetailRow } from "@/lib/territory-mapper";

describe("toTerritorySummary", () => {
  it("DB行をTerritorySummary型に変換する", () => {
    const row: TerritoryWithRelations = {
      id: 1,
      name: "加賀藩",
      nameKana: "かがはん",
      nameRomaji: "Kaga-han",
      territoryType: "藩",
      modernPrefecture: "石川県",
      province: { name: "加賀" },
      kokudakaHistory: [{ amount: 102.5 }],
    };

    const result = toTerritorySummary(row);

    expect(result).toEqual({
      id: 1,
      name: "加賀藩",
      nameKana: "かがはん",
      territoryType: "藩",
      provinceName: "加賀",
      modernPrefecture: "石川県",
      kokudaka: 102.5,
    });
  });

  it("石高履歴がない場合はkokudakaをundefinedにする", () => {
    const row: TerritoryWithRelations = {
      id: 2,
      name: "天領",
      nameKana: "てんりょう",
      nameRomaji: "Tenryo",
      territoryType: "天領",
      modernPrefecture: "東京都",
      province: { name: "武蔵" },
      kokudakaHistory: [],
    };

    const result = toTerritorySummary(row);

    expect(result.kokudaka).toBeUndefined();
  });

  it("複数の石高履歴がある場合は最新（最大year）のamountを使う", () => {
    const row: TerritoryWithRelations = {
      id: 3,
      name: "水戸藩",
      nameKana: "みとはん",
      nameRomaji: "Mito-han",
      territoryType: "藩",
      modernPrefecture: "茨城県",
      province: { name: "常陸" },
      kokudakaHistory: [
        { amount: 25.0, year: 1609 },
        { amount: 35.0, year: 1701 },
      ],
    };

    const result = toTerritorySummary(row);

    expect(result.kokudaka).toBe(35.0);
  });
});

describe("toTerritoryDetail", () => {
  it("DB行をTerritoryDetail型に変換する", () => {
    const row: TerritoryDetailRow = {
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
    };

    const result = toTerritoryDetail(row);

    expect(result.id).toBe(1);
    expect(result.name).toBe("加賀藩");
    expect(result.provinceName).toBe("加賀");
    expect(result.region).toBe("北陸道");
    expect(result.abolishedYear).toBeUndefined();
    expect(result.lords).toHaveLength(1);
    expect(result.lords[0]).toEqual({
      id: 10,
      name: "前田利家",
      generation: 1,
      startYear: 1583,
      endYear: 1599,
      clanName: "前田",
    });
    expect(result.kokudakaHistory).toHaveLength(1);
    expect(result.kokudakaHistory[0].amount).toBe(102.5);
  });

  it("nullフィールドをundefinedに変換する", () => {
    const row: TerritoryDetailRow = {
      id: 2,
      name: "仙台藩",
      nameKana: "せんだいはん",
      nameRomaji: "Sendai-han",
      territoryType: "藩",
      modernPrefecture: "宮城県",
      modernCity: null,
      location: null,
      establishedYear: 1601,
      abolishedYear: null,
      province: { name: "陸奥", region: "東山道" },
      appointments: [],
      kokudakaHistory: [],
    };

    const result = toTerritoryDetail(row);

    expect(result.modernCity).toBeUndefined();
    expect(result.location).toBeUndefined();
    expect(result.abolishedYear).toBeUndefined();
  });
});
