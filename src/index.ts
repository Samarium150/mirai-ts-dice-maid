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
import Mirai, {
    Logger,
    Message,
    MiraiApiHttpSetting,
    UserProfile,
    BotInvitedJoinGroupRequestOperationType,
    NewFriendRequestOperationType,
    check,
    MessageType,
    Contact
} from "mirai-ts";
import config from "../config/mirai-config.json";
import Maid from "./Maid";
import XRegExp from "xregexp";
import { FileLogger, checkAndMakeDir } from "./utils";
import path from "path";
// import { load } from "js-yaml";
// import fs from "fs-extra";

const { isAt } = check;
type Friend = Contact.Friend;
type Member = Contact.Member;
type MessageChain = MessageType.MessageChain;
type ChatMessage = MessageType.ChatMessage;

/**
 * Mirai and Logger instance
 */
const logger = new Logger({ prefix: "[dice-maid]" });
let settings: MiraiApiHttpSetting;
try {
    settings = config.settings as unknown as MiraiApiHttpSetting;
} catch (e) {
    logger.error(e);
    process.exit(1);
}
const mirai = new Mirai(settings);

/**
 * Prepare working environment
 *
 * @param instance
 * @param friendsLoggers
 * @param groupsLoggers
 */
async function prepare(
    instance: Mirai,
    friendsLoggers: Map<number, FileLogger>,
    groupsLoggers: Map<number, FileLogger>
): Promise<UserProfile> {
    const logPath = path.resolve("logs");
    const logFriendsPath = path.join(logPath, "friends");
    const logGroupPath = path.join(logPath, "groups");
    const logTempPath = path.join(logPath, "temp");
    checkAndMakeDir(logPath);
    checkAndMakeDir(logFriendsPath);
    checkAndMakeDir(logGroupPath);
    checkAndMakeDir(logTempPath);
    const friends = (await instance.api.friendList()).data;
    friends.forEach(friend => {
        friendsLoggers.set(friend.id, new FileLogger(path.join(logFriendsPath, `${friend.id}.log`)));
    });
    const groups = (await instance.api.groupList()).data;
    groups.forEach(group => {
        groupsLoggers.set(group.id, new FileLogger(path.join(logGroupPath, `${group.id}.log`)));
    });
    return instance.api.botProfile();
}

/**
 * Serialize MessageChain for logging
 *
 * @param messageChain
 */
function serializeMessageChain(messageChain: MessageChain): string {
    return messageChain.map(message => `${message.type}(${
        Object.entries(message)
            .filter((entry => entry[0] != "type"))
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join(", ")
    })`).join("->");
}

/**
 * Handle message event
 *
 * @param message
 * @param friendsLoggers
 * @param groupsLoggers
 * @param tempLoggers
 * @param self
 */
async function handle(
    message: ChatMessage,
    friendsLoggers: Map<number, FileLogger>,
    groupsLoggers: Map<number, FileLogger>,
    tempLoggers: Map<number, FileLogger>,
    self: string
): Promise<void> {
    logger.info(`收到消息: ${JSON.stringify(message, null, 2)}`);
    const { type, sender, messageChain, plain } = message;
    let hidden: boolean | undefined, quit: boolean | undefined, fileLogger: FileLogger | undefined;
    switch (type) {
        case "FriendMessage": {
            hidden = false;
            quit = false;
            fileLogger = friendsLoggers.get(sender.id);
            fileLogger?.log(
                `${(sender as Friend).nickname}/${sender.id}`,
                serializeMessageChain(messageChain)
            );
            break;
        }
        case "GroupMessage": {
            hidden = XRegExp.test(plain, XRegExp(`^\\${Maid.getConfig().prefix}h`));
            quit = XRegExp.test(plain, XRegExp(`^\\${Maid.getConfig().prefix}dismiss$`))
                && (isAt(message, config["qq"]) as boolean);
            fileLogger = groupsLoggers.get((sender as Member).group.id);
            fileLogger?.log(
                `${(sender as Member).memberName}/${sender.id}`,
                serializeMessageChain(messageChain)
            );
            break;
        }
        case "TempMessage": {
            hidden = false;
            quit = false;
            if (!(fileLogger = tempLoggers.get(sender.id))) {
                fileLogger = new FileLogger(path.join(path.resolve("logs"), "temp", `${sender.id}.log`));
                tempLoggers.set(sender.id, fileLogger);
            }
            break;
        }
        default:
    }
    const result = Maid.command(message);
    if (quit) {
        const reply: MessageChain = [Message.Plain("摸了摸了")];
        await message.reply(reply);
        fileLogger?.log(
            self,
            serializeMessageChain(reply)
        );
        await mirai.api.quit((sender as Member).group.id);
        return;
    }
    if (hidden && result) {
        const reply: MessageChain = [Message.Plain(`${(sender as Member).memberName}进行了一次暗骰`)];
        await message.reply(reply);
        fileLogger?.log(
            self,
            serializeMessageChain(reply)
        );
        await mirai.api.sendTempMessage(result, (sender as Member).id, (sender as Member).group.id);
        if (!(fileLogger = tempLoggers.get(sender.id)))
            fileLogger = friendsLoggers.get(sender.id);
        fileLogger?.log(
            self,
            serializeMessageChain([Message.Plain(result)] as MessageChain)
        );
    } else if (result) {
        await message.reply(result);
        fileLogger?.log(
            self,
            serializeMessageChain([Message.Plain(result)] as MessageChain)
        );
    }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    Maid.updateConfig();
    await mirai.link(config["qq"]);
    const friendsLoggers: Map<number, FileLogger> = new Map();
    const groupsLoggers: Map<number, FileLogger> = new Map();
    const tempLoggers: Map<number, FileLogger> = new Map();
    const profile = await prepare(mirai, friendsLoggers, groupsLoggers);
    const self = `${profile.nickname}/${config["qq"]}`;
    // 设置消息监听器
    mirai.on("message",
        (message) => handle(message, friendsLoggers, groupsLoggers, tempLoggers, self));
    // 自动接受好友请求
    mirai.on("NewFriendRequestEvent", (request) => {
        void request.respond(NewFriendRequestOperationType.Accept);
    });
    // 自动接受群邀请
    mirai.on("BotInvitedJoinGroupRequestEvent", (request) => {
        void request.respond(BotInvitedJoinGroupRequestOperationType.Accept);
    });
    // 开始监听
    mirai.listen();
}

void main();
