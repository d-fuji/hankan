/** 人物一覧APIのレスポンス型 */
export type PersonSummary = {
  id: number;
  name: string;
  nameKana: string;
  clanName: string;
  roles: string[];
};

/** 人物詳細APIのレスポンス型 */
export type PersonDetail = {
  id: number;
  name: string;
  nameKana: string;
  nameRomaji: string;
  imina?: string;
  commonName?: string;
  clanName: string;
  crestName?: string;
  fatherName?: string;
  fatherId?: number;
  motherName?: string;
  birthOrder?: number;
  birthOrderType?: string;
  isAdopted: boolean;
  adoptedFromClanName?: string;
  appointments: PersonAppointment[];
  children: PersonChild[];
};

/** 人物の役職履歴 */
export type PersonAppointment = {
  roleType: string;
  territoryName?: string;
  territoryId?: number;
  generation?: number;
  startYear: number;
  endYear?: number;
};

/** 子供情報 */
export type PersonChild = {
  id: number;
  name: string;
  birthOrder?: number;
  birthOrderType?: string;
};
