import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { PermissionsBitField, EmbedBuilder } from 'discord.js';
import {EmbedUtils} from "../../utils/embedUtils.ts";

@ApplyOptions<Command.Options>({
	name: 'invite',
	description: 'Get the bot\'s invite link'
})
export class InviteCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		//im lazy to add a check for the permissions so feel free to adjust this
		const inviteLink = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user?.id}&permissions=${PermissionsBitField.Flags.Administrator}&scope=bot%20applications.commands`;

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Invite Link')
			.setDescription(`Invite me to your server using [this link](${inviteLink}).`)
			.setTimestamp()
		EmbedUtils.setFooter(embed, interaction);

		return interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
	}
}