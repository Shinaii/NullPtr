import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { prisma } from '@repo/db';
import { checkFileStatus } from '@repo/uploader';
import {EmbedUtils} from "../../lib/utils/embedUtils.ts";
import {dataUtils} from "../../lib/utils/dataUtils.ts";

@ApplyOptions<Subcommand.Options>({
    name: 'download',
    subcommands: [
        { name: 'list', chatInputRun: 'DLList' },
        { name: 'get', chatInputRun: 'DLGet' },
    ],
    description: 'Download command'
})
export class DownloadCommand extends Subcommand {
    public constructor(context: Command.LoaderContext, options: Subcommand.Options) {
        super(context, options);
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('download')
                .setDescription('Download command')
                .addSubcommand((command) =>
                    command
                        .setName('list')
                        .setDescription('List files')
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
        await interaction.deferReply({ flags: 'Ephemeral' });

        const category = interaction.options.getString('category') as string;
        const name = interaction.options.getString('name') as string | null;

        if (!name) {
            const files = await prisma.file.findMany({
                where: {
                    category: category,
                }
            });

            if (files.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('No Files Found')
                    .setDescription('No files found.');
                EmbedUtils.setFooter(embed, interaction);
                return interaction.editReply({ embeds: [embed] });
            }

            const fileNames = files.map((file: { name: any; }) => file.name).join(', ');
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`Files in category ${category}`)
                .setDescription(fileNames);
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        const files = await prisma.file.findMany({
            where: {
                category: { contains: category},
                name: { contains: name}
            }
        });

        if (files.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('File Not Found')
                .setDescription('File not found.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        const fileNames = files.map((file: { name: any; }) => file.name).join(', ');
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('File Found')
            .setDescription(fileNames);
        EmbedUtils.setFooter(embed, interaction);
        return interaction.editReply({ embeds: [embed] });
    }

    public async DLGet(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const category = interaction.options.getString('category')?.toLowerCase() as string;
        const name = interaction.options.getString('name')?.toLowerCase() as string;

        const file = await prisma.file.findFirst({
            where: {
                category: { contains: category},
                name: { contains: name }
            }
        });

        if (!file) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('File Not Found')
                .setDescription('File not found.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        await checkFileStatus(file)
            .then((status) => {

                this.container.logger.debug(`Checking status of file: ${file.metaId}`, status);

                file.lastChecked = new Date();
                prisma.file.update({
                    where: {
                        id: file.id
                    },
                    data: {
                        status: status,
                        lastChecked: file.lastChecked.toISOString()
                    }
                });

                if (!status) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('File Down')
                        .setDescription('Looks like the file you are looking for is down. Please notify an Admin.');
                    EmbedUtils.setFooter(embed, interaction);
                    return interaction.editReply({ embeds: [embed] });
                    // TODO Automatically notify admins
                }
            })
            .catch((error) => {
                this.container.logger.error('Error checking file status:', error);
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Error')
                    .setDescription('Error checking file status.');
                EmbedUtils.setFooter(embed, interaction);
                return interaction.editReply({ embeds: [embed] });
            });

        const interactionTitle = file.category + ' - ' + file.name;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(interactionTitle)
            .setThumbnail(interaction.client.user.avatarURL())
            .setURL(file.url)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? '' })
            .addFields(
                { name: 'File Status', value: file.status ? '✅ **Online**' : '⛔ **Offline**' , inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: '**Size**', value: dataUtils.convertSizeToHumanReadable(file.size), inline: true },
                { name: '**Filetype**', value: file.type.toString(), inline: true },
                { name: '**Last Checked**', value: dataUtils.convertISOToDate(file.lastChecked.toString()), inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: '**Download Link**', value: `[Click Here](${file.url})`, inline: true },
            )
            .setTimestamp()
        EmbedUtils.setFooter(embed, interaction);

        return interaction.editReply({ embeds: [embed] });
    }
}