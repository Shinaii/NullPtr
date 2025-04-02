import { bot } from "./bot.ts"
import { server } from "./webhook.ts"
const signals = ["SIGINT", "SIGTERM"];

for (const signal of signals) {
    process.on(signal, async () => {
        console.log(`Received ${signal}. Initiating graceful shutdown...`);
        server.stop()
        await bot.stop()
        process.exit(0);
    })
}
    
process.on("uncaughtException", (error) => {
    console.error(error);
})

process.on("unhandledRejection", (error) => {
    console.error(error);
})
    
await bot.start();