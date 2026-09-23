-- Socle V2 du profil professionnel (sous-étape 4.1).
--
-- Migration non destructive : uniquement des ajouts de colonnes nullables ou
-- avec valeur par défaut, des index, une contrainte d'unicité et deux clés
-- étrangères. Aucune colonne n'est supprimée, aucune donnée n'est réécrite.
-- `worker_profiles` et `cvs` sont vides au moment de cette migration.

-- AlterTable : champs V2 du profil
ALTER TABLE `worker_profiles`
    ADD COLUMN `secondaryMetiers` JSON NULL,
    ADD COLUMN `areas` JSON NULL,
    ADD COLUMN `availability` VARCHAR(20) NULL,
    ADD COLUMN `experienceYears` INTEGER NULL,
    ADD COLUMN `rateMin` INTEGER NULL,
    ADD COLUMN `rateMax` INTEGER NULL,
    ADD COLUMN `rateUnit` VARCHAR(20) NULL,
    ADD COLUMN `photoKey` VARCHAR(100) NULL,
    ADD COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'draft',
    ADD COLUMN `completionScore` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lastActiveAt` DATETIME(3) NULL;

-- CreateIndex : un seul profil professionnel par compte.
-- Créé AVANT la suppression de l'index simple, qui doit rester couvert pour la
-- clé étrangère worker_profiles_userId_fkey.
CREATE UNIQUE INDEX `worker_profiles_userId_key` ON `worker_profiles`(`userId`);

-- DropIndex : redondant avec l'unique ci-dessus
DROP INDEX `worker_profiles_userId_idx` ON `worker_profiles`;

-- CreateIndex : recherche publique (profil complet, visible, filtré)
CREATE INDEX `worker_profiles_status_isVisible_metierSlug_idx` ON `worker_profiles`(`status`, `isVisible`, `metierSlug`);
CREATE INDEX `worker_profiles_status_isVisible_city_idx` ON `worker_profiles`(`status`, `isVisible`, `city`);

-- AddForeignKey : dette S1 — cvId devient une vraie clé étrangère.
-- Suppression du CV ⇒ cvId NULL, le profil est conservé.
ALTER TABLE `worker_profiles`
    ADD CONSTRAINT `worker_profiles_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable : compétences déclarées
CREATE TABLE `profile_skills` (
    `id` CHAR(36) NOT NULL,
    `profileId` CHAR(36) NOT NULL,
    `label` VARCHAR(60) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `profile_skills_profileId_idx`(`profileId`),
    UNIQUE INDEX `profile_skills_profileId_label_key`(`profileId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey : les compétences disparaissent avec le profil
ALTER TABLE `profile_skills`
    ADD CONSTRAINT `profile_skills_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `worker_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
