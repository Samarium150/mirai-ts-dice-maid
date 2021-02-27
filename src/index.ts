import Mirai from "mirai-ts";
import config from "./config";

/**
 * Mirai instance
 */
const mirai = new Mirai(config.settings);

/**
 * Main entry point
 */
async function main(): Promise<void> {
    await mirai.link(config.qq);
    mirai.on("message", (msg) => {
        console.log(msg);
        // 复读
        void msg.reply(msg.messageChain);
    });
    mirai.listen();
}

void main();
