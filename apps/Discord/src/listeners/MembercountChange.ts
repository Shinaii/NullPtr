import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { prisma } from '@repo/db';

@ApplyOptions<Listener.Options>({})
export class MemberCountChangeListener extends Listener {
    public override run(guild: Guild) {
        this.container.logger.debug(`Member count changed in guild: ${guild.name} (ID: ${guild.id})`);

        prisma.discordGuild.update({
            where: {
                GuildId: guild.id,
            },
            data: {
                members: guild.memberCount,
            }
        }).then(() => {
            this.container.logger.debug(`Updated member count for ${guild.name} in the database.`);
        }).catch((error) => {
            this.container.logger.error(`Failed to update member count for ${guild.name} in the database: ${error}`);
        });
    }

    public async onLoad() {
        this.container.logger.info('MemberCountChangeListener loaded');
    }
}