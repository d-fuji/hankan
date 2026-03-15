#!/usr/bin/env node
// Temporary script to add 15 new domains to seed data
// Will be deleted after use

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readJson(filename) {
  return JSON.parse(readFileSync(join(__dirname, filename), 'utf8'));
}

function writeJsonOneline(filename, data) {
  // Write in the 1-entity-per-line format matching existing files
  const lines = data.map((item, i) => {
    const json = JSON.stringify(item);
    return '  ' + json;
  });
  const content = '[\n' + lines.join(',\n') + '\n]\n';
  writeFileSync(join(__dirname, filename), content, 'utf8');
}

// Read existing data
const clans = readJson('clans.json');
const territories = readJson('territories.json');
const persons = readJson('persons.json');
const appointments = readJson('appointments.json');
const kokudaka = readJson('kokudaka.json');

// Helper to check duplicates
function hasKey(arr, key) {
  return arr.some(item => item.key === key);
}

// ========================================
// NEW CLANS
// ========================================
const newClans = [
  { key: "clan_toda", name: "戸田", nameKana: "とだ", nameRomaji: "Toda", crestName: "九曜" },
  { key: "clan_okubo", name: "大久保", nameKana: "おおくぼ", nameRomaji: "Okubo", crestName: "上り藤" },
  { key: "clan_toyama_maeda", name: "富山前田", nameKana: "とやままえだ", nameRomaji: "Toyama-Maeda", crestName: "加賀梅鉢" },
  { key: "clan_niwa", name: "丹羽", nameKana: "にわ", nameRomaji: "Niwa", crestName: "丹羽直違" },
  { key: "clan_sanada", name: "真田", nameKana: "さなだ", nameRomaji: "Sanada", crestName: "六文銭" },
  { key: "clan_matsuura", name: "松浦", nameKana: "まつら", nameRomaji: "Matsuura", crestName: "三つ星" },
  { key: "clan_okudaira", name: "奥平", nameKana: "おくだいら", nameRomaji: "Okudaira", crestName: "丸に抱き茗荷" },
  { key: "clan_so", name: "宗", nameKana: "そう", nameRomaji: "So", crestName: "五七桐" },
  { key: "clan_kikkawa", name: "吉川", nameKana: "きっかわ", nameRomaji: "Kikkawa", crestName: "丸に三つ引両" },
];

for (const c of newClans) {
  if (!hasKey(clans, c.key)) {
    clans.push(c);
  }
}

// ========================================
// NEW TERRITORIES
// ========================================
const newTerritories = [
  { key: "territory_kuwana", name: "桑名藩", nameKana: "くわなはん", nameRomaji: "Kuwana-han", territoryType: "藩", provinceKey: "province_ise", modernPrefecture: "三重県", modernCity: "桑名市", location: "桑名城", establishedYear: 1601 },
  { key: "territory_matsumoto", name: "松本藩", nameKana: "まつもとはん", nameRomaji: "Matsumoto-han", territoryType: "藩", provinceKey: "province_shinano", modernPrefecture: "長野県", modernCity: "松本市", location: "松本城", establishedYear: 1600 },
  { key: "territory_akashi", name: "明石藩", nameKana: "あかしはん", nameRomaji: "Akashi-han", territoryType: "藩", provinceKey: "province_harima", modernPrefecture: "兵庫県", modernCity: "明石市", location: "明石城", establishedYear: 1617 },
  { key: "territory_ogaki", name: "大垣藩", nameKana: "おおがきはん", nameRomaji: "Ogaki-han", territoryType: "藩", provinceKey: "province_mino", modernPrefecture: "岐阜県", modernCity: "大垣市", location: "大垣城", establishedYear: 1600 },
  { key: "territory_odawara", name: "小田原藩", nameKana: "おだわらはん", nameRomaji: "Odawara-han", territoryType: "藩", provinceKey: "province_sagami", modernPrefecture: "神奈川県", modernCity: "小田原市", location: "小田原城", establishedYear: 1590 },
  { key: "territory_kawagoe", name: "川越藩", nameKana: "かわごえはん", nameRomaji: "Kawagoe-han", territoryType: "藩", provinceKey: "province_musashi", modernPrefecture: "埼玉県", modernCity: "川越市", location: "川越城", establishedYear: 1590 },
  { key: "territory_fukuyama", name: "福山藩", nameKana: "ふくやまはん", nameRomaji: "Fukuyama-han", territoryType: "藩", provinceKey: "province_bingo", modernPrefecture: "広島県", modernCity: "福山市", location: "福山城", establishedYear: 1619 },
  { key: "territory_toyama", name: "富山藩", nameKana: "とやまはん", nameRomaji: "Toyama-han", territoryType: "藩", provinceKey: "province_etchu", modernPrefecture: "富山県", modernCity: "富山市", location: "富山城", establishedYear: 1639 },
  { key: "territory_nihonmatsu", name: "二本松藩", nameKana: "にほんまつはん", nameRomaji: "Nihonmatsu-han", territoryType: "藩", provinceKey: "province_mutsu", modernPrefecture: "福島県", modernCity: "二本松市", location: "二本松城", establishedYear: 1643 },
  { key: "territory_shirakawa", name: "白河藩", nameKana: "しらかわはん", nameRomaji: "Shirakawa-han", territoryType: "藩", provinceKey: "province_mutsu", modernPrefecture: "福島県", modernCity: "白河市", location: "白河城", establishedYear: 1627 },
  { key: "territory_matsushiro", name: "松代藩", nameKana: "まつしろはん", nameRomaji: "Matsushiro-han", territoryType: "藩", provinceKey: "province_shinano", modernPrefecture: "長野県", modernCity: "長野市", location: "松代城", establishedYear: 1600 },
  { key: "territory_hirado", name: "平戸藩", nameKana: "ひらどはん", nameRomaji: "Hirado-han", territoryType: "藩", provinceKey: "province_hizen", modernPrefecture: "長崎県", modernCity: "平戸市", location: "平戸城", establishedYear: 1599 },
  { key: "territory_nakatsu", name: "中津藩", nameKana: "なかつはん", nameRomaji: "Nakatsu-han", territoryType: "藩", provinceKey: "province_buzen", modernPrefecture: "大分県", modernCity: "中津市", location: "中津城", establishedYear: 1600 },
  { key: "territory_tsushima", name: "対馬藩", nameKana: "つしまはん", nameRomaji: "Tsushima-han", territoryType: "藩", provinceKey: "province_tsushima", modernPrefecture: "長崎県", modernCity: "対馬市", location: "金石城", establishedYear: 1587 },
  { key: "territory_iwakuni", name: "岩国藩", nameKana: "いわくにはん", nameRomaji: "Iwakuni-han", territoryType: "藩", provinceKey: "province_suo", modernPrefecture: "山口県", modernCity: "岩国市", location: "岩国城", establishedYear: 1600 },
];

for (const t of newTerritories) {
  if (!hasKey(territories, t.key)) {
    territories.push(t);
  }
}

// ========================================
// NEW PERSONS - organized by domain
// Parents MUST come before children
// ========================================
const newPersons = [
  // ======== 1. 桑名藩 (Kuwana) - 久松松平家 (最終的な藩主家) ========
  // 桑名藩は藩主家が何度も変わるが、最終的な久松松平家を中心に
  // 本多忠勝は既存 (person_honda_tadakatsu)
  // 初代: 本多忠勝 → 既存
  // 2代: 本多忠政 → 既存 (person_honda_tadamasa)
  // 以降は松平(久松)家が最終藩主家
  // 松平定綱系（桑名久松松平）
  { key: "person_matsudaira_sadatsuna_kuwana", name: "松平定綱", nameKana: "まつだいらさだつな", nameRomaji: "Matsudaira Sadatsuna", imina: "定綱", clanKey: "clan_hisamatsu_matsudaira" },
  { key: "person_matsudaira_sadayoshi_kuwana", name: "松平定良", nameKana: "まつだいらさだよし", nameRomaji: "Matsudaira Sadayoshi", imina: "定良", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_matsudaira_sadatsuna_kuwana", birthOrder: 4, birthOrderType: "男" },
  { key: "person_matsudaira_sadashige_kuwana", name: "松平定重", nameKana: "まつだいらさだしげ", nameRomaji: "Matsudaira Sadashige", imina: "定重", clanKey: "clan_hisamatsu_matsudaira" },
  { key: "person_matsudaira_sadanao_kuwana", name: "松平定逵", nameKana: "まつだいらさだなお", nameRomaji: "Matsudaira Sadanao", imina: "定逵", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_matsudaira_sadashige_kuwana" },
  { key: "person_matsudaira_sadaaki_kuwana", name: "松平定章", nameKana: "まつだいらさだあき", nameRomaji: "Matsudaira Sadaaki", imina: "定章", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_matsudaira_sadanao_kuwana" },
  { key: "person_matsudaira_sadanaga_kuwana", name: "松平定永", nameKana: "まつだいらさだなが", nameRomaji: "Matsudaira Sadanaga", imina: "定永", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_matsudaira_sadaaki_kuwana" },
  { key: "person_matsudaira_sadakuni_kuwana", name: "松平定和", nameKana: "まつだいらさだくに", nameRomaji: "Matsudaira Sadakuni", imina: "定和", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_matsudaira_sadanaga_kuwana" },
  { key: "person_matsudaira_sadamichi_kuwana", name: "松平定通", nameKana: "まつだいらさだみち", nameRomaji: "Matsudaira Sadamichi", imina: "定通", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_matsudaira_sadanaga_kuwana" },
  { key: "person_matsudaira_sadakata_kuwana", name: "松平定猷", nameKana: "まつだいらさだかた", nameRomaji: "Matsudaira Sadakata", imina: "定猷", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_matsudaira_sadamichi_kuwana" },
  { key: "person_matsudaira_sadatoshi_kuwana", name: "松平定敬", nameKana: "まつだいらさだとし", nameRomaji: "Matsudaira Sadatoshi", imina: "定敬", clanKey: "clan_hisamatsu_matsudaira", isAdopted: true },

  // ======== 2. 松本藩 (Matsumoto) - 戸田家(最終藩主家) ========
  // 初期は石川家→小笠原家→戸田家→松平家→堀田家→水野家→戸田家（最終）
  // 最終的な戸田松平家（水野氏の後の戸田家）
  { key: "person_toda_yasunaga", name: "戸田康長", nameKana: "とだやすなが", nameRomaji: "Toda Yasunaga", imina: "康長", clanKey: "clan_toda" },
  { key: "person_toda_yasumitsu", name: "戸田康光", nameKana: "とだやすみつ", nameRomaji: "Toda Yasumitsu", imina: "康光", clanKey: "clan_toda" },
  // 松本戸田家（最終藩主家、1726年以降）
  { key: "person_toda_mitsuzane", name: "戸田光慈", nameKana: "とだみつざね", nameRomaji: "Toda Mitsuzane", imina: "光慈", clanKey: "clan_toda" },
  { key: "person_toda_mitsuhide_matsumoto", name: "戸田光秀", nameKana: "とだみつひで", nameRomaji: "Toda Mitsuhide", imina: "光秀", clanKey: "clan_toda", isAdopted: true },
  { key: "person_toda_mitsutaka_matsumoto", name: "戸田光孝", nameKana: "とだみつたか", nameRomaji: "Toda Mitsutaka", imina: "光孝", clanKey: "clan_toda", fatherKey: "person_toda_mitsuhide_matsumoto" },
  { key: "person_toda_mitsutsura", name: "戸田光悌", nameKana: "とだみつつら", nameRomaji: "Toda Mitsutsura", imina: "光悌", clanKey: "clan_toda", fatherKey: "person_toda_mitsutaka_matsumoto" },
  { key: "person_toda_mitsuyasu_matsumoto", name: "戸田光庸", nameKana: "とだみつやす", nameRomaji: "Toda Mitsuyasu", imina: "光庸", clanKey: "clan_toda", fatherKey: "person_toda_mitsutsura" },
  { key: "person_toda_mitsunobu_matsumoto", name: "戸田光行", nameKana: "とだみつのぶ", nameRomaji: "Toda Mitsunobu", imina: "光行", clanKey: "clan_toda", fatherKey: "person_toda_mitsuyasu_matsumoto" },
  { key: "person_toda_mitsunori_matsumoto", name: "戸田光則", nameKana: "とだみつのり", nameRomaji: "Toda Mitsunori", imina: "光則", clanKey: "clan_toda", fatherKey: "person_toda_mitsunobu_matsumoto" },
  { key: "person_toda_mitsutada_matsumoto", name: "戸田光忠", nameKana: "とだみつただ", nameRomaji: "Toda Mitsutada", imina: "光忠", clanKey: "clan_toda", isAdopted: true },

  // ======== 3. 明石藩 (Akashi) - 松平家(最終藩主家、越前松平) ========
  { key: "person_ogasawara_tadazane_akashi", name: "小笠原忠真", nameKana: "おがさわらただざね", nameRomaji: "Ogasawara Tadazane", imina: "忠真", clanKey: "clan_ogasawara" },
  // 松平(越前)家が最終藩主家
  { key: "person_matsudaira_naomoto_akashi", name: "松平直明", nameKana: "まつだいらなおもと", nameRomaji: "Matsudaira Naomoto", imina: "直明", clanKey: "clan_echizen_matsudaira" },
  { key: "person_matsudaira_naoyoshi_akashi", name: "松平直常", nameKana: "まつだいらなおよし", nameRomaji: "Matsudaira Naoyoshi", imina: "直常", clanKey: "clan_echizen_matsudaira", fatherKey: "person_matsudaira_naomoto_akashi" },
  { key: "person_matsudaira_naojun_akashi", name: "松平直純", nameKana: "まつだいらなおずみ", nameRomaji: "Matsudaira Naojun", imina: "直純", clanKey: "clan_echizen_matsudaira", fatherKey: "person_matsudaira_naoyoshi_akashi" },
  { key: "person_matsudaira_naotoki_akashi", name: "松平直泰", nameKana: "まつだいらなおとき", nameRomaji: "Matsudaira Naotoki", imina: "直泰", clanKey: "clan_echizen_matsudaira", fatherKey: "person_matsudaira_naojun_akashi" },
  { key: "person_matsudaira_naohide_akashi", name: "松平直之", nameKana: "まつだいらなおひで", nameRomaji: "Matsudaira Naohide", imina: "直之", clanKey: "clan_echizen_matsudaira", fatherKey: "person_matsudaira_naotoki_akashi" },
  { key: "person_matsudaira_naoyori_akashi", name: "松平斉韶", nameKana: "まつだいらなおより", nameRomaji: "Matsudaira Naoyori", imina: "斉韶", clanKey: "clan_echizen_matsudaira", fatherKey: "person_matsudaira_naohide_akashi" },
  { key: "person_matsudaira_naohiro_akashi", name: "松平斉宣", nameKana: "まつだいらなおひろ", nameRomaji: "Matsudaira Naohiro Akashi", imina: "斉宣", clanKey: "clan_echizen_matsudaira", isAdopted: true },
  { key: "person_matsudaira_naotsune_akashi", name: "松平慶憲", nameKana: "まつだいらなおつね", nameRomaji: "Matsudaira Naotsune", imina: "慶憲", clanKey: "clan_echizen_matsudaira", fatherKey: "person_matsudaira_naohiro_akashi" },
  { key: "person_matsudaira_naoaki_akashi", name: "松平直致", nameKana: "まつだいらなおあき", nameRomaji: "Matsudaira Naoaki", imina: "直致", clanKey: "clan_echizen_matsudaira", fatherKey: "person_matsudaira_naotsune_akashi" },

  // ======== 4. 大垣藩 (Ogaki) - 戸田家 ========
  { key: "person_toda_ujikane", name: "戸田氏鉄", nameKana: "とだうじかね", nameRomaji: "Toda Ujikane", imina: "氏鉄", clanKey: "clan_toda" },
  { key: "person_toda_ujinori", name: "戸田氏信", nameKana: "とだうじのり", nameRomaji: "Toda Ujinori", imina: "氏信", clanKey: "clan_toda", fatherKey: "person_toda_ujikane" },
  { key: "person_toda_ujinishi", name: "戸田氏西", nameKana: "とだうじにし", nameRomaji: "Toda Ujinishi", imina: "氏西", clanKey: "clan_toda", fatherKey: "person_toda_ujinori" },
  { key: "person_toda_ujisada", name: "戸田氏定", nameKana: "とだうじさだ", nameRomaji: "Toda Ujisada", imina: "氏定", clanKey: "clan_toda", fatherKey: "person_toda_ujinishi" },
  { key: "person_toda_ujitaka", name: "戸田氏孝", nameKana: "とだうじたか", nameRomaji: "Toda Ujitaka", imina: "氏孝", clanKey: "clan_toda", isAdopted: true },
  { key: "person_toda_ujinori2", name: "戸田氏教", nameKana: "とだうじのり", nameRomaji: "Toda Ujinori2", imina: "氏教", clanKey: "clan_toda", fatherKey: "person_toda_ujitaka" },
  { key: "person_toda_ujitake", name: "戸田氏英", nameKana: "とだうじたけ", nameRomaji: "Toda Ujitake", imina: "氏英", clanKey: "clan_toda", fatherKey: "person_toda_ujinori2" },
  { key: "person_toda_ujitsura", name: "戸田氏庸", nameKana: "とだうじつら", nameRomaji: "Toda Ujitsura", imina: "氏庸", clanKey: "clan_toda", fatherKey: "person_toda_ujitake" },
  { key: "person_toda_ujimasa", name: "戸田氏正", nameKana: "とだうじまさ", nameRomaji: "Toda Ujimasa", imina: "氏正", clanKey: "clan_toda", fatherKey: "person_toda_ujitsura" },
  { key: "person_toda_ujiyuki", name: "戸田氏共", nameKana: "とだうじゆき", nameRomaji: "Toda Ujiyuki", imina: "氏共", clanKey: "clan_toda", fatherKey: "person_toda_ujimasa" },

  // ======== 5. 小田原藩 (Odawara) - 大久保家 ========
  { key: "person_okubo_tadayo", name: "大久保忠世", nameKana: "おおくぼただよ", nameRomaji: "Okubo Tadayo", imina: "忠世", clanKey: "clan_okubo" },
  { key: "person_okubo_tadachika", name: "大久保忠隣", nameKana: "おおくぼただちか", nameRomaji: "Okubo Tadachika", imina: "忠隣", clanKey: "clan_okubo", fatherKey: "person_okubo_tadayo" },
  // 大久保家改易後、復帰
  { key: "person_okubo_tadatomo", name: "大久保忠朝", nameKana: "おおくぼただとも", nameRomaji: "Okubo Tadatomo", imina: "忠朝", clanKey: "clan_okubo" },
  { key: "person_okubo_tadamasu", name: "大久保忠増", nameKana: "おおくぼただます", nameRomaji: "Okubo Tadamasu", imina: "忠増", clanKey: "clan_okubo", fatherKey: "person_okubo_tadatomo" },
  { key: "person_okubo_tadazane", name: "大久保忠方", nameKana: "おおくぼただざね", nameRomaji: "Okubo Tadazane", imina: "忠方", clanKey: "clan_okubo", fatherKey: "person_okubo_tadamasu" },
  { key: "person_okubo_tadamasa_odawara", name: "大久保忠興", nameKana: "おおくぼただまさ", nameRomaji: "Okubo Tadamasa Odawara", imina: "忠興", clanKey: "clan_okubo", fatherKey: "person_okubo_tadazane" },
  { key: "person_okubo_tadayuki", name: "大久保忠由", nameKana: "おおくぼただゆき", nameRomaji: "Okubo Tadayuki", imina: "忠由", clanKey: "clan_okubo", isAdopted: true },
  { key: "person_okubo_tadazane2", name: "大久保忠真", nameKana: "おおくぼただざね2", nameRomaji: "Okubo Tadazane2", imina: "忠真", clanKey: "clan_okubo", fatherKey: "person_okubo_tadayuki" },
  { key: "person_okubo_tadayoshi", name: "大久保忠愨", nameKana: "おおくぼただよし", nameRomaji: "Okubo Tadayoshi", imina: "忠愨", clanKey: "clan_okubo", fatherKey: "person_okubo_tadazane2" },
  { key: "person_okubo_tadanori", name: "大久保忠礼", nameKana: "おおくぼただのり", nameRomaji: "Okubo Tadanori", imina: "忠礼", clanKey: "clan_okubo", fatherKey: "person_okubo_tadayoshi" },
  { key: "person_okubo_tadayoshi2", name: "大久保忠良", nameKana: "おおくぼただよし2", nameRomaji: "Okubo Tadayoshi2", imina: "忠良", clanKey: "clan_okubo", fatherKey: "person_okubo_tadanori" },

  // ======== 6. 川越藩 (Kawagoe) - 松平家(最終藩主家) ========
  // 川越藩は藩主が頻繁に交代。最終的な松平(松井)家を中心に
  { key: "person_matsudaira_naritaka_kawagoe", name: "松平斉典", nameKana: "まつだいらなりたか", nameRomaji: "Matsudaira Naritaka", imina: "斉典", clanKey: "clan_matsudaira" },
  { key: "person_matsudaira_noritoshi_kawagoe", name: "松平典則", nameKana: "まつだいらのりとし", nameRomaji: "Matsudaira Noritoshi", imina: "典則", clanKey: "clan_matsudaira", fatherKey: "person_matsudaira_naritaka_kawagoe" },
  { key: "person_matsudaira_naohiro_kawagoe", name: "松平直侯", nameKana: "まつだいらなおひろ", nameRomaji: "Matsudaira Naohiro Kawagoe", imina: "直侯", clanKey: "clan_matsudaira", isAdopted: true },
  { key: "person_matsudaira_narikawa_kawagoe", name: "松平直克", nameKana: "まつだいらなおかつ", nameRomaji: "Matsudaira Naokawa", imina: "直克", clanKey: "clan_matsudaira", isAdopted: true },
  { key: "person_matsudaira_yasutoshi_kawagoe", name: "松平康英", nameKana: "まつだいらやすとし", nameRomaji: "Matsudaira Yasutoshi", imina: "康英", clanKey: "clan_matsudaira", isAdopted: true },
  // Earlier lords: 酒井家、堀田家、松平家等 - key figures
  { key: "person_sakai_shigetada_kawagoe", name: "酒井重忠", nameKana: "さかいしげただ", nameRomaji: "Sakai Shigetada", imina: "重忠", clanKey: "clan_sakai_utanokami" },
  { key: "person_sakai_tadayo_kawagoe", name: "酒井忠利", nameKana: "さかいただよ", nameRomaji: "Sakai Tadayo", imina: "忠利", clanKey: "clan_sakai_utanokami", fatherKey: "person_sakai_shigetada_kawagoe" },
  { key: "person_sakai_tadakatsu_kawagoe", name: "酒井忠勝", nameKana: "さかいただかつ", nameRomaji: "Sakai Tadakatsu Kawagoe", imina: "忠勝", clanKey: "clan_sakai_utanokami", fatherKey: "person_sakai_tadayo_kawagoe" },
  { key: "person_matsudaira_nobutsuna_kawagoe", name: "松平信綱", nameKana: "まつだいらのぶつな", nameRomaji: "Matsudaira Nobutsuna", imina: "信綱", clanKey: "clan_matsudaira" },
  { key: "person_matsudaira_tertsuna_kawagoe", name: "松平輝綱", nameKana: "まつだいらてるつな", nameRomaji: "Matsudaira Terutsuna", imina: "輝綱", clanKey: "clan_matsudaira", fatherKey: "person_matsudaira_nobutsuna_kawagoe" },
  { key: "person_matsudaira_nobutera_kawagoe", name: "松平信輝", nameKana: "まつだいらのぶてる", nameRomaji: "Matsudaira Nobutera", imina: "信輝", clanKey: "clan_matsudaira", fatherKey: "person_matsudaira_tertsuna_kawagoe" },

  // ======== 7. 福山藩 (Fukuyama) - 阿部家(最終藩主家) ========
  // 初代は水野勝成
  { key: "person_mizuno_katsunari", name: "水野勝成", nameKana: "みずのかつなり", nameRomaji: "Mizuno Katsunari", imina: "勝成", clanKey: "clan_matsudaira" },
  // 阿部家（最終藩主家、1710年以降）
  { key: "person_abe_masaharu_fukuyama", name: "阿部正邦", nameKana: "あべまさくに", nameRomaji: "Abe Masakuni", imina: "正邦", clanKey: "clan_abe" },
  { key: "person_abe_masafuku_fukuyama", name: "阿部正福", nameKana: "あべまさふく", nameRomaji: "Abe Masafuku", imina: "正福", clanKey: "clan_abe", fatherKey: "person_abe_masaharu_fukuyama" },
  { key: "person_abe_masatomo_fukuyama", name: "阿部正倫", nameKana: "あべまさとも", nameRomaji: "Abe Masatomo", imina: "正倫", clanKey: "clan_abe", fatherKey: "person_abe_masafuku_fukuyama" },
  { key: "person_abe_masayoshi_fukuyama", name: "阿部正精", nameKana: "あべまさよし", nameRomaji: "Abe Masayoshi Fukuyama", imina: "正精", clanKey: "clan_abe", fatherKey: "person_abe_masatomo_fukuyama" },
  { key: "person_abe_masahiro_fukuyama", name: "阿部正弘", nameKana: "あべまさひろ", nameRomaji: "Abe Masahiro", imina: "正弘", clanKey: "clan_abe", fatherKey: "person_abe_masayoshi_fukuyama" },
  { key: "person_abe_masanori_fukuyama", name: "阿部正教", nameKana: "あべまさのり", nameRomaji: "Abe Masanori Fukuyama", imina: "正教", clanKey: "clan_abe", fatherKey: "person_abe_masayoshi_fukuyama" },
  { key: "person_abe_masataka_fukuyama", name: "阿部正方", nameKana: "あべまさたか", nameRomaji: "Abe Masataka Fukuyama", imina: "正方", clanKey: "clan_abe", fatherKey: "person_abe_masanori_fukuyama" },
  { key: "person_abe_masahisa_fukuyama", name: "阿部正桓", nameKana: "あべまさひさ", nameRomaji: "Abe Masahisa", imina: "正桓", clanKey: "clan_abe", isAdopted: true },

  // ======== 8. 富山藩 (Toyama) - 前田家分家 ========
  { key: "person_maeda_toshinaga_toyama", name: "前田利次", nameKana: "まえだとしつぐ", nameRomaji: "Maeda Toshitsugu", imina: "利次", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_toshitsune" },
  { key: "person_maeda_masatoshi_toyama", name: "前田正甫", nameKana: "まえだまさとし", nameRomaji: "Maeda Masatoshi", imina: "正甫", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_toshinaga_toyama" },
  { key: "person_maeda_toshioki_toyama", name: "前田利興", nameKana: "まえだとしおき", nameRomaji: "Maeda Toshioki", imina: "利興", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_masatoshi_toyama" },
  { key: "person_maeda_toshitaka_toyama", name: "前田利隆", nameKana: "まえだとしたか", nameRomaji: "Maeda Toshitaka Toyama", imina: "利隆", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_masatoshi_toyama" },
  { key: "person_maeda_toshinobu_toyama", name: "前田利幸", nameKana: "まえだとしのぶ", nameRomaji: "Maeda Toshinobu", imina: "利幸", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_toshitaka_toyama" },
  { key: "person_maeda_toshiyasu_toyama", name: "前田利與", nameKana: "まえだとしやす", nameRomaji: "Maeda Toshiyasu", imina: "利與", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_toshinobu_toyama" },
  { key: "person_maeda_toshiatsu_toyama", name: "前田利幹", nameKana: "まえだとしあつ", nameRomaji: "Maeda Toshiatsu", imina: "利幹", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_toshiyasu_toyama" },
  { key: "person_maeda_toshimasa_toyama", name: "前田利保", nameKana: "まえだとしまさ", nameRomaji: "Maeda Toshimasa", imina: "利保", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_toshiatsu_toyama" },
  { key: "person_maeda_toshinari_toyama", name: "前田利友", nameKana: "まえだとしなり", nameRomaji: "Maeda Toshinari", imina: "利友", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_toshimasa_toyama" },
  { key: "person_maeda_toshitomo_toyama", name: "前田利聲", nameKana: "まえだとしとも", nameRomaji: "Maeda Toshitomo", imina: "利聲", clanKey: "clan_toyama_maeda", fatherKey: "person_maeda_toshinari_toyama" },
  { key: "person_maeda_toshiyuki_toyama", name: "前田利行", nameKana: "まえだとしゆき", nameRomaji: "Maeda Toshiyuki", imina: "利行", clanKey: "clan_toyama_maeda", isAdopted: true },
  { key: "person_maeda_toshitake_toyama", name: "前田利同", nameKana: "まえだとしたけ", nameRomaji: "Maeda Toshitake", imina: "利同", clanKey: "clan_toyama_maeda", isAdopted: true },
  { key: "person_maeda_toshihisa_toyama", name: "前田利声", nameKana: "まえだとしひさ", nameRomaji: "Maeda Toshihisa", imina: "利声", clanKey: "clan_toyama_maeda", isAdopted: true },

  // ======== 9. 二本松藩 (Nihonmatsu) - 丹羽家 ========
  { key: "person_niwa_mitsushige", name: "丹羽光重", nameKana: "にわみつしげ", nameRomaji: "Niwa Mitsushige", imina: "光重", clanKey: "clan_niwa" },
  { key: "person_niwa_nagatsugu", name: "丹羽長次", nameKana: "にわながつぐ", nameRomaji: "Niwa Nagatsugu", imina: "長次", clanKey: "clan_niwa", fatherKey: "person_niwa_mitsushige" },
  { key: "person_niwa_naganobu", name: "丹羽長之", nameKana: "にわながのぶ", nameRomaji: "Niwa Naganobu", imina: "長之", clanKey: "clan_niwa", isAdopted: true },
  { key: "person_niwa_hidenaga", name: "丹羽秀延", nameKana: "にわひでなが", nameRomaji: "Niwa Hidenaga", imina: "秀延", clanKey: "clan_niwa", fatherKey: "person_niwa_naganobu" },
  { key: "person_niwa_takahisa", name: "丹羽高寛", nameKana: "にわたかひさ", nameRomaji: "Niwa Takahisa", imina: "高寛", clanKey: "clan_niwa", fatherKey: "person_niwa_hidenaga" },
  { key: "person_niwa_nagahiro", name: "丹羽長祥", nameKana: "にわながひろ", nameRomaji: "Niwa Nagahiro", imina: "長祥", clanKey: "clan_niwa", isAdopted: true },
  { key: "person_niwa_nagatomi", name: "丹羽長富", nameKana: "にわながとみ", nameRomaji: "Niwa Nagatomi", imina: "長富", clanKey: "clan_niwa", fatherKey: "person_niwa_nagahiro" },
  { key: "person_niwa_nagakuni", name: "丹羽長国", nameKana: "にわながくに", nameRomaji: "Niwa Nagakuni", imina: "長国", clanKey: "clan_niwa", fatherKey: "person_niwa_nagatomi" },
  { key: "person_niwa_nagayuki", name: "丹羽長裕", nameKana: "にわながゆき", nameRomaji: "Niwa Nagayuki", imina: "長裕", clanKey: "clan_niwa", fatherKey: "person_niwa_nagakuni" },

  // ======== 10. 白河藩 (Shirakawa) - 阿部家(最終藩主家) ========
  // 最初は丹羽家、のち松平家、阿部家等が入封
  { key: "person_matsudaira_sadanao_shirakawa", name: "松平定綱（白河）", nameKana: "まつだいらさだなお", nameRomaji: "Matsudaira Sadanao Shirakawa", imina: "定綱", clanKey: "clan_hisamatsu_matsudaira" },
  // 阿部家（最終藩主家、1823年以降）
  { key: "person_abe_masahiro_shirakawa", name: "阿部正権", nameKana: "あべまさのり", nameRomaji: "Abe Masanori Shirakawa", imina: "正権", clanKey: "clan_abe" },
  { key: "person_abe_masakiyo_shirakawa", name: "阿部正瞭", nameKana: "あべまさきよ", nameRomaji: "Abe Masakiyo", imina: "正瞭", clanKey: "clan_abe", isAdopted: true },
  { key: "person_abe_masashizu_shirakawa", name: "阿部正静", nameKana: "あべまさしず", nameRomaji: "Abe Masashizu", imina: "正静", clanKey: "clan_abe", isAdopted: true },
  // 松平(越前)家が初期の藩主
  { key: "person_niwa_nagashige_shirakawa", name: "丹羽長重", nameKana: "にわながしげ", nameRomaji: "Niwa Nagashige", imina: "長重", clanKey: "clan_niwa" },
  { key: "person_matsudaira_tadahiro_shirakawa", name: "松平忠弘（白河）", nameKana: "まつだいらただひろ", nameRomaji: "Matsudaira Tadahiro Shirakawa", imina: "忠弘", clanKey: "clan_matsudaira" },
  { key: "person_matsudaira_tadamasa_shirakawa", name: "松平直矩", nameKana: "まつだいらなおのり", nameRomaji: "Matsudaira Naonori Shirakawa", imina: "直矩", clanKey: "clan_echizen_matsudaira" },
  { key: "person_matsudaira_sadanori_shirakawa", name: "松平定信", nameKana: "まつだいらさだのぶ", nameRomaji: "Matsudaira Sadanobu", imina: "定信", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_tokugawa_munetada" },
  { key: "person_matsudaira_sadanaga_shirakawa", name: "松平定永（白河）", nameKana: "まつだいらさだなが", nameRomaji: "Matsudaira Sadanaga Shirakawa", imina: "定永", clanKey: "clan_hisamatsu_matsudaira", fatherKey: "person_matsudaira_sadanori_shirakawa" },

  // ======== 11. 松代藩 (Matsushiro) - 真田家 ========
  { key: "person_sanada_nobuyuki", name: "真田信之", nameKana: "さなだのぶゆき", nameRomaji: "Sanada Nobuyuki", imina: "信之", clanKey: "clan_sanada" },
  { key: "person_sanada_nobumasa", name: "真田信政", nameKana: "さなだのぶまさ", nameRomaji: "Sanada Nobumasa", imina: "信政", clanKey: "clan_sanada", fatherKey: "person_sanada_nobuyuki" },
  { key: "person_sanada_yukimichi", name: "真田幸道", nameKana: "さなだゆきみち", nameRomaji: "Sanada Yukimichi", imina: "幸道", clanKey: "clan_sanada", fatherKey: "person_sanada_nobumasa" },
  { key: "person_sanada_nobuhiro", name: "真田信弘", nameKana: "さなだのぶひろ", nameRomaji: "Sanada Nobuhiro", imina: "信弘", clanKey: "clan_sanada", fatherKey: "person_sanada_yukimichi" },
  { key: "person_sanada_nobuaki", name: "真田信安", nameKana: "さなだのぶあき", nameRomaji: "Sanada Nobuaki", imina: "信安", clanKey: "clan_sanada", fatherKey: "person_sanada_nobuhiro" },
  { key: "person_sanada_yukitaka", name: "真田幸弘", nameKana: "さなだゆきたか", nameRomaji: "Sanada Yukitaka", imina: "幸弘", clanKey: "clan_sanada", fatherKey: "person_sanada_nobuaki" },
  { key: "person_sanada_yukichika", name: "真田幸専", nameKana: "さなだゆきちか", nameRomaji: "Sanada Yukichika", imina: "幸専", clanKey: "clan_sanada", fatherKey: "person_sanada_yukitaka" },
  { key: "person_sanada_yukitsura", name: "真田幸貫", nameKana: "さなだゆきつら", nameRomaji: "Sanada Yukitsura", imina: "幸貫", clanKey: "clan_sanada", isAdopted: true },
  { key: "person_sanada_yukitada", name: "真田幸教", nameKana: "さなだゆきただ", nameRomaji: "Sanada Yukitada", imina: "幸教", clanKey: "clan_sanada", fatherKey: "person_sanada_yukitsura" },
  { key: "person_sanada_yukimoto", name: "真田幸民", nameKana: "さなだゆきもと", nameRomaji: "Sanada Yukimoto", imina: "幸民", clanKey: "clan_sanada", isAdopted: true },

  // ======== 12. 平戸藩 (Hirado) - 松浦家 ========
  { key: "person_matsuura_shigenobu", name: "松浦鎮信", nameKana: "まつらしげのぶ", nameRomaji: "Matsuura Shigenobu", imina: "鎮信", clanKey: "clan_matsuura" },
  { key: "person_matsuura_takanobu", name: "松浦隆信", nameKana: "まつらたかのぶ", nameRomaji: "Matsuura Takanobu", imina: "隆信", clanKey: "clan_matsuura", fatherKey: "person_matsuura_shigenobu" },
  { key: "person_matsuura_takashi", name: "松浦棟", nameKana: "まつらたかし", nameRomaji: "Matsuura Takashi", imina: "棟", clanKey: "clan_matsuura", fatherKey: "person_matsuura_takanobu" },
  { key: "person_matsuura_masashi", name: "松浦篤信", nameKana: "まつらあつのぶ", nameRomaji: "Matsuura Atsunobu", imina: "篤信", clanKey: "clan_matsuura", fatherKey: "person_matsuura_takashi" },
  { key: "person_matsuura_nobumasa", name: "松浦信正", nameKana: "まつらのぶまさ", nameRomaji: "Matsuura Nobumasa", imina: "信正", clanKey: "clan_matsuura" },
  { key: "person_matsuura_atsushi", name: "松浦篤", nameKana: "まつらあつし", nameRomaji: "Matsuura Atsushi", imina: "篤", clanKey: "clan_matsuura", fatherKey: "person_matsuura_nobumasa" },
  { key: "person_matsuura_kiyoshi", name: "松浦清", nameKana: "まつらきよし", nameRomaji: "Matsuura Kiyoshi", imina: "清", clanKey: "clan_matsuura", fatherKey: "person_matsuura_atsushi" },
  { key: "person_matsuura_hiromu", name: "松浦煕", nameKana: "まつらひろむ", nameRomaji: "Matsuura Hiromu", imina: "煕", clanKey: "clan_matsuura", fatherKey: "person_matsuura_kiyoshi" },
  { key: "person_matsuura_akira", name: "松浦詮", nameKana: "まつらあきら", nameRomaji: "Matsuura Akira", imina: "詮", clanKey: "clan_matsuura", fatherKey: "person_matsuura_hiromu" },

  // ======== 13. 中津藩 (Nakatsu) - 奥平家 ========
  { key: "person_okudaira_ienaga", name: "奥平家昌", nameKana: "おくだいらいえなが", nameRomaji: "Okudaira Ienaga", imina: "家昌", clanKey: "clan_okudaira" },
  { key: "person_okudaira_tadamasa_nakatsu", name: "奥平忠昌", nameKana: "おくだいらただまさ", nameRomaji: "Okudaira Tadamasa Nakatsu", imina: "忠昌", clanKey: "clan_okudaira", fatherKey: "person_okudaira_ienaga" },
  // 小笠原家が一時入封、のち奥平家復帰
  { key: "person_okudaira_masashige", name: "奥平昌成", nameKana: "おくだいらまさしげ", nameRomaji: "Okudaira Masashige", imina: "昌成", clanKey: "clan_okudaira" },
  { key: "person_okudaira_masatatsu", name: "奥平昌敦", nameKana: "おくだいらまさたつ", nameRomaji: "Okudaira Masatatsu", imina: "昌敦", clanKey: "clan_okudaira", fatherKey: "person_okudaira_masashige" },
  { key: "person_okudaira_masayoshi_nakatsu", name: "奥平昌鹿", nameKana: "おくだいらまさよし", nameRomaji: "Okudaira Masayoshi Nakatsu", imina: "昌鹿", clanKey: "clan_okudaira", fatherKey: "person_okudaira_masatatsu" },
  { key: "person_okudaira_masataka_nakatsu", name: "奥平昌高", nameKana: "おくだいらまさたか", nameRomaji: "Okudaira Masataka", imina: "昌高", clanKey: "clan_okudaira", isAdopted: true },
  { key: "person_okudaira_masayuki_nakatsu", name: "奥平昌暢", nameKana: "おくだいらまさゆき", nameRomaji: "Okudaira Masayuki", imina: "昌暢", clanKey: "clan_okudaira", fatherKey: "person_okudaira_masataka_nakatsu" },
  { key: "person_okudaira_masafuku_nakatsu", name: "奥平昌服", nameKana: "おくだいらまさふく", nameRomaji: "Okudaira Masafuku", imina: "昌服", clanKey: "clan_okudaira", fatherKey: "person_okudaira_masayuki_nakatsu" },
  { key: "person_okudaira_masamoto_nakatsu", name: "奥平昌邁", nameKana: "おくだいらまさもと", nameRomaji: "Okudaira Masamoto", imina: "昌邁", clanKey: "clan_okudaira", fatherKey: "person_okudaira_masafuku_nakatsu" },

  // ======== 14. 対馬藩 (Tsushima) - 宗家 ========
  { key: "person_so_yoshitoshi", name: "宗義智", nameKana: "そうよしとし", nameRomaji: "So Yoshitoshi", imina: "義智", clanKey: "clan_so" },
  { key: "person_so_yoshinari", name: "宗義成", nameKana: "そうよしなり", nameRomaji: "So Yoshinari", imina: "義成", clanKey: "clan_so", fatherKey: "person_so_yoshitoshi" },
  { key: "person_so_yoshizane", name: "宗義真", nameKana: "そうよしざね", nameRomaji: "So Yoshizane", imina: "義真", clanKey: "clan_so", fatherKey: "person_so_yoshinari" },
  { key: "person_so_yoshitsugu", name: "宗義倫", nameKana: "そうよしつぐ", nameRomaji: "So Yoshitsugu", imina: "義倫", clanKey: "clan_so", fatherKey: "person_so_yoshizane" },
  { key: "person_so_yoshimichi", name: "宗義方", nameKana: "そうよしみち", nameRomaji: "So Yoshimichi", imina: "義方", clanKey: "clan_so", fatherKey: "person_so_yoshizane" },
  { key: "person_so_yoshiari", name: "宗義誠", nameKana: "そうよしあり", nameRomaji: "So Yoshiari", imina: "義誠", clanKey: "clan_so", isAdopted: true },
  { key: "person_so_yoshinaga", name: "宗義蕃", nameKana: "そうよしなが", nameRomaji: "So Yoshinaga", imina: "義蕃", clanKey: "clan_so", fatherKey: "person_so_yoshiari" },
  { key: "person_so_yoshikatsu", name: "宗義暢", nameKana: "そうよしかつ", nameRomaji: "So Yoshikatsu", imina: "義暢", clanKey: "clan_so", fatherKey: "person_so_yoshinaga" },
  { key: "person_so_yoshimasa", name: "宗義功", nameKana: "そうよしまさ", nameRomaji: "So Yoshimasa", imina: "義功", clanKey: "clan_so", fatherKey: "person_so_yoshikatsu" },
  { key: "person_so_yoshitane", name: "宗義質", nameKana: "そうよしたね", nameRomaji: "So Yoshitane", imina: "義質", clanKey: "clan_so", fatherKey: "person_so_yoshimasa" },
  { key: "person_so_yoshiyori", name: "宗義章", nameKana: "そうよしより", nameRomaji: "So Yoshiyori", imina: "義章", clanKey: "clan_so", fatherKey: "person_so_yoshitane" },
  { key: "person_so_yoshiakira", name: "宗義和", nameKana: "そうよしあきら", nameRomaji: "So Yoshiakira", imina: "義和", clanKey: "clan_so", isAdopted: true },
  { key: "person_so_yoshinori", name: "宗義達", nameKana: "そうよしのり", nameRomaji: "So Yoshinori", imina: "義達", clanKey: "clan_so", isAdopted: true },

  // ======== 15. 岩国藩 (Iwakuni) - 吉川家 ========
  { key: "person_kikkawa_hiroie", name: "吉川広家", nameKana: "きっかわひろいえ", nameRomaji: "Kikkawa Hiroie", imina: "広家", clanKey: "clan_kikkawa" },
  { key: "person_kikkawa_hiromasa", name: "吉川広正", nameKana: "きっかわひろまさ", nameRomaji: "Kikkawa Hiromasa", imina: "広正", clanKey: "clan_kikkawa", fatherKey: "person_kikkawa_hiroie" },
  { key: "person_kikkawa_hiroyoshi", name: "吉川広嘉", nameKana: "きっかわひろよし", nameRomaji: "Kikkawa Hiroyoshi", imina: "広嘉", clanKey: "clan_kikkawa", fatherKey: "person_kikkawa_hiromasa" },
  { key: "person_kikkawa_hirotsune", name: "吉川広紀", nameKana: "きっかわひろつね", nameRomaji: "Kikkawa Hirotsune", imina: "広紀", clanKey: "clan_kikkawa", fatherKey: "person_kikkawa_hiroyoshi" },
  { key: "person_kikkawa_tsunenaga", name: "吉川経永", nameKana: "きっかわつねなが", nameRomaji: "Kikkawa Tsunenaga", imina: "経永", clanKey: "clan_kikkawa", fatherKey: "person_kikkawa_hirotsune" },
  { key: "person_kikkawa_tsunenari", name: "吉川経倫", nameKana: "きっかわつねなり", nameRomaji: "Kikkawa Tsunenari", imina: "経倫", clanKey: "clan_kikkawa", fatherKey: "person_kikkawa_tsunenaga" },
  { key: "person_kikkawa_hirofusa", name: "吉川広封", nameKana: "きっかわひろふさ", nameRomaji: "Kikkawa Hirofusa", imina: "広封", clanKey: "clan_kikkawa", isAdopted: true },
  { key: "person_kikkawa_tsunetaka", name: "吉川経賢", nameKana: "きっかわつねたか", nameRomaji: "Kikkawa Tsunetaka", imina: "経賢", clanKey: "clan_kikkawa", isAdopted: true },
  { key: "person_kikkawa_tsuneaki", name: "吉川経幹", nameKana: "きっかわつねあき", nameRomaji: "Kikkawa Tsuneaki", imina: "経幹", clanKey: "clan_kikkawa", fatherKey: "person_kikkawa_tsunetaka" },
  { key: "person_kikkawa_tsunemoto", name: "吉川経健", nameKana: "きっかわつねもと", nameRomaji: "Kikkawa Tsunemoto", imina: "経健", clanKey: "clan_kikkawa", isAdopted: true },
];

for (const p of newPersons) {
  if (!hasKey(persons, p.key)) {
    persons.push(p);
  }
}

// ========================================
// NEW APPOINTMENTS
// ========================================
const newAppointments = [
  // ======== 1. 桑名藩 ========
  // 本多家（初代-2代、1601-1617）
  { key: "appt_honda_tadakatsu_kuwana", personKey: "person_honda_tadakatsu", roleType: "藩主", territoryKey: "territory_kuwana", generation: 1, startYear: 1601, endYear: 1610 },
  { key: "appt_honda_tadamasa_kuwana", personKey: "person_honda_tadamasa", roleType: "藩主", territoryKey: "territory_kuwana", generation: 2, startYear: 1610, endYear: 1617 },
  // 久松松平家
  { key: "appt_matsudaira_sadatsuna_kuwana", personKey: "person_matsudaira_sadatsuna_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 3, startYear: 1635, endYear: 1651 },
  { key: "appt_matsudaira_sadayoshi_kuwana", personKey: "person_matsudaira_sadayoshi_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 4, startYear: 1651, endYear: 1657 },
  { key: "appt_matsudaira_sadashige_kuwana", personKey: "person_matsudaira_sadashige_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 5, startYear: 1701, endYear: 1710 },
  { key: "appt_matsudaira_sadanao_kuwana", personKey: "person_matsudaira_sadanao_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 6, startYear: 1710, endYear: 1735 },
  { key: "appt_matsudaira_sadaaki_kuwana", personKey: "person_matsudaira_sadaaki_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 7, startYear: 1735, endYear: 1783 },
  { key: "appt_matsudaira_sadanaga_kuwana", personKey: "person_matsudaira_sadanaga_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 8, startYear: 1783, endYear: 1806 },
  { key: "appt_matsudaira_sadakuni_kuwana", personKey: "person_matsudaira_sadakuni_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 9, startYear: 1806, endYear: 1823 },
  { key: "appt_matsudaira_sadamichi_kuwana", personKey: "person_matsudaira_sadamichi_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 10, startYear: 1823, endYear: 1838 },
  { key: "appt_matsudaira_sadakata_kuwana", personKey: "person_matsudaira_sadakata_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 11, startYear: 1838, endYear: 1862 },
  { key: "appt_matsudaira_sadatoshi_kuwana", personKey: "person_matsudaira_sadatoshi_kuwana", roleType: "藩主", territoryKey: "territory_kuwana", generation: 12, startYear: 1862, endYear: 1868 },

  // ======== 2. 松本藩 ========
  { key: "appt_toda_yasunaga_matsumoto", personKey: "person_toda_yasunaga", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 1, startYear: 1617, endYear: 1633 },
  { key: "appt_toda_yasumitsu_matsumoto", personKey: "person_toda_yasumitsu", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 2, startYear: 1633, endYear: 1634 },
  // 最終戸田家（1726-1871）
  { key: "appt_toda_mitsuzane_matsumoto", personKey: "person_toda_mitsuzane", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 3, startYear: 1726, endYear: 1733 },
  { key: "appt_toda_mitsuhide_matsumoto", personKey: "person_toda_mitsuhide_matsumoto", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 4, startYear: 1733, endYear: 1748 },
  { key: "appt_toda_mitsutaka_matsumoto", personKey: "person_toda_mitsutaka_matsumoto", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 5, startYear: 1748, endYear: 1769 },
  { key: "appt_toda_mitsutsura_matsumoto", personKey: "person_toda_mitsutsura", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 6, startYear: 1769, endYear: 1794 },
  { key: "appt_toda_mitsuyasu_matsumoto", personKey: "person_toda_mitsuyasu_matsumoto", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 7, startYear: 1794, endYear: 1834 },
  { key: "appt_toda_mitsunobu_matsumoto", personKey: "person_toda_mitsunobu_matsumoto", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 8, startYear: 1834, endYear: 1845 },
  { key: "appt_toda_mitsunori_matsumoto", personKey: "person_toda_mitsunori_matsumoto", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 9, startYear: 1845, endYear: 1869 },
  { key: "appt_toda_mitsutada_matsumoto", personKey: "person_toda_mitsutada_matsumoto", roleType: "藩主", territoryKey: "territory_matsumoto", generation: 10, startYear: 1869, endYear: 1871 },

  // ======== 3. 明石藩 ========
  { key: "appt_ogasawara_tadazane_akashi", personKey: "person_ogasawara_tadazane_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 1, startYear: 1617, endYear: 1632 },
  { key: "appt_matsudaira_naomoto_akashi", personKey: "person_matsudaira_naomoto_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 2, startYear: 1682, endYear: 1701 },
  { key: "appt_matsudaira_naoyoshi_akashi", personKey: "person_matsudaira_naoyoshi_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 3, startYear: 1701, endYear: 1728 },
  { key: "appt_matsudaira_naojun_akashi", personKey: "person_matsudaira_naojun_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 4, startYear: 1728, endYear: 1743 },
  { key: "appt_matsudaira_naotoki_akashi", personKey: "person_matsudaira_naotoki_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 5, startYear: 1743, endYear: 1784 },
  { key: "appt_matsudaira_naohide_akashi", personKey: "person_matsudaira_naohide_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 6, startYear: 1784, endYear: 1826 },
  { key: "appt_matsudaira_naoyori_akashi", personKey: "person_matsudaira_naoyori_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 7, startYear: 1826, endYear: 1840 },
  { key: "appt_matsudaira_naohiro_akashi", personKey: "person_matsudaira_naohiro_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 8, startYear: 1840, endYear: 1856 },
  { key: "appt_matsudaira_naotsune_akashi", personKey: "person_matsudaira_naotsune_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 9, startYear: 1856, endYear: 1869 },
  { key: "appt_matsudaira_naoaki_akashi", personKey: "person_matsudaira_naoaki_akashi", roleType: "藩主", territoryKey: "territory_akashi", generation: 10, startYear: 1869, endYear: 1871 },

  // ======== 4. 大垣藩 ========
  { key: "appt_toda_ujikane_ogaki", personKey: "person_toda_ujikane", roleType: "藩主", territoryKey: "territory_ogaki", generation: 1, startYear: 1635, endYear: 1651 },
  { key: "appt_toda_ujinori_ogaki", personKey: "person_toda_ujinori", roleType: "藩主", territoryKey: "territory_ogaki", generation: 2, startYear: 1651, endYear: 1671 },
  { key: "appt_toda_ujinishi_ogaki", personKey: "person_toda_ujinishi", roleType: "藩主", territoryKey: "territory_ogaki", generation: 3, startYear: 1671, endYear: 1723 },
  { key: "appt_toda_ujisada_ogaki", personKey: "person_toda_ujisada", roleType: "藩主", territoryKey: "territory_ogaki", generation: 4, startYear: 1723, endYear: 1735 },
  { key: "appt_toda_ujitaka_ogaki", personKey: "person_toda_ujitaka", roleType: "藩主", territoryKey: "territory_ogaki", generation: 5, startYear: 1735, endYear: 1768 },
  { key: "appt_toda_ujinori2_ogaki", personKey: "person_toda_ujinori2", roleType: "藩主", territoryKey: "territory_ogaki", generation: 6, startYear: 1768, endYear: 1787 },
  { key: "appt_toda_ujitake_ogaki", personKey: "person_toda_ujitake", roleType: "藩主", territoryKey: "territory_ogaki", generation: 7, startYear: 1787, endYear: 1798 },
  { key: "appt_toda_ujitsura_ogaki", personKey: "person_toda_ujitsura", roleType: "藩主", territoryKey: "territory_ogaki", generation: 8, startYear: 1798, endYear: 1817 },
  { key: "appt_toda_ujimasa_ogaki", personKey: "person_toda_ujimasa", roleType: "藩主", territoryKey: "territory_ogaki", generation: 9, startYear: 1817, endYear: 1854 },
  { key: "appt_toda_ujiyuki_ogaki", personKey: "person_toda_ujiyuki", roleType: "藩主", territoryKey: "territory_ogaki", generation: 10, startYear: 1854, endYear: 1871 },

  // ======== 5. 小田原藩 ========
  { key: "appt_okubo_tadayo_odawara", personKey: "person_okubo_tadayo", roleType: "藩主", territoryKey: "territory_odawara", generation: 1, startYear: 1590, endYear: 1594 },
  { key: "appt_okubo_tadachika_odawara", personKey: "person_okubo_tadachika", roleType: "藩主", territoryKey: "territory_odawara", generation: 2, startYear: 1594, endYear: 1614 },
  // 改易→稲葉家→復帰
  { key: "appt_okubo_tadatomo_odawara", personKey: "person_okubo_tadatomo", roleType: "藩主", territoryKey: "territory_odawara", generation: 3, startYear: 1686, endYear: 1713 },
  { key: "appt_okubo_tadamasu_odawara", personKey: "person_okubo_tadamasu", roleType: "藩主", territoryKey: "territory_odawara", generation: 4, startYear: 1713, endYear: 1732 },
  { key: "appt_okubo_tadazane_odawara", personKey: "person_okubo_tadazane", roleType: "藩主", territoryKey: "territory_odawara", generation: 5, startYear: 1732, endYear: 1763 },
  { key: "appt_okubo_tadamasa_odawara", personKey: "person_okubo_tadamasa_odawara", roleType: "藩主", territoryKey: "territory_odawara", generation: 6, startYear: 1763, endYear: 1796 },
  { key: "appt_okubo_tadayuki_odawara", personKey: "person_okubo_tadayuki", roleType: "藩主", territoryKey: "territory_odawara", generation: 7, startYear: 1796, endYear: 1812 },
  { key: "appt_okubo_tadazane2_odawara", personKey: "person_okubo_tadazane2", roleType: "藩主", territoryKey: "territory_odawara", generation: 8, startYear: 1812, endYear: 1837 },
  { key: "appt_okubo_tadayoshi_odawara", personKey: "person_okubo_tadayoshi", roleType: "藩主", territoryKey: "territory_odawara", generation: 9, startYear: 1837, endYear: 1859 },
  { key: "appt_okubo_tadanori_odawara", personKey: "person_okubo_tadanori", roleType: "藩主", territoryKey: "territory_odawara", generation: 10, startYear: 1859, endYear: 1868 },
  { key: "appt_okubo_tadayoshi2_odawara", personKey: "person_okubo_tadayoshi2", roleType: "藩主", territoryKey: "territory_odawara", generation: 11, startYear: 1868, endYear: 1871 },

  // ======== 6. 川越藩 ========
  { key: "appt_sakai_shigetada_kawagoe", personKey: "person_sakai_shigetada_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 1, startYear: 1590, endYear: 1601 },
  { key: "appt_sakai_tadayo_kawagoe", personKey: "person_sakai_tadayo_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 2, startYear: 1601, endYear: 1627 },
  { key: "appt_sakai_tadakatsu_kawagoe", personKey: "person_sakai_tadakatsu_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 3, startYear: 1627, endYear: 1634 },
  { key: "appt_matsudaira_nobutsuna_kawagoe", personKey: "person_matsudaira_nobutsuna_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 4, startYear: 1639, endYear: 1662 },
  { key: "appt_matsudaira_tertsuna_kawagoe", personKey: "person_matsudaira_tertsuna_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 5, startYear: 1662, endYear: 1691 },
  { key: "appt_matsudaira_nobutera_kawagoe", personKey: "person_matsudaira_nobutera_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 6, startYear: 1691, endYear: 1694 },
  // 松平(松井)家最終期
  { key: "appt_matsudaira_naritaka_kawagoe", personKey: "person_matsudaira_naritaka_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 7, startYear: 1840, endYear: 1857 },
  { key: "appt_matsudaira_noritoshi_kawagoe", personKey: "person_matsudaira_noritoshi_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 8, startYear: 1857, endYear: 1858 },
  { key: "appt_matsudaira_naohiro_kawagoe", personKey: "person_matsudaira_naohiro_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 9, startYear: 1858, endYear: 1860 },
  { key: "appt_matsudaira_narikawa_kawagoe", personKey: "person_matsudaira_narikawa_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 10, startYear: 1860, endYear: 1867 },
  { key: "appt_matsudaira_yasutoshi_kawagoe", personKey: "person_matsudaira_yasutoshi_kawagoe", roleType: "藩主", territoryKey: "territory_kawagoe", generation: 11, startYear: 1867, endYear: 1871 },

  // ======== 7. 福山藩 ========
  { key: "appt_mizuno_katsunari_fukuyama", personKey: "person_mizuno_katsunari", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 1, startYear: 1619, endYear: 1639 },
  // 阿部家（1710-1871）
  { key: "appt_abe_masaharu_fukuyama", personKey: "person_abe_masaharu_fukuyama", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 2, startYear: 1710, endYear: 1715 },
  { key: "appt_abe_masafuku_fukuyama", personKey: "person_abe_masafuku_fukuyama", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 3, startYear: 1715, endYear: 1769 },
  { key: "appt_abe_masatomo_fukuyama", personKey: "person_abe_masatomo_fukuyama", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 4, startYear: 1769, endYear: 1803 },
  { key: "appt_abe_masayoshi_fukuyama", personKey: "person_abe_masayoshi_fukuyama", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 5, startYear: 1803, endYear: 1826 },
  { key: "appt_abe_masahiro_fukuyama", personKey: "person_abe_masahiro_fukuyama", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 6, startYear: 1826, endYear: 1857 },
  { key: "appt_abe_masanori_fukuyama", personKey: "person_abe_masanori_fukuyama", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 7, startYear: 1857, endYear: 1862 },
  { key: "appt_abe_masataka_fukuyama", personKey: "person_abe_masataka_fukuyama", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 8, startYear: 1862, endYear: 1868 },
  { key: "appt_abe_masahisa_fukuyama", personKey: "person_abe_masahisa_fukuyama", roleType: "藩主", territoryKey: "territory_fukuyama", generation: 9, startYear: 1868, endYear: 1871 },

  // ======== 8. 富山藩 ========
  { key: "appt_maeda_toshinaga_toyama", personKey: "person_maeda_toshinaga_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 1, startYear: 1639, endYear: 1674 },
  { key: "appt_maeda_masatoshi_toyama", personKey: "person_maeda_masatoshi_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 2, startYear: 1674, endYear: 1706 },
  { key: "appt_maeda_toshioki_toyama", personKey: "person_maeda_toshioki_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 3, startYear: 1706, endYear: 1710 },
  { key: "appt_maeda_toshitaka_toyama", personKey: "person_maeda_toshitaka_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 4, startYear: 1710, endYear: 1735 },
  { key: "appt_maeda_toshinobu_toyama", personKey: "person_maeda_toshinobu_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 5, startYear: 1735, endYear: 1745 },
  { key: "appt_maeda_toshiyasu_toyama", personKey: "person_maeda_toshiyasu_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 6, startYear: 1745, endYear: 1771 },
  { key: "appt_maeda_toshiatsu_toyama", personKey: "person_maeda_toshiatsu_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 7, startYear: 1771, endYear: 1811 },
  { key: "appt_maeda_toshimasa_toyama", personKey: "person_maeda_toshimasa_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 8, startYear: 1811, endYear: 1835 },
  { key: "appt_maeda_toshinari_toyama", personKey: "person_maeda_toshinari_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 9, startYear: 1835, endYear: 1843 },
  { key: "appt_maeda_toshitomo_toyama", personKey: "person_maeda_toshitomo_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 10, startYear: 1843, endYear: 1859 },
  { key: "appt_maeda_toshiyuki_toyama", personKey: "person_maeda_toshiyuki_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 11, startYear: 1859, endYear: 1860 },
  { key: "appt_maeda_toshitake_toyama", personKey: "person_maeda_toshitake_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 12, startYear: 1860, endYear: 1869 },
  { key: "appt_maeda_toshihisa_toyama", personKey: "person_maeda_toshihisa_toyama", roleType: "藩主", territoryKey: "territory_toyama", generation: 13, startYear: 1869, endYear: 1871 },

  // ======== 9. 二本松藩 ========
  { key: "appt_niwa_mitsushige_nihonmatsu", personKey: "person_niwa_mitsushige", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 1, startYear: 1643, endYear: 1679 },
  { key: "appt_niwa_nagatsugu_nihonmatsu", personKey: "person_niwa_nagatsugu", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 2, startYear: 1679, endYear: 1687 },
  { key: "appt_niwa_naganobu_nihonmatsu", personKey: "person_niwa_naganobu", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 3, startYear: 1687, endYear: 1718 },
  { key: "appt_niwa_hidenaga_nihonmatsu", personKey: "person_niwa_hidenaga", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 4, startYear: 1718, endYear: 1735 },
  { key: "appt_niwa_takahisa_nihonmatsu", personKey: "person_niwa_takahisa", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 5, startYear: 1735, endYear: 1756 },
  { key: "appt_niwa_nagahiro_nihonmatsu", personKey: "person_niwa_nagahiro", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 6, startYear: 1756, endYear: 1803 },
  { key: "appt_niwa_nagatomi_nihonmatsu", personKey: "person_niwa_nagatomi", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 7, startYear: 1803, endYear: 1847 },
  { key: "appt_niwa_nagakuni_nihonmatsu", personKey: "person_niwa_nagakuni", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 8, startYear: 1847, endYear: 1862 },
  { key: "appt_niwa_nagayuki_nihonmatsu", personKey: "person_niwa_nagayuki", roleType: "藩主", territoryKey: "territory_nihonmatsu", generation: 9, startYear: 1862, endYear: 1868 },

  // ======== 10. 白河藩 ========
  { key: "appt_niwa_nagashige_shirakawa", personKey: "person_niwa_nagashige_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 1, startYear: 1627, endYear: 1637 },
  { key: "appt_matsudaira_sadanao_shirakawa", personKey: "person_matsudaira_sadanao_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 2, startYear: 1643, endYear: 1649 },
  { key: "appt_matsudaira_tadahiro_shirakawa", personKey: "person_matsudaira_tadahiro_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 3, startYear: 1681, endYear: 1692 },
  { key: "appt_matsudaira_tadamasa_shirakawa", personKey: "person_matsudaira_tadamasa_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 4, startYear: 1692, endYear: 1695 },
  { key: "appt_matsudaira_sadanori_shirakawa", personKey: "person_matsudaira_sadanori_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 5, startYear: 1783, endYear: 1812 },
  { key: "appt_matsudaira_sadanaga_shirakawa", personKey: "person_matsudaira_sadanaga_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 6, startYear: 1812, endYear: 1823 },
  { key: "appt_abe_masahiro_shirakawa", personKey: "person_abe_masahiro_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 7, startYear: 1823, endYear: 1838 },
  { key: "appt_abe_masakiyo_shirakawa", personKey: "person_abe_masakiyo_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 8, startYear: 1838, endYear: 1855 },
  { key: "appt_abe_masashizu_shirakawa", personKey: "person_abe_masashizu_shirakawa", roleType: "藩主", territoryKey: "territory_shirakawa", generation: 9, startYear: 1855, endYear: 1868 },

  // ======== 11. 松代藩 ========
  { key: "appt_sanada_nobuyuki_matsushiro", personKey: "person_sanada_nobuyuki", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 1, startYear: 1622, endYear: 1656 },
  { key: "appt_sanada_nobumasa_matsushiro", personKey: "person_sanada_nobumasa", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 2, startYear: 1656, endYear: 1658 },
  { key: "appt_sanada_yukimichi_matsushiro", personKey: "person_sanada_yukimichi", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 3, startYear: 1658, endYear: 1727 },
  { key: "appt_sanada_nobuhiro_matsushiro", personKey: "person_sanada_nobuhiro", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 4, startYear: 1727, endYear: 1736 },
  { key: "appt_sanada_nobuaki_matsushiro", personKey: "person_sanada_nobuaki", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 5, startYear: 1736, endYear: 1752 },
  { key: "appt_sanada_yukitaka_matsushiro", personKey: "person_sanada_yukitaka", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 6, startYear: 1752, endYear: 1798 },
  { key: "appt_sanada_yukichika_matsushiro", personKey: "person_sanada_yukichika", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 7, startYear: 1798, endYear: 1823 },
  { key: "appt_sanada_yukitsura_matsushiro", personKey: "person_sanada_yukitsura", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 8, startYear: 1823, endYear: 1852 },
  { key: "appt_sanada_yukitada_matsushiro", personKey: "person_sanada_yukitada", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 9, startYear: 1852, endYear: 1866 },
  { key: "appt_sanada_yukimoto_matsushiro", personKey: "person_sanada_yukimoto", roleType: "藩主", territoryKey: "territory_matsushiro", generation: 10, startYear: 1866, endYear: 1871 },

  // ======== 12. 平戸藩 ========
  { key: "appt_matsuura_shigenobu_hirado", personKey: "person_matsuura_shigenobu", roleType: "藩主", territoryKey: "territory_hirado", generation: 1, startYear: 1599, endYear: 1614 },
  { key: "appt_matsuura_takanobu_hirado", personKey: "person_matsuura_takanobu", roleType: "藩主", territoryKey: "territory_hirado", generation: 2, startYear: 1614, endYear: 1637 },
  { key: "appt_matsuura_takashi_hirado", personKey: "person_matsuura_takashi", roleType: "藩主", territoryKey: "territory_hirado", generation: 3, startYear: 1637, endYear: 1657 },
  { key: "appt_matsuura_masashi_hirado", personKey: "person_matsuura_masashi", roleType: "藩主", territoryKey: "territory_hirado", generation: 4, startYear: 1657, endYear: 1689 },
  { key: "appt_matsuura_nobumasa_hirado", personKey: "person_matsuura_nobumasa", roleType: "藩主", territoryKey: "territory_hirado", generation: 5, startYear: 1689, endYear: 1733 },
  { key: "appt_matsuura_atsushi_hirado", personKey: "person_matsuura_atsushi", roleType: "藩主", territoryKey: "territory_hirado", generation: 6, startYear: 1733, endYear: 1749 },
  { key: "appt_matsuura_kiyoshi_hirado", personKey: "person_matsuura_kiyoshi", roleType: "藩主", territoryKey: "territory_hirado", generation: 7, startYear: 1749, endYear: 1775 },
  { key: "appt_matsuura_hiromu_hirado", personKey: "person_matsuura_hiromu", roleType: "藩主", territoryKey: "territory_hirado", generation: 8, startYear: 1775, endYear: 1841 },
  { key: "appt_matsuura_akira_hirado", personKey: "person_matsuura_akira", roleType: "藩主", territoryKey: "territory_hirado", generation: 9, startYear: 1841, endYear: 1871 },

  // ======== 13. 中津藩 ========
  { key: "appt_okudaira_ienaga_nakatsu", personKey: "person_okudaira_ienaga", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 1, startYear: 1600, endYear: 1614 },
  { key: "appt_okudaira_tadamasa_nakatsu", personKey: "person_okudaira_tadamasa_nakatsu", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 2, startYear: 1614, endYear: 1632 },
  // 小笠原家の後、奥平家復帰
  { key: "appt_okudaira_masashige_nakatsu", personKey: "person_okudaira_masashige", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 3, startYear: 1717, endYear: 1742 },
  { key: "appt_okudaira_masatatsu_nakatsu", personKey: "person_okudaira_masatatsu", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 4, startYear: 1742, endYear: 1765 },
  { key: "appt_okudaira_masayoshi_nakatsu", personKey: "person_okudaira_masayoshi_nakatsu", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 5, startYear: 1765, endYear: 1780 },
  { key: "appt_okudaira_masataka_nakatsu", personKey: "person_okudaira_masataka_nakatsu", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 6, startYear: 1780, endYear: 1830 },
  { key: "appt_okudaira_masayuki_nakatsu", personKey: "person_okudaira_masayuki_nakatsu", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 7, startYear: 1830, endYear: 1855 },
  { key: "appt_okudaira_masafuku_nakatsu", personKey: "person_okudaira_masafuku_nakatsu", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 8, startYear: 1855, endYear: 1868 },
  { key: "appt_okudaira_masamoto_nakatsu", personKey: "person_okudaira_masamoto_nakatsu", roleType: "藩主", territoryKey: "territory_nakatsu", generation: 9, startYear: 1868, endYear: 1871 },

  // ======== 14. 対馬藩 ========
  { key: "appt_so_yoshitoshi_tsushima", personKey: "person_so_yoshitoshi", roleType: "藩主", territoryKey: "territory_tsushima", generation: 1, startYear: 1587, endYear: 1615 },
  { key: "appt_so_yoshinari_tsushima", personKey: "person_so_yoshinari", roleType: "藩主", territoryKey: "territory_tsushima", generation: 2, startYear: 1615, endYear: 1657 },
  { key: "appt_so_yoshizane_tsushima", personKey: "person_so_yoshizane", roleType: "藩主", territoryKey: "territory_tsushima", generation: 3, startYear: 1657, endYear: 1692 },
  { key: "appt_so_yoshitsugu_tsushima", personKey: "person_so_yoshitsugu", roleType: "藩主", territoryKey: "territory_tsushima", generation: 4, startYear: 1692, endYear: 1694 },
  { key: "appt_so_yoshimichi_tsushima", personKey: "person_so_yoshimichi", roleType: "藩主", territoryKey: "territory_tsushima", generation: 5, startYear: 1694, endYear: 1718 },
  { key: "appt_so_yoshiari_tsushima", personKey: "person_so_yoshiari", roleType: "藩主", territoryKey: "territory_tsushima", generation: 6, startYear: 1718, endYear: 1730 },
  { key: "appt_so_yoshinaga_tsushima", personKey: "person_so_yoshinaga", roleType: "藩主", territoryKey: "territory_tsushima", generation: 7, startYear: 1730, endYear: 1752 },
  { key: "appt_so_yoshikatsu_tsushima", personKey: "person_so_yoshikatsu", roleType: "藩主", territoryKey: "territory_tsushima", generation: 8, startYear: 1752, endYear: 1778 },
  { key: "appt_so_yoshimasa_tsushima", personKey: "person_so_yoshimasa", roleType: "藩主", territoryKey: "territory_tsushima", generation: 9, startYear: 1778, endYear: 1802 },
  { key: "appt_so_yoshitane_tsushima", personKey: "person_so_yoshitane", roleType: "藩主", territoryKey: "territory_tsushima", generation: 10, startYear: 1802, endYear: 1838 },
  { key: "appt_so_yoshiyori_tsushima", personKey: "person_so_yoshiyori", roleType: "藩主", territoryKey: "territory_tsushima", generation: 11, startYear: 1838, endYear: 1862 },
  { key: "appt_so_yoshiakira_tsushima", personKey: "person_so_yoshiakira", roleType: "藩主", territoryKey: "territory_tsushima", generation: 12, startYear: 1862, endYear: 1868 },
  { key: "appt_so_yoshinori_tsushima", personKey: "person_so_yoshinori", roleType: "藩主", territoryKey: "territory_tsushima", generation: 13, startYear: 1868, endYear: 1871 },

  // ======== 15. 岩国藩 ========
  { key: "appt_kikkawa_hiroie_iwakuni", personKey: "person_kikkawa_hiroie", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 1, startYear: 1600, endYear: 1625 },
  { key: "appt_kikkawa_hiromasa_iwakuni", personKey: "person_kikkawa_hiromasa", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 2, startYear: 1625, endYear: 1663 },
  { key: "appt_kikkawa_hiroyoshi_iwakuni", personKey: "person_kikkawa_hiroyoshi", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 3, startYear: 1663, endYear: 1679 },
  { key: "appt_kikkawa_hirotsune_iwakuni", personKey: "person_kikkawa_hirotsune", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 4, startYear: 1679, endYear: 1721 },
  { key: "appt_kikkawa_tsunenaga_iwakuni", personKey: "person_kikkawa_tsunenaga", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 5, startYear: 1721, endYear: 1764 },
  { key: "appt_kikkawa_tsunenari_iwakuni", personKey: "person_kikkawa_tsunenari", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 6, startYear: 1764, endYear: 1803 },
  { key: "appt_kikkawa_hirofusa_iwakuni", personKey: "person_kikkawa_hirofusa", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 7, startYear: 1803, endYear: 1819 },
  { key: "appt_kikkawa_tsunetaka_iwakuni", personKey: "person_kikkawa_tsunetaka", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 8, startYear: 1819, endYear: 1842 },
  { key: "appt_kikkawa_tsuneaki_iwakuni", personKey: "person_kikkawa_tsuneaki", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 9, startYear: 1842, endYear: 1867 },
  { key: "appt_kikkawa_tsunemoto_iwakuni", personKey: "person_kikkawa_tsunemoto", roleType: "藩主", territoryKey: "territory_iwakuni", generation: 10, startYear: 1867, endYear: 1871 },
];

for (const a of newAppointments) {
  if (!hasKey(appointments, a.key)) {
    appointments.push(a);
  }
}

// ========================================
// NEW KOKUDAKA
// ========================================
const newKokudaka = [
  { key: "kokudaka_kuwana_1601", territoryKey: "territory_kuwana", year: 1601, amount: 10.0, changeType: "立藩", changeDetail: "本多忠勝入封、伊勢国10万石" },
  { key: "kokudaka_kuwana_1710", territoryKey: "territory_kuwana", year: 1710, amount: 11.0, changeType: "入封", changeDetail: "久松松平家入封、11万石" },

  { key: "kokudaka_matsumoto_1726", territoryKey: "territory_matsumoto", year: 1726, amount: 6.0, changeType: "入封", changeDetail: "戸田家入封、信濃国6万石" },
  { key: "kokudaka_matsumoto_1800", territoryKey: "territory_matsumoto", year: 1800, amount: 6.0, changeType: "維持", changeDetail: "戸田家6万石で安定" },

  { key: "kokudaka_akashi_1682", territoryKey: "territory_akashi", year: 1682, amount: 10.0, changeType: "入封", changeDetail: "越前松平家入封、播磨国10万石" },
  { key: "kokudaka_akashi_1800", territoryKey: "territory_akashi", year: 1800, amount: 10.0, changeType: "維持", changeDetail: "松平家10万石で安定" },

  { key: "kokudaka_ogaki_1635", territoryKey: "territory_ogaki", year: 1635, amount: 10.0, changeType: "入封", changeDetail: "戸田氏鉄入封、美濃国10万石" },
  { key: "kokudaka_ogaki_1800", territoryKey: "territory_ogaki", year: 1800, amount: 10.0, changeType: "維持", changeDetail: "戸田家10万石で安定" },

  { key: "kokudaka_odawara_1590", territoryKey: "territory_odawara", year: 1590, amount: 4.5, changeType: "立藩", changeDetail: "大久保忠世入封、相模国4万5千石" },
  { key: "kokudaka_odawara_1686", territoryKey: "territory_odawara", year: 1686, amount: 11.3, changeType: "入封", changeDetail: "大久保家復帰、11万3千石" },

  { key: "kokudaka_kawagoe_1639", territoryKey: "territory_kawagoe", year: 1639, amount: 6.0, changeType: "入封", changeDetail: "松平信綱入封、武蔵国6万石" },
  { key: "kokudaka_kawagoe_1840", territoryKey: "territory_kawagoe", year: 1840, amount: 17.0, changeType: "入封", changeDetail: "松平斉典入封、17万石" },

  { key: "kokudaka_fukuyama_1619", territoryKey: "territory_fukuyama", year: 1619, amount: 10.0, changeType: "立藩", changeDetail: "水野勝成入封、備後国10万石" },
  { key: "kokudaka_fukuyama_1710", territoryKey: "territory_fukuyama", year: 1710, amount: 10.0, changeType: "入封", changeDetail: "阿部正邦入封、10万石" },

  { key: "kokudaka_toyama_1639", territoryKey: "territory_toyama", year: 1639, amount: 10.0, changeType: "立藩", changeDetail: "前田利次入封、加賀藩より分知10万石" },
  { key: "kokudaka_toyama_1800", territoryKey: "territory_toyama", year: 1800, amount: 10.0, changeType: "維持", changeDetail: "富山前田家10万石で安定" },

  { key: "kokudaka_nihonmatsu_1643", territoryKey: "territory_nihonmatsu", year: 1643, amount: 10.0, changeType: "立藩", changeDetail: "丹羽光重入封、岩代国10万石" },
  { key: "kokudaka_nihonmatsu_1800", territoryKey: "territory_nihonmatsu", year: 1800, amount: 10.0, changeType: "維持", changeDetail: "丹羽家10万石で安定" },

  { key: "kokudaka_shirakawa_1627", territoryKey: "territory_shirakawa", year: 1627, amount: 10.0, changeType: "立藩", changeDetail: "丹羽長重入封、岩代国10万石" },
  { key: "kokudaka_shirakawa_1823", territoryKey: "territory_shirakawa", year: 1823, amount: 11.0, changeType: "入封", changeDetail: "阿部家入封、11万石" },

  { key: "kokudaka_matsushiro_1622", territoryKey: "territory_matsushiro", year: 1622, amount: 10.0, changeType: "入封", changeDetail: "真田信之入封、信濃国10万石" },
  { key: "kokudaka_matsushiro_1800", territoryKey: "territory_matsushiro", year: 1800, amount: 10.0, changeType: "維持", changeDetail: "真田家10万石で安定" },

  { key: "kokudaka_hirado_1599", territoryKey: "territory_hirado", year: 1599, amount: 6.3, changeType: "立藩", changeDetail: "松浦鎮信、肥前国6万3千石" },
  { key: "kokudaka_hirado_1800", territoryKey: "territory_hirado", year: 1800, amount: 6.1, changeType: "維持", changeDetail: "松浦家6万1千石で安定" },

  { key: "kokudaka_nakatsu_1600", territoryKey: "territory_nakatsu", year: 1600, amount: 10.0, changeType: "立藩", changeDetail: "奥平家昌入封、豊前国10万石" },
  { key: "kokudaka_nakatsu_1800", territoryKey: "territory_nakatsu", year: 1800, amount: 10.0, changeType: "維持", changeDetail: "奥平家10万石で安定" },

  { key: "kokudaka_tsushima_1587", territoryKey: "territory_tsushima", year: 1587, amount: 10.0, changeType: "立藩", changeDetail: "宗義智入封、対馬国10万石格（実高は約1万石）" },
  { key: "kokudaka_tsushima_1800", territoryKey: "territory_tsushima", year: 1800, amount: 10.0, changeType: "維持", changeDetail: "宗家10万石格で安定、朝鮮貿易による実収入は大" },

  { key: "kokudaka_iwakuni_1600", territoryKey: "territory_iwakuni", year: 1600, amount: 6.0, changeType: "立藩", changeDetail: "吉川広家入封、周防国6万石" },
  { key: "kokudaka_iwakuni_1800", territoryKey: "territory_iwakuni", year: 1800, amount: 6.0, changeType: "維持", changeDetail: "吉川家6万石で安定、長州藩の支藩的性格" },
];

for (const k of newKokudaka) {
  if (!hasKey(kokudaka, k.key)) {
    kokudaka.push(k);
  }
}

// ========================================
// WRITE ALL FILES
// ========================================
writeJsonOneline('clans.json', clans);
writeJsonOneline('territories.json', territories);
writeJsonOneline('persons.json', persons);
writeJsonOneline('appointments.json', appointments);
writeJsonOneline('kokudaka.json', kokudaka);

console.log('=== Data addition complete ===');
console.log(`Clans: ${clans.length}`);
console.log(`Territories: ${territories.length}`);
console.log(`Persons: ${persons.length}`);
console.log(`Appointments: ${appointments.length}`);
console.log(`Kokudaka: ${kokudaka.length}`);
