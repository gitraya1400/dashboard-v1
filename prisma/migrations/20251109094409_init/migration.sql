/*
  Warnings:

  - You are about to drop the `file` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `file`;

-- CreateTable
CREATE TABLE `Responden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tautan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tautanForm` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `isUsed` INTEGER NOT NULL,
    `idResponden` INTEGER NOT NULL,
    `activeAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tautan` ADD CONSTRAINT `Tautan_idResponden_fkey` FOREIGN KEY (`idResponden`) REFERENCES `Responden`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
