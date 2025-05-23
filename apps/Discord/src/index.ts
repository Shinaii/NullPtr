import { prisma } from "@repo/db";
import {LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, ActivityType } from 'discord.js';
import '@sapphire/plugin-logger/register';

global.version = require('../package.json').version;

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
    loadMessageCommandListeners: true,
    logger: {
        level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info
    }
});

if(process.env.NODE_ENV === 'development') {
    container.logger.debug("Enabling development mode.");
}

client.once('ready', async () => {
    await prisma.$connect();
    //Check if All Discord Guilds are in the database
    await syncGuildsWithDatabase();

    const activity = async () => {
        const memberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const filesCount = await prisma.file.count();

        client.user?.setActivity({
            name: ` ${filesCount} files and ${memberCount} members`,
            type: ActivityType.Watching,
        });

        container.logger.debug(`Bot is watching over ${filesCount} files and ${memberCount} members.`);
    }
    await activity();
    setInterval(activity, 60000);
});

client.login(process.env.BOT_TOKEN).then(() =>
    container.logger.info("Bot is logged in!")
);

async function syncGuildsWithDatabase() {
    const guilds = await prisma.discordGuild.findMany();
    container.logger.debug(`Found ${guilds.length} Discord Guilds in the database.`);
    const guildIds = guilds.map(guild => guild.GuildId);
    const allGuilds = client.guilds.cache.map(guild => guild.id);
    container.logger.debug(`Found ${allGuilds.length} Discord Guilds in the cache.`);

    // Add missing guilds
    const missingGuilds = allGuilds.filter(guild => !guildIds.includes(guild));
    container.logger.debug(`Found ${missingGuilds.length} missing Discord Guilds in the database.`);
    if (missingGuilds.length > 0) {
        container.logger.debug(`Missing Guilds: ${missingGuilds}`);
        for (const guildId of missingGuilds) {
            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                await prisma.discordGuild.create({
                    data: {
                        GuildId: guild.id,
                        name: guild.name,
                        members: guild.memberCount,
                        createdAt: new Date().toISOString()
                    }
                });
                container.logger.debug(`Added missing Guild ${guild.name} (${guild.id}) to the database.`);
            }
        }
    } else {
        container.logger.debug("No missing Guilds found.");
    }
    const staleGuilds = guildIds.filter(guildId => !allGuilds.includes(guildId));
    if (staleGuilds.length > 0) {
        container.logger.debug(`Removing ${staleGuilds.length} stale Guilds from the database: ${staleGuilds}`);
        await prisma.discordGuild.deleteMany({
            where: {
                GuildId: { in: staleGuilds }
            }
        });
    }
}