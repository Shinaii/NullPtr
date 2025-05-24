import {container, Listener} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, type Guild } from 'discord.js';
import {prisma} from "@repo/db";

@ApplyOptions<Listener.Options>({ event: Events.GuildCreate })
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