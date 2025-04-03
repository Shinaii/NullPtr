import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';

export const OWNER_IDS = (process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : []).concat('1354797488359477390');

export class OwnerOnlyPrecondition extends Precondition {
	public override messageRun(message: Message) {
		return this.checkOwner(message.author.id);
	}

	public override chatInputRun(interaction: ChatInputCommandInteraction) {
		return this.checkOwner(interaction.user.id);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.checkOwner(interaction.user.id);
	}

	private checkOwner(userId: string) {
		return OWNER_IDS.includes(userId)
			? this.ok()
			: this.error({ message: 'You are not authorized to use this command.' });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}