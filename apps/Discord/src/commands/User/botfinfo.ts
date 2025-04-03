import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { PermissionsBitField, EmbedBuilder } from 'discord.js';
import {EmbedUtils} from "../../utils/embedUtils.ts";

@ApplyOptions<Command.Options>({
	name: 'botinfo',
	description: 'Display Information about the Bot'
})
export class BotinfoCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const embed = new EmbedBuilder()
			.setColor(0xA020F0)
			.setTitle('Botinfo | NullPtr')
			.setDescription(`NullPtr is a cross-platform tool for downloading and managing files from anonymous sources. It is designed to be fast, efficient, and easy to use.`)
			.setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL() ?? ''})
			.setURL('https://github.com/Shinaii/NullPtr')
			.setTimestamp()
		EmbedUtils.setFooter(embed, interaction);

		return interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
	}
}