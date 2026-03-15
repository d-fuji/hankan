/** 領地一覧APIのレスポンス型 */
export type TerritorySummary = {
  id: number;
  name: string;
  nameKana: string;
  territoryType: string;
  provinceName: string;
  modernPrefecture: string;
  kokudaka?: number;
};

/** 領地詳細APIのレスポンス型 */
export type TerritoryDetail = {
  id: number;
  name: string;
  nameKana: string;
  nameRomaji: string;
  territoryType: string;
  provinceName: string;
  region: string;
  modernPrefecture: string;
  modernCity?: string;
  location?: string;
  establishedYear: number;
  abolishedYear?: number;
  lords: LordSummary[];
  kokudakaHistory: KokudakaRecord[];
};

/** 藩主要約 */
export type LordSummary = {
  id: number;
  name: string;
  generation?: number;
  startYear: number;
  endYear?: number;
  clanName: string;
};

/** 石高記録 */
export type KokudakaRecord = {
  year: number;
  amount: number;
  changeType?: string;
  changeDetail?: string;
};

/** 領地検索パラメータ */
export type TerritorySearchParams = {
  q?: string;
  region?: string;
  province?: string;
  page?: number;
  limit?: number;
};

/** ページネーションレスポンス */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
