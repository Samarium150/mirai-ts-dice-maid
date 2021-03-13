/**
 * Copyright (c) 2020-2021 Samarium
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>
 *
 * @module index
 */
import {Logger, Mirai} from "mirai-ts";
import config from "../config/mirai-config.json";
import Maid from "./Maid";
import XRegExp from "xregexp";
import {GroupMessage} from "mirai-ts/dist/types/message-type";
import {MemberJoinRequestOperationType, NewFriendRequestOperationType} from "mirai-ts/dist/mirai-api-http/resp";
import {Member} from "mirai-ts/dist/types/contact";

/**
 * Mirai and Logger instance
 */
const mirai = new Mirai(config["settings"]),
    logger = new Logger({prefix: "[dice-maid]"});

/**
 * Main entry point
 */
async function main(): Promise<void> {
    Maid.updateConfig();
    await mirai.link(config["qq"]);
    mirai.on("message", async (msg) => {
        logger.info(`收到消息: ${JSON.stringify(msg, null, 2)}`);
        const hidden = msg.type == "GroupMessage" && XRegExp.test(msg.plain, XRegExp(`^\\${Maid.getConfig().prefix}h`)),
            quit = msg.type == "GroupMessage" && XRegExp.test(msg.plain, XRegExp(`^\\${Maid.getConfig().prefix}dismiss$`)),
            result = Maid.command(msg);
        if (quit) {
            void msg.reply("摸了摸了");
            await mirai.api.quit((msg.sender as Member).group.id);
            return;
        }
        if (hidden && result) {
            void msg.reply(`${(msg as GroupMessage).sender.memberName}进行了一次暗骰`);
            await mirai.api.sendTempMessage(result, msg.sender.id, (msg.sender as Member).group.id, 0);
        } else if (result)
            void msg.reply(result);
    });
    mirai.on("NewFriendRequestEvent", (request) => {
        void request.respond(NewFriendRequestOperationType.Accept);
    });
    mirai.on("MemberJoinRequestEvent", (request) => {
        void request.respond(MemberJoinRequestOperationType.Accept);
    });
    mirai.listen();
}

void main();
