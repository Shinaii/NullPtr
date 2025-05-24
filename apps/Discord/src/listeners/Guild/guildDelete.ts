import {container, Listener} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, type Guild } from 'discord.js';
import {prisma} from "@repo/db";

@ApplyOptions<Listener.Options>({ event: Events.GuildDelete })
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
