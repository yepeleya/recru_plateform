-- Sessions de connexion portées par refresh_tokens.
-- Les lignes existantes reçoivent sessionId = id : chacune devient sa propre
-- session, ce qui garde valides les refresh tokens déjà émis. Les anciens access
-- tokens, qui ne portent pas de sid, sont refusés : une reconnexion suffit.

-- AlterTable : colonne ajoutée nullable pour pouvoir remplir les lignes existantes
ALTER TABLE `refresh_tokens` ADD COLUMN `sessionId` CHAR(36) NULL;

UPDATE `refresh_tokens` SET `sessionId` = `id` WHERE `sessionId` IS NULL;

ALTER TABLE `refresh_tokens` MODIFY `sessionId` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `refresh_tokens_sessionId_revokedAt_idx` ON `refresh_tokens`(`sessionId`, `revokedAt`);
