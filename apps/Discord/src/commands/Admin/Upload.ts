import { Command } from '@sapphire/framework';
import { axiosClient } from "@repo/uploader";
import { upload } from "@repo/uploader";
import * as fs from "node:fs";
import { prisma } from "@repo/db";

export class UploadCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('upload')
                .setDescription('Upload a file')
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

        const user = await prisma.admin.findFirst({
            where: {
                discordId: interaction.user.id,
            }
        });

        if (!user) {
            return interaction.reply({ content: 'You are not an admin.', flags: "Ephemeral" });
        }

        await interaction.reply({content: `Uploading...`, flags: "Ephemeral"});

        const file = interaction.options.getAttachment('file');
        if (!file) {
            return interaction.editReply({ content: 'No file provided.'});
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

            //upload the file
            this.container.logger.debug('Starting file upload:', filePath);
            const uploadResponse = await upload(filePath);
            this.container.logger.debug('Upload response:', uploadResponse);


            /*
            const responseFilePath = `./temp/${file.name}.json`;
            fs.writeFileSync(responseFilePath, JSON.stringify(uploadResponse));
            this.container.logger.debug('Response saved to:', responseFilePath);
            */

            if (uploadResponse.status) {
                const fileUrl = uploadResponse.data.file.url.short;
                this.container.logger.debug('File uploaded successfully:', fileUrl);
                //delete the file
                fs.unlink(filePath, (err) => {
                    if (err) {
                        this.container.logger.error('Error deleting file:', err);
                    }
                });

                //save to db
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


                await interaction.editReply({ content: `File uploaded successfully: ${fileUrl}`});
            } else {
                this.container.logger.error('Error uploading file:', uploadResponse);
                await interaction.editReply({ content: 'Error uploading file.'});
            }
        });
        writer.on('error', (error) => {
            this.container.logger.error('Error downloading file:', error);
            return interaction.editReply({ content: 'Error downloading file.'});
        });
        writer.on('error', (error) => {
            this.container.logger.error('Error downloading file:', error);
            return interaction.editReply({ content: 'Error downloading file.'});
        });
        // @ts-ignore
        await new Promise((resolve) => writer.on('finish', resolve));

    }
}