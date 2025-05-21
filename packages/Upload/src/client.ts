// packages/storage/src/MegaClient.ts
import {Storage} from 'megajs';
import * as fs from 'fs';

let instance: MegaClient | null = null;

export class MegaClient {
    private storage: Storage;
    private readonly userAgent: string;

    private constructor(
        private readonly email: string | undefined,
        private readonly password: string | undefined
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
    }

    static init(email: string | undefined, password: string | undefined): MegaClient {
        if (!instance) {
            instance = new MegaClient(email, password);
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

    public async uploadFile(fileName: string, filePath: string): Promise<any> {
        try {
            const data = fs.createReadStream(filePath);
            const size = fs.statSync(filePath).size;

            const uploadStream = this.storage.upload({
                name: fileName,
                size: size
            });

            data.pipe(uploadStream);

            const file = await uploadStream.complete;

            // @ts-ignore
            const linkFull = await file.link(true) + '#' + file.key.toString('base64');

            function extractMegaIdAndKey(link: string) {
                const match = link.match(/\/file\/([^#]+)#(.+)/);
                if (!match) throw new Error('Invalid MEGA link format');
                return { id: match[1], key: match[2] };
            }

            function toBase64Url(base64: string): string {
                return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            }

            let { id, key } = extractMegaIdAndKey(linkFull);
            id = toBase64Url(id);
            

            return {
                name: file.name,
                size: file.size,
                link: await file.link(true),
                linkFull: linkFull,
                key: key,
                type: file.type,
                label: file.label,
                owner: file.owner,
                downloadId: id,
                timestamp: file.timestamp
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

}
