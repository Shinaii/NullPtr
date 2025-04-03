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
		const membercount = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

		const embed = new EmbedBuilder()
			.setColor(0xA020F0)
			.setTitle('Botinfo')
			.setThumbnail(interaction.client.user.avatarURL())
			.setDescription(`NullPtr is a cross-platform tool for downloading and managing files from anonymous sources. It is designed to be fast, efficient, and easy to use.`)
			.setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL() ?? ''})
			.setURL('https://github.com/Shinaii/NullPtr')
			.setFields(
				{ name: 'RAM Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
				{ name: 'CPU Usage', value: `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)}%`, inline: true },
				{ name: 'Uptime', value: `${Math.floor(process.uptime() / 60)} minutes`, inline: true },
				{ name: 'Users', value: `${membercount}`, inline: true },
				{ name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
				{ name: 'Contributing', value: '[GitHub](https://github.com/Shinaii/NullPtr)', inline: true },
				{ name: 'Ping', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
				{ name: 'Special Thanks', value: 'None', inline: true }
			)

			.setTimestamp()
		EmbedUtils.setFooter(embed, interaction);

		return interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
	}
}