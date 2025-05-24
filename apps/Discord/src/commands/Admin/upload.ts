import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import * as axios from 'axios';
import * as fs from "node:fs";
import { prisma } from "@repo/db";
import { EmbedBuilder } from 'discord.js';
import { EmbedUtils } from '../../lib/utils/embedUtils';
import {MegaClient} from "@repo/uploader";

@ApplyOptions<Command.Options>({
    name: 'upload',
    description: 'Upload a file',
    preconditions: [['AdminOnly']]
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

        try {
            const megaClient = MegaClient.getInstance();
            const response = await axios.default.get(file.url, {
                responseType: 'stream',
            });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                // @ts-ignore
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            this.container.logger.debug('Starting file upload to MEGA:', filePath);
            const megaData = await megaClient.uploadFile(file.name, filePath, interaction.options.getString('category'));
            this.container.logger.debug('File uploaded successfully:', megaData.link);
            // Save to DB
            await prisma.file.create({
                data: {
                    category: interaction.options.getString('category') || '',
                    name: interaction.options.getString('name') || '',
                    url: megaData.link,
                    encryptionKey: megaData.key,
                    metaId: megaData.downloadId,
                    size: fs.statSync(filePath).size,
                    type: fileType,
                    status: true,
                    lastChecked: new Date().toISOString(),
                    date: new Date().toISOString(),
                }
            });

            fs.unlink(filePath, err => {
                if (err) this.container.logger.error('Error deleting temp file:', err);
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Success')
                .setDescription(`File uploaded successfully: [${file.name}](${megaData.linkFull})`);
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            this.container.logger.error('Error handling file upload:', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('There was an error uploading your file.');
            EmbedUtils.setFooter(embed, interaction);
            return interaction.editReply({ embeds: [embed] });
        }
    }
}