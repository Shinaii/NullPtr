import { Subcommand } from "@sapphire/plugin-subcommands";
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from "discord.js";
import { prisma } from "@repo/db";
import {checkFileStatus} from "@repo/uploader";

export class DownloadCommand extends Subcommand {
    constructor(context: Command.LoaderContext , options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'download',
            subcommands: [
                { name: 'list',  chatInputRun: 'DLList' },
                { name: 'get', chatInputRun: 'DLGet' },
            ]
        });
    }

    registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('download')
                .setDescription('download command')
                .addSubcommand((command) =>
                    command
                        .setName('list')
                        .setDescription('List Admins')
                        .addStringOption((option) =>
                        option
                            .setName('category')
                            .setDescription('Category of the file e.g. [AP1]')
                            .setRequired(true)
                        )
                        .addStringOption((option) =>
                            option
                                .setName('name')
                                .setDescription('Name of the file e.g. [FJ 2025]')
                                .setRequired(false)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName('get')
                        .setDescription('Get a download link for a file')
                        .addStringOption((option) =>
                        option
                            .setName('category')
                            .setDescription('Category of the file e.g. [AP1]')
                            .setRequired(true)
                        )
                        .addStringOption((option) =>
                            option
                                .setName('name')
                                .setDescription('Name of the file e.g. [FJ 2025]')
                                .setRequired(true)
                        )
                )
        );
    }

    public async DLList(interaction: Command.ChatInputCommandInteraction) {
        const category = interaction.options.getString('category') as string;
        const name = interaction.options.getString('name') as string | null;

        if (!name) {
            const files = await prisma.file.findMany({
                where: {
                    category: category,
                }
            });

            if (files.length === 0) {
                return interaction.reply({ content: 'No files found.', flags: "Ephemeral" });
            }

            const fileNames = files.map((file: { name: any; }) => file.name).join(', ');
            return interaction.reply({ content: `Files in category ${category}: ${fileNames}` , flags: "Ephemeral"});
        }

        const files = await prisma.file.findMany({
            where: {
                category: category,
                name: name
            }
        });

        if (files.length === 0) {
            return interaction.reply({ content: 'File not found.' , flags: "Ephemeral"});
        }

        const fileNames = files.map((file: { name: any; }) => file.name).join(', ');
        return interaction.reply({ content: `File found: ${fileNames}`, flags: "Ephemeral"});
    }

    public async DLGet(interaction: Command.ChatInputCommandInteraction) {
        const category = interaction.options.getString('category') as string;
        const name = interaction.options.getString('name') as string;

        const file = await prisma.file.findFirst({
            where: {
                category: category,
                name: name
            }
        });

        if (!file) {
            return interaction.reply({ content: 'File not found.', flags: "Ephemeral"});
        }

        //Check if link is still up or down
        await checkFileStatus(file.metaId)
            .then((status) => {
                if (!status) {
                    interaction.reply({ content: 'Looks like the file you are looking for is down...', flags: "Ephemeral"});
                    return interaction.reply({ content: 'Please notify an Admin.', flags: "Ephemeral"})
                    //TODO Automatically notify admins
                }
            })
            .catch((error) => {
                this.container.logger.error('Error checking file status:', error);
                return interaction.reply({ content: 'Error checking file status.', flags: "Ephemeral"});
            });

        const interactiontitle = category + ' - ' + name;

        // @ts-ignore
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(interactiontitle)
            .setURL(file.url)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? '' })
            .addFields(
                { name: 'Download Link', value: file.url},
                { name: '\u200B', value: '\u200B' },
                { name: 'Size', value: file.size.toString(), inline: true },
                { name: 'Filetype', value: file.type.toString(), inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'NullPtr by Shinaii', iconURL: interaction.client.user.avatarURL() ?? '' , });


        return interaction.reply({ embeds: [embed], flags: "Ephemeral" });

        //return interaction.reply({ content: `Download link: ${file.url}`, flags: "Ephemeral"});
    }

}