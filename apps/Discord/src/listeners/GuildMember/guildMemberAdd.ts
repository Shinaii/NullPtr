import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, GuildMember } from 'discord.js';
import { prisma } from '@repo/db';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberAdd })
export class GuildMemberAddListener extends Listener<typeof Events.GuildMemberAdd> {
    public async run(member: GuildMember) {
        const guild = member.guild;

        try {
            await prisma.discordGuild.update({
                where: {
                    GuildId: guild.id
                },
                data: {
                    members: guild.memberCount,
                }
            });
            this.container.logger.debug(
                `Updated member count for guild ${guild.name} (${guild.id}) in the database.`
            );
        } catch (err) {
            // @ts-ignore
            if (err.code === 'P2025') {
                this.container.logger.warn(`Could not update member count — guild ${guild.id} not found in the database.`);
            } else {
                this.container.logger.error(`Failed to update member count for guild ${guild.id}: ${err}`);
            }
        }
    }
}
