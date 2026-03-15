-- CreateTable
CREATE TABLE "provinces" (
    "province_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_kana" TEXT NOT NULL,
    "name_romaji" TEXT NOT NULL,
    "modern_prefecture" TEXT NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("province_id")
);

-- CreateTable
CREATE TABLE "clans" (
    "clan_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_kana" TEXT NOT NULL,
    "name_romaji" TEXT NOT NULL,
    "crest_name" TEXT,
    "crest_image" TEXT,

    CONSTRAINT "clans_pkey" PRIMARY KEY ("clan_id")
);

-- CreateTable
CREATE TABLE "persons" (
    "person_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_kana" TEXT NOT NULL,
    "name_romaji" TEXT NOT NULL,
    "imina" TEXT,
    "common_name" TEXT,
    "clan_id" INTEGER NOT NULL,
    "father_id" INTEGER,
    "mother_name" TEXT,
    "birth_order" INTEGER,
    "birth_order_type" TEXT,
    "is_adopted" BOOLEAN NOT NULL DEFAULT false,
    "adopted_from_clan_id" INTEGER,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "territories" (
    "territory_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_kana" TEXT NOT NULL,
    "name_romaji" TEXT NOT NULL,
    "territory_type" TEXT NOT NULL,
    "province_id" INTEGER NOT NULL,
    "modern_prefecture" TEXT NOT NULL,
    "modern_city" TEXT,
    "location" TEXT,
    "established_year" INTEGER NOT NULL,
    "abolished_year" INTEGER,

    CONSTRAINT "territories_pkey" PRIMARY KEY ("territory_id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "appointment_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "person_id" INTEGER NOT NULL,
    "role_type" TEXT NOT NULL,
    "territory_id" INTEGER,
    "generation" INTEGER,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "kokudaka" (
    "kokudaka_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "territory_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "change_type" TEXT,
    "change_detail" TEXT,
    "appointment_id" INTEGER,

    CONSTRAINT "kokudaka_pkey" PRIMARY KEY ("kokudaka_id")
);

-- CreateTable
CREATE TABLE "sources" (
    "source_id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "pub_year" INTEGER,
    "url" TEXT,
    "note" TEXT,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("source_id")
);

-- CreateTable
CREATE TABLE "source_links" (
    "link_id" SERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "target_table" TEXT NOT NULL,
    "target_record_id" INTEGER NOT NULL,
    "page_number" TEXT,
    "note" TEXT,

    CONSTRAINT "source_links_pkey" PRIMARY KEY ("link_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provinces_key_key" ON "provinces"("key");

-- CreateIndex
CREATE UNIQUE INDEX "clans_key_key" ON "clans"("key");

-- CreateIndex
CREATE UNIQUE INDEX "persons_key_key" ON "persons"("key");

-- CreateIndex
CREATE UNIQUE INDEX "territories_key_key" ON "territories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_key_key" ON "appointments"("key");

-- CreateIndex
CREATE UNIQUE INDEX "kokudaka_key_key" ON "kokudaka"("key");

-- CreateIndex
CREATE UNIQUE INDEX "sources_key_key" ON "sources"("key");

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("clan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "persons"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_adopted_from_clan_id_fkey" FOREIGN KEY ("adopted_from_clan_id") REFERENCES "clans"("clan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "territories" ADD CONSTRAINT "territories_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("province_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("territory_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kokudaka" ADD CONSTRAINT "kokudaka_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("territory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kokudaka" ADD CONSTRAINT "kokudaka_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("appointment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("source_id") ON DELETE RESTRICT ON UPDATE CASCADE;
