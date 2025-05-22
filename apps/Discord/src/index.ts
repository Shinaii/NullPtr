import { prisma } from "@repo/db";
import {LogLevel, SapphireClient, container, ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { GatewayIntentBits, ActivityType } from 'discord.js';
import '@sapphire/plugin-logger/register';
import {MegaClient} from "@repo/uploader";

global.version = require('../package.json').version;

const client = new SapphireClient({
    intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    loadMessageCommandListeners: true,
    logger: {
        level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info
    }
});

if(process.env.NODE_ENV === 'development') {
    container.logger.debug("Enabling development mode.");
}

client.once('ready', async () => {
    client.user?.setStatus('online');
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

    container.logger.debug(`Bot invite link: https://discord.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=8`);

    if(MegaClient.isInstance()) {
        container.logger.debug("MegaClient already exists, skipping creation.");
    } else {
        container.logger.debug("Creating MegaClient instance.");
        MegaClient.init(process.env.MEGA_EMAIL, process.env.MEGA_PASSWORD, process.env.MEGA_FOLDER);
    }




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
