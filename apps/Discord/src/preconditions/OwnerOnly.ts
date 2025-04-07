import { Precondition } from '@sapphire/framework';
import type{
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	Message,
	Snowflake
} from 'discord.js';

export const OWNER_IDS = (process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : []).concat('161504025722880000');

export class UserPrecondition extends Precondition {
	public override messageRun(message: Message) {
		return this.checkOwner(message.author.id);
	}

	public override chatInputRun(interaction: ChatInputCommandInteraction) {
		return this.checkOwner(interaction.user.id);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.checkOwner(interaction.user.id);
	}

	private checkOwner(userId: Snowflake) {
		return OWNER_IDS.includes(userId)
			? this.ok()
			: this.error({ message: 'Only the Owner of this Bot can execute this command.' });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}