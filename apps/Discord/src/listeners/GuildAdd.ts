import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { prisma } from '@repo/db';

@ApplyOptions<Listener.Options>({})
export class GuildAddListener extends Listener {
    public override run(guild: Guild) {
        this.container.logger.info(`Joined a new guild: ${guild.name} (ID: ${guild.id})`);

		prisma.discordGuild.create({
			data: {
				GuildId: guild.id,
				name: guild.name,
				members: guild.memberCount,
			}
		}).then(() => {
			this.container.logger.info(`Added ${guild.name} to the database.`);
		}).catch((error) => {
			this.container.logger.error(`Failed to add ${guild.name} to the database: ${error}`);
		});

		if (guild.available) {
			this.container.logger.info(`Guild is available: ${guild.name}`);
		} else {
			this.container.logger.warn(`Guild is not available: ${guild.name}`);
		}
    }

    public async onLoad() {
        this.container.logger.info('GuildAddListener loaded');
    }
}