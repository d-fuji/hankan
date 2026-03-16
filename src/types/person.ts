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
  clanId: number;
  clanName: string;
  crestName?: string;
  fatherName?: string;
  fatherId?: number;
  motherName?: string;
  birthOrder?: number;
  birthOrderType?: string;
  isAdopted: boolean;
  adoptedFromClanId?: number;
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

/** 子供の役職情報（優先表示用） */
export type ChildAppointment = {
  roleType: string;
  territoryName?: string;
  generation?: number;
};

/** 子供情報 */
export type PersonChild = {
  id: number;
  name: string;
  birthOrder?: number;
  birthOrderType?: string;
  primaryAppointment?: ChildAppointment;
  totalAppointments: number;
};

/** 血統ツリーノードの役職情報 */
export type LineageAppointment = {
  roleType: string;
  territoryName?: string;
  generation?: number;
};

/** 血統ツリーノード */
export type LineageNode = {
  id: number;
  name: string;
  clanName: string;
  isAdopted: boolean;
  adoptedFromClanName?: string;
  birthOrder?: number;
  birthOrderType?: string;
  primaryAppointment?: LineageAppointment;
  isFocusPerson: boolean;
  children: LineageNode[];
};

/** 血統ツリーAPIレスポンス */
export type LineageResponse = {
  tree: LineageNode;
  focusPersonId: number;
};
