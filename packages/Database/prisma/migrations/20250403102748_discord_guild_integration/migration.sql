-- CreateTable
CREATE TABLE "DiscordGuild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "GuildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "members" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordGuild_GuildId_key" ON "DiscordGuild"("GuildId");
