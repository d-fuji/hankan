/** 年代ビューAPIのレスポンス型 */
export type AnnualSnapshot = {
  year: number;
  shogun?: AnnualShogun;
  territories: AnnualTerritory[];
};

/** 指定年の将軍情報 */
export type AnnualShogun = {
  id: number;
  name: string;
  generation?: number;
  startYear: number;
  endYear?: number;
};

/** 指定年の領地情報（藩主/代官+石高付き） */
export type AnnualTerritory = {
  id: number;
  name: string;
  territoryType: string;
  provinceName: string;
  modernPrefecture: string;
  lord?: AnnualLord;
  kokudaka?: number;
};

/** 指定年の領地管理者 */
export type AnnualLord = {
  id: number;
  name: string;
  clanName: string;
  roleType: string;
  generation?: number;
};
