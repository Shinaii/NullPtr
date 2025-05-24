import {ApplicationCommandRegistries, container, Listener, RegisterBehavior} from '@sapphire/framework';
import {type Client} from 'discord.js';
import {MegaClient} from "@repo/uploader";

export class ReadyListener extends Listener {
    public run(client: Client) {
        client.user?.setStatus('online');
        ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

        container.logger.debug(`Bot invite link: https://discord.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=8`);

        if(MegaClient.isInstance()) {
            container.logger.debug("MegaClient already exists, skipping creation.");
        } else {
            container.logger.debug("Creating MegaClient instance.");
            MegaClient.init(process.env.MEGA_EMAIL, process.env.MEGA_PASSWORD, process.env.MEGA_FOLDER);
        }
    }
}