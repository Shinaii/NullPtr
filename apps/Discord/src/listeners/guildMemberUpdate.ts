import {container, Listener} from '@sapphire/framework';
import {Events, type Guild, type GuildMember} from 'discord.js';
import {prisma} from "@repo/db";

export class GuildMemberAddListener extends Listener<typeof Events.GuildMemberAdd> {
    // @ts-ignore
    public async run(guild: Guild) {

        await prisma.discordGuild.update({
            where: {
                GuildId: guild.id
            },
            data: {
                members: guild.memberCount,
            }
        });
        container.logger.debug(`Updated member count for guild ${guild.name} (${guild.id}) in the database.`);
    }
}

export class GuildMemberRemoveListener extends Listener<typeof Events.GuildMemberRemove> {
    public async run(member: GuildMember): Promise<void> {
        if (member.user.bot) return; // Ignore bots

        const guild = member.guild;

        try {
            await prisma.discordGuild.update({
                where: {
                    GuildId: guild.id
                },
                data: {
                    members: guild.memberCount
                }
            });

            this.container.logger.debug(`Updated member count for guild ${guild.name} (${guild.id}) in the database.`);
        } catch (error) {
            // @ts-ignore
            if (error.code === 'P2025') {
                this.container.logger.warn(`Guild not found in database: ${guild.id}`);
            } else {
                this.container.logger.error(`Error updating member count for ${guild.id}: ${error}`);
            }
        }
    }
}
