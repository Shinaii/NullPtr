export {};

declare global {
    namespace NodeJS {
        interface Global {
            version: string;
        }
    }

    var version: string;
}
