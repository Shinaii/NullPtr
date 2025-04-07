import { AllFlowsPrecondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { prisma } from '@repo/db';

export class UserPrecondition extends AllFlowsPrecondition {

    public override messageRun(message: Message) {
        return this.checkAdmin(message.author.id);
    }

    public override chatInputRun(interaction: ChatInputCommandInteraction) {
        return this.checkAdmin(interaction.user.id);
    }

    public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
        return this.checkAdmin(interaction.user.id);
    }

    private async checkAdmin(userId: Snowflake) {
        try {
            const admin = await prisma.admin.findFirst({
                where: {
                    discordId: userId
                }
            });
            return admin ? this.ok() : this.error({ message: `Only an Admin of this Bot can execute this command.`});
        } catch (error) {
            // @ts-ignore
            this.container.logger.error(`checkAdmin: Error checking admin status for user ${userId}: ${error.message}`);
            return this.error({ message: 'An error occurred while checking your permissions.' });
        }
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        AdminOnly: never;
    }
}