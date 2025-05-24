// packages/storage/src/MegaClient.ts
import {Storage} from 'megajs';
import * as fs from 'fs';

let instance: MegaClient | null = null;

export class MegaClient {
    private storage: Storage;
    private folderNode: any;
    private readonly userAgent: string;
    private uploadFolderNode: any;

    private constructor(
        private readonly email: string | undefined,
        private readonly password: string | undefined,
        private readonly folder: string | undefined
    ) {
        //if email and password undefined throw error
        if (!email || !password) {
            throw new Error('Email and password are required to initialize MegaClient.');
        }
        this.userAgent = 'NullPtr/1.0 (Github.com/Shinaii/NullPtr)';
        this.storage = new Storage({
            email: this.email as string,
            password: this.password as string,
            autologin: true,
            keepalive: true,
            userAgent: this.userAgent,
        });

this.storage.on('ready', async () => {
    if (this.folder) {
        // Wait until folderNode is available
        let attempts = 0;
        const maxAttempts = 20;
        const delay = 200; // ms
        // @ts-ignore
        this.folderNode = this.storage.find(this.folder);
        while (!this.folderNode && attempts < maxAttempts) {
            await new Promise(res => setTimeout(res, delay));
            // @ts-ignore
            this.folderNode = this.storage.find(this.folder);
            attempts++;
        }
        if (!this.folderNode) {
            this.storage.mkdir(this.folder);
            // Wait again after mkdir
            attempts = 0;
            // @ts-ignore
            this.folderNode = this.storage.find(this.folder);
            while (!this.folderNode && attempts < maxAttempts) {
                await new Promise(res => setTimeout(res, delay));
                // @ts-ignore
                this.folderNode = this.storage.find(this.folder);
                attempts++;
            }
        }
    }
});
    }

    static init(email: string | undefined, password: string | undefined, folder: string | undefined): MegaClient {
        if (!instance) {
            instance = new MegaClient(email, password, folder);
        }
        return instance;
    }

    static isInstance(): boolean {
        return instance !== null;
    }

    static getInstance(): MegaClient {
        if (!instance) {
            throw new Error('MegaClient has not been initialized. Call MegaClient.init() first.');
        }
        return instance;
    }

public async validateUploadFolder(Category: string | null): Promise<any> {
    if (Category != null) {
        // @ts-ignore
        this.uploadFolderNode = this.folderNode.find(Category);
        if (!this.uploadFolderNode) {
            this.folderNode.mkdir(Category);
            // polling for folder
            const maxAttempts = 10;
            const delay = 200; // ms
            for (let i = 0; i < maxAttempts; i++) {
                // @ts-ignore
                this.uploadFolderNode = this.folderNode.find(Category);
                if (this.uploadFolderNode) break;
                await new Promise(res => setTimeout(res, delay));
            }
        }
        return this.uploadFolderNode;
    }
    return null;
}

    private extractMegaIdAndKey(link: string) {
        const match = link.match(/\/file\/([^#]+)#(.+)/);
        if (!match) throw new Error('Invalid MEGA link format');
        return {id: match[1], key: match[2]};
    }

    private toBase64Url(base64: string): string {
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    public async uploadFile(fileName: string, filePath: string, Category: string | null): Promise<any> {
        try {

            const uploadFolderOK = await this.validateUploadFolder(Category)

            const data = fs.createReadStream(filePath);
            const size = fs.statSync(filePath).size;

            if(uploadFolderOK) {
                const uploadStream = this.uploadFolderNode.upload({
                    name: fileName,
                    size: size
                });

                data.pipe(uploadStream);

                const file = await uploadStream.complete;

                // @ts-ignore
                const base64Key = file.key.toString('base64');
                const base64KeyURL = this.toBase64Url(base64Key);
                const linkFull = await file.link(true) + '#' + base64KeyURL;
                let {id, key} = this.extractMegaIdAndKey(linkFull);


                return {
                    name: file.name,
                    size: file.size,
                    link: await file.link(true),
                    linkFull: linkFull,
                    key: base64KeyURL,
                    type: file.type,
                    label: file.label,
                    owner: file.owner,
                    downloadId: id,
                    timestamp: file.timestamp
                };
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

}
