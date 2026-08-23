-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(100) NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'SUPPORT') NOT NULL DEFAULT 'USER',
    `accountType` VARCHAR(30) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `city` VARCHAR(80) NOT NULL,
    `firstName` VARCHAR(40) NULL,
    `lastName` VARCHAR(40) NULL,
    `companyName` VARCHAR(150) NULL,
    `sector` VARCHAR(100) NULL,
    `rccmNumber` VARCHAR(50) NULL,
    `rccmFileKey` VARCHAR(100) NULL,
    `representativeFirstName` VARCHAR(40) NULL,
    `representativeLastName` VARCHAR(40) NULL,
    `representativeRole` VARCHAR(100) NULL,
    `verificationStatus` VARCHAR(30) NOT NULL DEFAULT 'non-verifie',
    `businessVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `refresh_tokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `identity_documents` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `number` VARCHAR(50) NOT NULL,
    `frontFileKey` VARCHAR(100) NOT NULL,
    `backFileKey` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `identity_documents_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cvs` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `title` VARCHAR(120) NOT NULL DEFAULT 'Mon CV',
    `source` VARCHAR(20) NOT NULL DEFAULT 'generated',
    `templateId` VARCHAR(60) NULL,
    `content` JSON NULL,
    `fileKey` VARCHAR(100) NULL,
    `fileName` VARCHAR(255) NULL,
    `mimeType` VARCHAR(100) NULL,
    `sizeBytes` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cvs_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_profiles` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `headline` VARCHAR(150) NOT NULL,
    `bio` TEXT NULL,
    `metierSlug` VARCHAR(80) NOT NULL,
    `city` VARCHAR(80) NOT NULL,
    `isAvailableNow` BOOLEAN NOT NULL DEFAULT true,
    `availableFrom` DATETIME(3) NULL,
    `jobTypes` JSON NOT NULL,
    `cvId` CHAR(36) NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `worker_profiles_slug_key`(`slug`),
    INDEX `worker_profiles_userId_idx`(`userId`),
    INDEX `worker_profiles_metierSlug_idx`(`metierSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_offers` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `metierSlug` VARCHAR(80) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `city` VARCHAR(80) NOT NULL,
    `area` VARCHAR(80) NULL,
    `budgetMin` INTEGER NULL,
    `budgetMax` INTEGER NULL,
    `budgetLabel` VARCHAR(60) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'draft',
    `recruiterId` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `job_offers_slug_key`(`slug`),
    INDEX `job_offers_recruiterId_idx`(`recruiterId`),
    INDEX `job_offers_metierSlug_idx`(`metierSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` CHAR(36) NOT NULL,
    `candidateId` CHAR(36) NOT NULL,
    `jobOfferId` CHAR(36) NOT NULL,
    `cvId` CHAR(36) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'received',
    `message` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `applications_jobOfferId_idx`(`jobOfferId`),
    INDEX `applications_candidateId_idx`(`candidateId`),
    UNIQUE INDEX `applications_candidateId_jobOfferId_key`(`candidateId`, `jobOfferId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_audit_logs` (
    `id` CHAR(36) NOT NULL,
    `adminId` CHAR(36) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `entity` VARCHAR(50) NOT NULL,
    `entityId` VARCHAR(100) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_audit_logs_adminId_idx`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `identity_documents` ADD CONSTRAINT `identity_documents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cvs` ADD CONSTRAINT `cvs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_profiles` ADD CONSTRAINT `worker_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_offers` ADD CONSTRAINT `job_offers_recruiterId_fkey` FOREIGN KEY (`recruiterId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_jobOfferId_fkey` FOREIGN KEY (`jobOfferId`) REFERENCES `job_offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_audit_logs` ADD CONSTRAINT `admin_audit_logs_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

