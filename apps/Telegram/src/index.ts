import { Bot } from "grammy";


//First time using GrammY so i gonna comment everything since i don't know shit about it
const bot = new Bot(<string>process.env.BOT_TOKEN);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.on("message", (ctx) => ctx.reply("Got another message!"));

bot.start();