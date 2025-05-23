import {container, Listener} from '@sapphire/framework';
import { Events, type Guild } from 'discord.js';
import {prisma} from "@repo/db";

export class GuildCreateListener extends Listener<typeof Events.GuildCreate> {
    public async run(guild: Guild) {
        try {
            this.container.logger.info(`Joined new guild: ${guild.name} (ID: ${guild.id})`);

            await prisma.discordGuild.create({
                data: {
                    GuildId: guild.id,
                    name: guild.name,
                    members: guild.memberCount,
                    createdAt: new Date().toISOString()
                }
            });
            container.logger.debug(`Added new guild ${guild.name} (${guild.id}) to the database.`);
        } catch (err) {
            // @ts-ignore
            if (err.code === 'P2025') {
                this.container.logger.warn(`Tried to create guild ${guild.id}, but it already exists in the database.`);
            } else {
                this.container.logger.error(`Failed to create guild ${guild.id}: ${err}`);
            }
        }
    }
}

export class GuildDeleteListener extends Listener<typeof Events.GuildDelete> {
    public async run(guild: Guild) {
        this.container.logger.info(`Left guild: ${guild.name} (ID: ${guild.id})`);

        try {
            await prisma.discordGuild.delete({
                where: {
                    GuildId: guild.id
                }
            });

            container.logger.debug(`Removed guild ${guild.name} (${guild.id}) from the database.`);
        } catch (err) {
            // @ts-ignore
            if (err.code === 'P2025') {
                this.container.logger.warn(`Tried to delete guild ${guild.id}, but it wasn't found in the database.`);
            } else {
                this.container.logger.error(`Failed to delete guild ${guild.id}: ${err}`);
            }
        }
    }
}


export class GuildUpdateListener extends Listener<typeof Events.GuildUpdate> {
    public async run(oldGuild: Guild, newGuild: Guild) {
        if (oldGuild.name !== newGuild.name) {
            try {
                this.container.logger.info(
                    `Guild name changed: "${oldGuild.name}" → "${newGuild.name}"`
                );
                await prisma.discordGuild.update({
                    where: {
                        GuildId: newGuild.id
                    },
                    data: {
                        name: newGuild.name
                    }
                });
                container.logger.debug(`Updated guild name in the database: ${oldGuild.name} (${oldGuild.id}) → ${newGuild.name}`);
            } catch (err) {
                // @ts-ignore
                if (err.code === 'P2025') {
                    this.container.logger.warn(`Tried to update guild ${newGuild.id}, but it wasn't found in the database.`);
                } else {
                    this.container.logger.error(`Failed to update guild ${newGuild.id}: ${err}`);
                }
            }
        }
    }
}

