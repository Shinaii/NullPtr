import { Bot } from "gramio"
import { config } from "./config.ts"

export const bot = new Bot(config.BOT_TOKEN)
    .command("start", (context) => context.send("Hi!"))
    .onStart(({ info }) => console.log(`✨ Bot ${info.username} was started!`));