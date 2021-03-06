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
import Mirai from "mirai-ts";
import config from "../config/mirai-config.json";
import Maid from "./Maid";
import XRegExp from "xregexp";
import {GroupMessage} from "mirai-ts/dist/types/message-type";

/**
 * Mirai instance
 */
const mirai = new Mirai(config["settings"]);

/**
 * Main entry point
 */
async function main(): Promise<void> {
    Maid.updateConfig();
    await mirai.link(config["qq"]);
    mirai.on("message", (msg) => {
        console.log(msg);
        const hidden = msg.type == "GroupMessage" && XRegExp.test(msg.plain, XRegExp(`^\\${Maid.getConfig().prefix}h`));
        const result = Maid.command(msg);
        if (hidden && result) {
            void msg.reply(`${(msg as GroupMessage).sender.memberName}进行了一次暗骰`);
            void mirai.api.sendFriendMessage(result, msg.sender.id, 0);
        }
        else if (result)
            void msg.reply(result);
    });
    mirai.listen();
}

void main();
