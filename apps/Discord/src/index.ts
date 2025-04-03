import { prisma } from "@repo/db";
import {LogLevel, SapphireClient, container, ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { GatewayIntentBits, ActivityType } from 'discord.js';
import '@sapphire/plugin-logger/register';

const client = new SapphireClient({
    intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    loadMessageCommandListeners: true,
    logger: {
        level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info
    }
});

client.once('ready', async () => {
    client.user?.setStatus('online');
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
    await prisma.$connect();

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

client.login(process.env.BOT_TOKEN).then(r =>
    container.logger.info("Bot is logged in!")
);
