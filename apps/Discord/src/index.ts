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
    client.user?.setActivity('files', {
        type: ActivityType.Streaming
    });

    client.user?.setStatus('online');
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
    await prisma.$connect();
});

client.login(process.env.BOT_TOKEN).then(r =>
    container.logger.info("Bot is logged in!")
);
