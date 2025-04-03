// utils/embedUtils.ts
import { EmbedBuilder } from 'discord.js';
import { Command } from '@sapphire/framework';

export class EmbedUtils {
    public static setFooter(embed: EmbedBuilder, interaction: Command.ChatInputCommandInteraction): EmbedBuilder {
        return embed.setFooter({ text: 'NullPtr by [Shinaii](https://shinaii.xyz/)', iconURL: interaction.client.user.avatarURL() ?? '' });
    }
}