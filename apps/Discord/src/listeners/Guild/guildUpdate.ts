import {container, Listener} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, type Guild } from 'discord.js';
import {prisma} from "@repo/db";

@ApplyOptions<Listener.Options>({ event: Events.GuildUpdate })
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

