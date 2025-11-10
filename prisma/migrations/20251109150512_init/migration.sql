/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Tautan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Tautan_token_key` ON `Tautan`(`token`);
