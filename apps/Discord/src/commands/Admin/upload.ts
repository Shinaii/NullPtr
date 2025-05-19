import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { axiosClient } from "@repo/uploader";
import { upload } from "@repo/uploader";
import * as fs from "node:fs";
import { prisma } from "@repo/db";
import { EmbedBuilder } from 'discord.js';
import { EmbedUtils } from '../../lib/utils/embedUtils';

// Extend axiosClient timeout to 30 seconds
axiosClient.defaults.timeout = 30000; 

@ApplyOptions<Command.Options>({
    name: 'upload',
    description: 'Upload a file',
    preconditions: [['AdminOnly', "OwnerOnly"]]
})
export class UploadCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addAttachmentOption((option) =>
                    option.setName('file').setDescription('File to upload').setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('category').setDescription('Category of the file e.g. [AP1]').setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('name').setDescription('Name of the file e.g. [FJ 2025]').setRequired(true)
                )
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const file = interaction.options.getAttachment('file');
        if (!file) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('No file provided.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }

        const filePath = `./temp/${file.name}`;
        const fileType = file.contentType || 'application/octet-stream';

        if (!fs.existsSync('./temp')) {
            fs.mkdirSync('./temp');
        }
        const response = await axiosClient.get(file.url, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        writer.on('finish', async () => {
            this.container.logger.debug('Starting file upload:', filePath);
            const uploadResponse = await upload(filePath);
            this.container.logger.debug('Upload response:', uploadResponse);

            if (uploadResponse.status) {
                const fileUrl = uploadResponse.data.file.url.short;
                this.container.logger.debug('File uploaded successfully:', fileUrl);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        this.container.logger.error('Error deleting file:', err);
                    }
                });

                await prisma.file.create({
                    data: {
                        category: interaction.options.getString('category') || '',
                        name: interaction.options.getString('name') || '',
                        url: uploadResponse.data.file.url.short,
                        metaId: uploadResponse.data.file.metadata.id,
                        size: parseInt(uploadResponse.data.file.metadata.size.bytes),
                        type: fileType,
                        status: uploadResponse.status,
                        lastChecked: new Date().toISOString(),
                        date: new Date().toISOString(),
                    }
                });

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('Success')
                    .setDescription(`File uploaded successfully: [${file.name}](${fileUrl})`);
                EmbedUtils.setFooter(embed, interaction);
                await interaction.editReply({ embeds: [embed] });
            } else {
                this.container.logger.error('Error uploading file:', uploadResponse);
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Error')
                    .setDescription('Error uploading file.');
                EmbedUtils.setFooter(embed, interaction);
                await interaction.editReply({ embeds: [embed] });
            }
        });
        writer.on('error', (error) => {
            this.container.logger.error('Error downloading file:', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('Error downloading file.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        });
    }
}