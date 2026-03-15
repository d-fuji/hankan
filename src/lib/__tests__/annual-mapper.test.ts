import { describe, it, expect } from "vitest";
import { toAnnualSnapshot } from "../annual-mapper";
import type { AnnualSnapshotRow } from "../annual-mapper";

describe("toAnnualSnapshot", () => {
  it("将軍と領地情報を正しくマッピングする", () => {
    const row: AnnualSnapshotRow = {
      year: 1700,
      shogun: {
        person: { id: 1, name: "徳川綱吉" },
        generation: 5,
        startYear: 1680,
        endYear: 1709,
      },
      territories: [
        {
          id: 10,
          name: "加賀藩",
          territoryType: "藩",
          province: { name: "加賀" },
          modernPrefecture: "石川県",
          appointment: {
            person: { id: 20, name: "前田綱紀", clan: { name: "前田" } },
            roleType: "藩主",
            generation: 4,
          },
          kokudaka: { amount: 102.5 },
        },
      ],
    };

    const result = toAnnualSnapshot(row);

    expect(result.year).toBe(1700);
    expect(result.shogun).toEqual({
      id: 1,
      name: "徳川綱吉",
      generation: 5,
      startYear: 1680,
      endYear: 1709,
    });
    expect(result.territories).toHaveLength(1);
    expect(result.territories[0]).toEqual({
      id: 10,
      name: "加賀藩",
      territoryType: "藩",
      provinceName: "加賀",
      modernPrefecture: "石川県",
      lord: {
        id: 20,
        name: "前田綱紀",
        clanName: "前田",
        roleType: "藩主",
        generation: 4,
      },
      kokudaka: 102.5,
    });
  });

  it("将軍が存在しない年を処理する", () => {
    const row: AnnualSnapshotRow = {
      year: 1600,
      shogun: null,
      territories: [],
    };

    const result = toAnnualSnapshot(row);

    expect(result.year).toBe(1600);
    expect(result.shogun).toBeUndefined();
    expect(result.territories).toEqual([]);
  });

  it("藩主が空席の領地を処理する", () => {
    const row: AnnualSnapshotRow = {
      year: 1700,
      shogun: null,
      territories: [
        {
          id: 10,
          name: "大坂",
          territoryType: "天領",
          province: { name: "摂津" },
          modernPrefecture: "大阪府",
          appointment: null,
          kokudaka: null,
        },
      ],
    };

    const result = toAnnualSnapshot(row);

    expect(result.territories[0].lord).toBeUndefined();
    expect(result.territories[0].kokudaka).toBeUndefined();
  });

  it("石高のDecimal型をnumberに変換する", () => {
    // Prisma DecimalはtoString()を持つオブジェクト。Number()で変換可能
    const decimalLike = Object.assign(Object.create(null), {
      toString: () => "102.50",
      valueOf: () => 102.5,
    });
    const row: AnnualSnapshotRow = {
      year: 1700,
      shogun: null,
      territories: [
        {
          id: 10,
          name: "加賀藩",
          territoryType: "藩",
          province: { name: "加賀" },
          modernPrefecture: "石川県",
          appointment: null,
          kokudaka: { amount: decimalLike as unknown as number },
        },
      ],
    };

    const result = toAnnualSnapshot(row);

    expect(result.territories[0].kokudaka).toBe(102.5);
  });
});
