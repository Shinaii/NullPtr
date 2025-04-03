import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { prisma } from '@repo/db';
import { OWNER_IDS } from './OwnerOnly.ts';

export class AdminOnlyPrecondition extends Precondition {
    public override messageRun(message: Message) {
        return this.checkAdminOrOwner(message.author.id);
    }

    public override chatInputRun(interaction: ChatInputCommandInteraction) {
        return this.checkAdminOrOwner(interaction.user.id);
    }

    public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
        return this.checkAdminOrOwner(interaction.user.id);
    }

    private async checkAdminOrOwner(userId: string) {
        if (OWNER_IDS.includes(userId)) {
            return this.ok();
        }

        const admin = await prisma.admin.findFirst({
            where: {
                discordId: userId
            }
        });

        return admin
            ? this.ok()
            : this.error({ message: 'You are not authorized to use this command.' });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        AdminOnly: never;
    }
}