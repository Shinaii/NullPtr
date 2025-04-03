import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { prisma } from '@repo/db';

@ApplyOptions<Listener.Options>({})
export class GuildRemoveListener extends Listener {
    public override run(guild: Guild) {
        this.container.logger.info(`Left a guild: ${guild.name} (ID: ${guild.id})`);

        prisma.discordGuild.delete({
            where: {
                GuildId: guild.id,
            }
        }).then(() => {
            this.container.logger.info(`Removed ${guild.name} from the database.`);
        }).catch((error) => {
            this.container.logger.error(`Failed to remove ${guild.name} from the database: ${error}`);
        });
    }

    public async onLoad() {
        this.container.logger.info('GuildRemoveListener loaded');
    }
}