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
 * @module Maid
 */
import {MessageType} from "mirai-ts";
import XRegExp from "xregexp";
import Dice from "./Dice";
import Madness from "./Madness";
import {ExtraType, MadnessType} from "./types";
import {readConfig} from "./utils";
import Config from "./config";

/**
 *
 */
export abstract class Maid {

    /**
     *
     * @private
     */
    private static config = readConfig("config/maid-config.json");

    /**
    * @return
    */
    public static updateConfig(): void {
        this.config = readConfig("config/maid-config.json");
        Dice.setConfig(this.config);
    }

    /**
     * @return
     */
    public static getConfig(): Config {
        return this.config;
    }

    /**
     *
     * @param config
     */
    public static setConfig(config: Config): void {
        this.config = config;
        Dice.setConfig(config);
    }

    /**
     *
     * @param msg
     * @return
     */
    public static command(msg: MessageType.ChatMessage): string {
        let who;
        switch (msg.type) {
            case "FriendMessage":
                who = msg.sender.nickname;
                break;
            default:
                who = msg.sender.memberName;
                break;
        }
        let result: XRegExp.ExecArray | null = null;
        switch (msg.plain) {
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}coc7(\\s+\\d+){0,1}$`)))?.input:
                return !(result?.[1]) ? Dice.coc(who, 1) : Dice.coc(who, parseInt(result?.[1]));
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}ti$`)))?.input:
                return `${who}${Madness.getSymptom(MadnessType.temporary)}`;
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}li$`)))?.input:
                return `${who}${Madness.getSymptom(MadnessType.indefinite)}`;
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}ra(\\s\\D+){0,1}(\\s\\d+){0,1}$`)))?.input:
                return Dice.checkSkill(
                    who,
                    result?.[2] ? parseInt(result?.[2]) : this.config.skillDefault,
                    result?.[1] ? (result?.[1] as string).trim() : ""
                );
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}rb(\\d*)(\\s\\D+){0,1}(\\s\\d+){0,1}$`)))?.input:
                return Dice.checkSkillBonusOrPenalty(
                    who,
                    result?.[3] ? parseInt(result?.[3]) : this.config.skillDefault,
                    result?.[2] ? (result?.[2] as string).trim() : "",
                    ExtraType.bonus,
                    result?.[1] ? parseInt(result?.[1]) : 1
                );
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}rp(\\d*)(\\s\\D+){0,1}(\\s\\d+){0,1}$`)))?.input:
                return Dice.checkSkillBonusOrPenalty(
                    who,
                    result?.[3] ? parseInt(result?.[3]) : this.config.skillDefault,
                    result?.[2] ? (result?.[2] as string).trim() : "",
                    ExtraType.penalty,
                    result?.[1] ? parseInt(result?.[1]) : 1
                );
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}en(\\s\\D+){0,1}(\\s\\d+){0,1}$`)))?.input:
                return Dice.improve(
                    who,
                    result?.[2] ? parseInt(result?.[2]) : this.config.skillDefault,
                    result?.[1] ? (result?.[1] as string).trim() : ""
                );
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}r([\\S]+)(\\s+.+){0,1}$`)))?.input:
                return Dice.toss(
                    who,
                    result?.[1] as unknown as string,
                    result?.[2] ? (result?.[2] as string).trim() : ""
                );
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}h([\\S]+){0,1}$`)))?.input:
                return Dice.hiddenToss((result?.[1]) ? result?.[1] : "");
            case (result = XRegExp.exec(msg.plain, XRegExp(`^\\${this.config.prefix}sc\\s([\\S]+)/([\\S]+)\\s(\\d+)$`)))?.input:
                return Dice.sanityRoll(
                    who,
                    result?.[1] as unknown as string,
                    result?.[2] as unknown as string,
                    parseInt((result?.[3] as unknown as string))
                );
            default:
                return "";
        }
    }
}

export default Maid;
