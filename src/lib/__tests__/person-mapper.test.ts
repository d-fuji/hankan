import { describe, it, expect } from "vitest";
import { toPersonSummary, toPersonDetail } from "@/lib/person-mapper";
import type { PersonWithRelations, PersonDetailRow } from "@/lib/person-mapper";

describe("toPersonSummary", () => {
  it("DB行をPersonSummary型に変換する", () => {
    const row: PersonWithRelations = {
      id: 1,
      name: "徳川家康",
      nameKana: "とくがわいえやす",
      clan: { name: "徳川" },
      appointments: [
        { roleType: "征夷大将軍" },
        { roleType: "征夷大将軍" },
      ],
    };

    const result = toPersonSummary(row);

    expect(result).toEqual({
      id: 1,
      name: "徳川家康",
      nameKana: "とくがわいえやす",
      clanName: "徳川",
      roles: ["征夷大将軍"],
    });
  });

  it("役職がない場合は空配列", () => {
    const row: PersonWithRelations = {
      id: 2,
      name: "前田利家",
      nameKana: "まえだとしいえ",
      clan: { name: "前田" },
      appointments: [],
    };

    expect(toPersonSummary(row).roles).toEqual([]);
  });
});

describe("toPersonDetail", () => {
  it("DB行をPersonDetail型に変換する", () => {
    const row: PersonDetailRow = {
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
    };

    const result = toPersonDetail(row);

    expect(result.name).toBe("徳川家康");
    expect(result.clanName).toBe("徳川");
    expect(result.crestName).toBe("三つ葉葵");
    expect(result.fatherName).toBeUndefined();
    expect(result.isAdopted).toBe(false);
    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].roleType).toBe("征夷大将軍");
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe("徳川秀忠");
  });

  it("養子の場合にadoptedFromClanNameを設定する", () => {
    const row: PersonDetailRow = {
      id: 5,
      name: "徳川吉宗",
      nameKana: "とくがわよしむね",
      nameRomaji: "Tokugawa Yoshimune",
      imina: "吉宗",
      commonName: "源六",
      clan: { name: "徳川", crestName: "三つ葉葵" },
      father: null,
      motherName: null,
      birthOrder: null,
      birthOrderType: null,
      isAdopted: true,
      adoptedFromClan: { name: "紀伊徳川" },
      appointments: [],
      children: [],
    };

    const result = toPersonDetail(row);

    expect(result.isAdopted).toBe(true);
    expect(result.adoptedFromClanName).toBe("紀伊徳川");
  });
});
