import axios from 'axios';
import FormData from 'form-data';
import * as fs from "node:fs";

const globalForAxios = global as unknown as { axiosClient: ReturnType<typeof axios.create> };

const axiosClient = globalForAxios.axiosClient || axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

if (process.env.NODE_ENV !== 'production') globalForAxios.axiosClient = axiosClient;

export const upload = async (filePath: string) => {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const response = await axiosClient.post('https://anonymfile.com/api/v1/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        return false;
    }
};

export const checkFileStatus = async (file: any) => {
    try {
        const response = await axiosClient.get(`https://anonymfile.com/api/v1/file/${file.metaId}/info`);
        return response.data.status;
    } catch (error) {
        console.error('Error checking file status:', error);
        return false;
    }
};

export { axiosClient };