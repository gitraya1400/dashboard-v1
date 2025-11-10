/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Responden` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Responden_email_key` ON `Responden`(`email`);
