/** 家一覧APIのレスポンス型 */
export type ClanSummary = {
  id: number;
  name: string;
  nameKana: string;
  crestName?: string;
  memberCount: number;
  territoryNames: string[];
};

/** 家詳細APIのレスポンス型 */
export type ClanDetail = {
  id: number;
  name: string;
  nameKana: string;
  nameRomaji: string;
  crestName?: string;
  members: ClanMember[];
  territories: ClanTerritory[];
};

/** 家の所属人物 */
export type ClanMember = {
  id: number;
  name: string;
  roles: string[];
};

/** 家が治めた領地（役職履歴→人物→家から導出） */
export type ClanTerritory = {
  id: number;
  name: string;
  territoryType: string;
};

/** 家の石高推移データポイント */
export type ClanKokudakaPoint = {
  year: number;
  amount: number;
  territoryName: string;
};

/** 家の石高推移APIレスポンス */
export type ClanKokudakaResponse = {
  clanId: number;
  clanName: string;
  data: ClanKokudakaPoint[];
};
