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
 *
 * @module Dice
 */
import { random } from "./utils";
import Config from "./config";
import { Rate, ExtraType } from "./types";
import XRegExp from "xregexp";

/**
 * 
 */
export abstract class Dice {

    /**
     *
     */
    private static config: Config;

    /**
     *
     * @param config
     */
    public static setConfig(config: Config): void {
        this.config = config;
    }

    /**
     * 
     * @param times
     * @param sides
     * @return
     */
    public static roll(times: number, sides: number): number {
        let result = 0;
        for (let _ = 0; _ < times; ++_) result += random(1, sides);
        return result;
    }

    /**
     * @return
     */
    private static generate(): string {
        const strength = this.roll(3, 6) * 5,
            constitution = this.roll(3, 6) * 5,
            size = (this.roll(2, 6) + 6) * 5,
            dexterity = this.roll(3, 6) * 5,
            appearance = this.roll(3, 6) * 5,
            intelligence = (this.roll(2, 6) + 6) * 5,
            power = this.roll(3, 6) * 5,
            education = (this.roll(2, 6) + 6) * 5,
            luck = this.roll(3, 6) * 5,
            total = strength + constitution + size
                + dexterity + appearance
                + intelligence + power + education;
        return `力量STR：${strength}，体质CON：${constitution}，体型SIZ：${size}，\n`
            + `敏捷DEX：${dexterity}，外貌APP：${appearance}，智力INT：${intelligence}，\n`
            + `意志POW：${power}，教育EDU：${education}，幸运LUC：${luck}\n`
            + `属性总和不含幸运/含幸运：${total}/${total + luck}`;
    }

    /**
     *
     * @param who
     * @param n
     * @return
     */
    public static coc(who: string, n: number): string {
        if (n > this.config.generateMax) return `最多生成${this.config.generateMax}组数据`;
        else if (n < 0) return "";
        let result = `${who}的调查员作成Ex：\n`;
        for (let _ = 0; _ < n; ++_)
            result += this.generate() + "\n";
        return result.trim();
    }

    /**
     *
     * @param skill
     * @param result
     * @return
     */
    private static getResult(skill: number, result: number): string {
        const half = Math.floor(skill / 2),
            fifth = Math.floor(skill / 5);
        switch (this.config.rate) {
            case Rate.default: {
                switch (true) {
                    case result == 1:
                        return "大成功";
                    case 1 < result && result <= fifth:
                        return "极限成功";
                    case fifth < result && result <= half:
                        return "困难成功";
                    case half < result && result <= skill:
                        return "普通成功";
                    case (skill < 50 && result > 95) || result == 100:
                        return "大失败";
                    default:
                        return "失败";
                }
            }
            case Rate.higher: {
                switch (true) {
                    case result <= 5 && result <= skill:
                        return "大成功";
                    case 5 < result && result <= fifth:
                        return "极限成功";
                    case fifth < result && result <= half:
                        return "困难成功";
                    case half < result && result <= skill:
                        return "普通成功";
                    case (result > 95 && result > skill) || result == 100:
                        return "大失败";
                    default:
                        return "失败";
                }
            }
            default:
                return "";
        }
    }

    /**
     *
     * @param who
     * @param skill
     * @param which
     * @return
     */
    public static checkSkill(who: string, skill: number, which: string): string {
        const roll = this.roll(1, 100),
            result = this.getResult(skill, roll);
        return result ? `${who}进行${which}检定：1d100=${roll}|${skill}，${result}` : "";
    }

    /**
     *
     * @param who
     * @param skill
     * @param which
     * @param type
     * @param count
     * @return
     */
    public static checkSkillBonusOrPenalty(who: string, skill: number, which: string, type: ExtraType, count: number): string {
        if (count > this.config.extraMax) return "不要扔这么多骰子!";
        const roll = this.roll(1, 100),
            ones = roll % 10,
            tens = (roll - ones) / 10,
            extras: Array<number> = [];
        let final: number, t: string;
        for (let _ = 0; _ < count; ++_) {
            if (ones == 0)
                extras.push(this.roll(1, 10));
            else
                extras.push(this.roll(1, 10) - 1);
        }
        switch (type) {
            case ExtraType.bonus:
                t = "奖励骰";
                final = Math.min(...extras, tens) * 10 + ones;
                break;
            case ExtraType.penalty:
                t = "惩罚骰";
                final = Math.max(...extras, tens) * 10 + ones;
                break;
            default:
                return "";
        }
        const result = this.getResult(skill, final);
        return `${who}进行${which}检定：1d100=${roll}，\n${t}：${extras.join("，")}，\n最终结果：${final}|${skill}，${result}`;
    }

    /**
     *
     * @param who
     * @param skill
     * @param which
     * @return
     */
    public static improve(who: string, skill: number, which: string): string {
        const roll = this.roll(1, 100),
            result = `${who}进行${which}成长检定：1d100=${roll}|${skill}，`;
        if (roll <= skill)
            return result + "失败";
        const improvement = this.roll(1, 10);
        return result
            + `成功，\n技能增长：1d10=${improvement}，\n`
            + `最终结果：${skill}+${improvement}=${skill+improvement}`;
    }

    /**
     *
     * @param dice
     * @return
     * @private
     */
    private static parseDice(dice: string): [Array<string>, Array<number>] {
        const parsedDice: Array<string> = [], results: Array<number> = [];
        XRegExp.forEach(dice, XRegExp("(\\d*d\\d*)|(\\d+)"), (match) => {
            if (XRegExp("^[1-9]\\d*$").test(match[0])) {
                parsedDice.push(match[0]);
                results.push(parseInt(match[0]));
            } else {
                if (XRegExp("\\D+d\\D+").test((match.input as string))) throw new Error("invalid dice");
                const result = XRegExp.exec(match[0], XRegExp("(\\d*)d(\\d*)")),
                    times = (result?.[1]) ? parseInt(result?.[1]) : 1,
                    sides = (result?.[2]) ? parseInt(result?.[2]) : 100;
                if (times > this.config.timesMax) throw new RangeError("不要扔这么多骰子!");
                if (sides > this.config.sidesMax) throw new RangeError("不要扔这么多面的骰子!");
                parsedDice.push(`${times}d${sides}`);
                if (parsedDice.length >= this.config.timesMax) throw new RangeError("不要扔这么多骰子!");
                for (let _ = 0; _ < times; ++_)
                    results.push(this.roll(1, sides));
            }
        });
        if (parsedDice.length == 0 || results.length == 0) throw new Error("invalid input");
        return [parsedDice, results];
    }

    /**
     *
     * @param who
     * @param dice
     * @param reason
     * @return
     */
    public static toss(who: string, dice: string, reason: string): string {
        try {
            const [parsedDice, results] = this.parseDice(dice);
            //if (parsedDice.length == 0) return "";
            return who
                + (reason ? `因为${reason}` : "") +
                ((parsedDice.length == 1 && results.length == 1) ?
                    `投${parsedDice.join()}=${results.join()}` :
                    `投${parsedDice.join("+")}=${results.join("+")}=${results.reduce((a, b) => a + b)}`);
        } catch (e) {
            return (e instanceof RangeError) ? e.message : "";
        }
    }

    /**
     *
     * @param dice
     * @return
     */
    public static hiddenToss(dice: string): string {
        return (dice) ? this.toss("", dice, "") : `投1d100=${this.roll(1, 100)}`;
    }

    /**
     *
     * @param who
     * @param success
     * @param failure
     * @param sanity
     * @return
     */
    public static sanityRoll(who: string, success: string, failure: string, sanity: number): string {
        const roll = this.roll(1, 100);
        try {
            let result: string, parsedDice: Array<string>, results: Array<number>;
            if (roll <= sanity) {
                result = "成功";
                [parsedDice, results] = this.parseDice(success);
            } else {
                result = "失败";
                [parsedDice, results] = this.parseDice(failure);
            }
            //if (parsedDice.length == 0) return "";
            const sum = results.reduce((a, b) => a + b);
            return `${who}进行理智检定：1d100=${roll}|${sanity}， ${result}，\n理智减少`
                + ((parsedDice.length == 1) ? `${parsedDice.join()}=${results.join()}，\n`
                    : `${parsedDice.join("+")}=${results.join("+")}=${sum}，\n`)
                + `最终结果${sanity}-${sum}=${sanity-sum}`;
        } catch (e) {
            return (e instanceof RangeError) ? e.message : "";
        }
    }
}

export default Dice;
