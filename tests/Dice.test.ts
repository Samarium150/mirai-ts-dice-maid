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
 */
import XRegExp from "xregexp";
import { random } from "../src/utils";
import Dice from "../src/Dice";
import Config from "../src/config";
import { ExtraType } from "../src/types";

describe("validate", () => {
    describe("dice", () => {
        describe("generate", () => {
            const config = new Config();
            beforeAll(() => {
                config.generateMax = 10;
                Dice.setConfig(config);
            });
            test("generateTooMany", () => {
                expect(Dice.coc("", 11)).toEqual(`最多生成${config.generateMax}组数据`);
            });
            test("generateLessThanZero", () => {
                expect(Dice.coc("", -1)).toEqual("");
            });
            XRegExp.addToken(/\\k/, () => "15|[2-8][0,5]|90", { scope: "all" });
            XRegExp.addToken(/\\o/, () => "1[2-9][0,5]|[2-6][1-9][0,5]|71[0,5]|725", { scope: "all" });
            XRegExp.addToken(/\\O/, () => "135|1[4-9][0,5]|[2-7][1-9][0,5]|80[0,5]|810", { scope: "all" });
            const p = XRegExp("^调查员作成Ex：\\n力量STR：\\k，体质CON：\\k，体型SIZ：\\k，\\n" +
                "敏捷DEX：\\k，外貌APP：\\k，智力INT：\\k，\\n" +
                "意志POW：\\k，教育EDU：\\k，幸运LUC：\\k\\n" +
                "属性总和不含幸运/含幸运：\\o/\\O$", "u");
            test("generateOne", () => {
                expect(p.test(Dice.coc("", 1))).toBe(true);
            });
        });
        describe("checkSkill", () => {
            const config = new Config();
            describe("invalidRate", () => {
                beforeAll(() => {
                    config.rate = -1;
                    Dice.setConfig(config);
                });
                test("empty", () => {
                    expect(Dice.checkSkill("", 10, "")).toEqual("");
                });
            });
            describe("defaultRate", () => {
                beforeAll(() => {
                    config.rate = 0;
                    Dice.setConfig(config);
                });
                test("criticalSuccess", () => {
                    random.die = jest.fn().mockReturnValue(1);
                    expect(Dice.checkSkill("", 10, "")).toContain("大成功");
                });
                test("extremeSuccess", () => {
                    random.die = jest.fn().mockReturnValue(2);
                    expect(Dice.checkSkill("", 15, "")).toContain("极限成功");
                });
                test("hardSuccess", () => {
                    random.die = jest.fn().mockReturnValue(5);
                    expect(Dice.checkSkill("", 10, "")).toContain("困难成功");
                });
                test("success", () => {
                    random.die = jest.fn().mockReturnValue(10);
                    expect(Dice.checkSkill("", 10, "")).toContain("普通成功");
                });
                describe("failure", () => {
                    test("skillLessThan50", () => {
                        random.die = jest.fn().mockReturnValue(50);
                        expect(Dice.checkSkill("", 20, "")).toContain("失败");
                    });
                    test("skillEqualsToOrMoreThan50", () => {
                        random.die = jest.fn().mockReturnValue(97);
                        const result = expect(Dice.checkSkill("", 50, ""));
                        result.not.toContain("大失败");
                        result.toContain("失败");
                    });
                });
                describe("fumble", () => {
                    test("skillLessThan50", () => {
                        random.die = jest.fn().mockReturnValue(97);
                        expect(Dice.checkSkill("", 20, "")).toContain("大失败");
                    });
                    test("skillEqualsToOrMoreThan50", () => {
                        random.die = jest.fn().mockReturnValue(100);
                        expect(Dice.checkSkill("", 90, "")).toContain("大失败");
                    });
                });
            });
            describe("higherRate", () => {
                beforeAll(() => {
                    config.rate = 1;
                    Dice.setConfig(config);
                });
                test("criticalSuccess", () => {
                    random.die = jest.fn().mockReturnValue(5);
                    expect(Dice.checkSkill("", 25, "")).toContain("大成功");
                });
                test("extremeSuccess", () => {
                    random.die = jest.fn().mockReturnValue(6);
                    expect(Dice.checkSkill("", 30, "")).toContain("极限成功");
                });
                test("hardSuccess", () => {
                    random.die = jest.fn().mockReturnValue(20);
                    expect(Dice.checkSkill("", 50, "")).toContain("困难成功");
                });
                test("success", () => {
                    random.die = jest.fn().mockReturnValue(30);
                    expect(Dice.checkSkill("", 50, "")).toContain("普通成功");
                });
                test("failure", () => {
                    random.die = jest.fn().mockReturnValue(70);
                    expect(Dice.checkSkill("", 60, "")).toContain("失败");
                });
                describe("fumble", () => {
                    test("skillLessThan96", () => {
                        random.die = jest.fn().mockReturnValue(97);
                        expect(Dice.checkSkill("", 60, "")).toContain("大失败");
                    });
                    test("skillEqualsToOrMoreThan96", () => {
                        random.die = jest.fn().mockReturnValue(100);
                        expect(Dice.checkSkill("", 97, "")).toContain("大失败");
                    });
                });
            });
        });
        describe("checkSkillBonusOrPenalty", () => {
            beforeAll(() => {
                Dice.setConfig(new Config());
            });
            describe("invalid", () => {
                test("tooMany", () => {
                    expect(Dice.checkSkillBonusOrPenalty("", 10, "", ExtraType.bonus, 10)).toEqual("不要扔这么多骰子!");
                });
                test("invalidType", () => {
                    expect(Dice.checkSkillBonusOrPenalty("", 10, "", 2, 1)).toEqual("");
                });
            });
            describe("bonus", () => {
                test("failure", () => {
                    random.die = jest.fn().mockReturnValueOnce(65);
                    random.dice = jest.fn().mockReturnValueOnce([7]);
                    expect(Dice.checkSkillBonusOrPenalty("", 50, "", ExtraType.bonus, 1)).toContain("65");
                });
                test("success", () => {
                    random.die = jest.fn().mockReturnValueOnce(65);
                    random.dice = jest.fn().mockReturnValueOnce([4]);
                    expect(Dice.checkSkillBonusOrPenalty("", 50, "", ExtraType.bonus, 1)).toContain("35");
                });
            });
            describe("penalty", () => {
                test("failure", () => {
                    random.die = jest.fn().mockReturnValueOnce(30);
                    random.dice = jest.fn().mockReturnValueOnce([7]);
                    expect(Dice.checkSkillBonusOrPenalty("", 50, "", ExtraType.penalty, 1)).toContain("70");
                });
                test("success", () => {
                    random.die = jest.fn().mockReturnValueOnce(10);
                    random.dice = jest.fn().mockReturnValueOnce([4]);
                    expect(Dice.checkSkillBonusOrPenalty("", 50, "", ExtraType.penalty, 1)).toContain("40");
                });
            });
        });
        describe("improve", () => {
            test("failure", () => {
                random.die = jest.fn().mockReturnValueOnce(50);
                expect(Dice.improve("", 64, "")).toContain("失败");
            });
            test("success", () => {
                random.die = jest.fn().mockReturnValueOnce(80);
                expect(Dice.improve("", 64, "")).toContain("成功");
            });
        });
        describe("toss", () => {
            beforeAll(() => {
                const config = new Config();
                config.timesMax = 3;
                config.sidesMax = 100;
                Dice.setConfig(config);
            });
            describe("invalid", () => {
                test("invalidDice", () => {
                    expect(Dice.toss("", "xdx", "")).toEqual("");
                });
                test("tooManyTimes", () => {
                    expect(Dice.toss("", "5d10", "")).toEqual("不要扔这么多骰子!");
                });
                test("tooManySides", () => {
                    expect(Dice.toss("", "1d200", "")).toEqual("不要扔这么多面的骰子!");
                });
                test("tooManyAddedUp", () => {
                    random.dice = jest.fn().mockReturnValue([10]);
                    expect(Dice.toss("", "1d10+1d10+1d10+1d10", "")).toEqual("不要扔这么多骰子!");
                });
            });
            describe("single", () => {
                test("default", () => {
                    random.dice = jest.fn().mockReturnValueOnce([100]);
                    expect(Dice.toss("", "d", "")).toContain("100");
                });
                describe("moreSpecific", () => {
                    test("specificTimes", () => {
                        random.dice = jest.fn().mockReturnValue([30, 30]);
                        expect(Dice.toss("", "2d", "")).toContain("60");
                    });
                    test("specificSides", () => {
                        random.dice = jest.fn().mockReturnValue([5]);
                        expect(Dice.toss("", "d10", "")).toContain("5");
                    });
                });
                test("mostSpecific", () => {
                    random.dice = jest.fn().mockReturnValue([10]);
                    const result = Dice.toss("", "1d10", "测试");
                    expect(result).toContain("10");
                    expect(result).toContain("测试");
                });
            });
            describe("multiple", () => {
                test("multipleDice", () => {
                    random.dice = jest.fn().mockReturnValueOnce([5]).mockReturnValueOnce([65]);
                    expect(Dice.toss("", "1d10+1d100", "")).toContain("70");
                });
                test("includeConstant", () => {
                    random.dice = jest.fn().mockReturnValue([35]);
                    expect(Dice.toss("", "1d100+30", "")).toContain("65");
                });
            });
        });
        describe("hiddenToss", () => {
            beforeAll(() => {
                Dice.setConfig(new Config());
            });
            test("default", () => {
                random.die = jest.fn().mockReturnValue(32);
                expect(Dice.hiddenToss("")).toContain("32");
            });
            test("specific", () => {
                random.dice = jest.fn().mockReturnValueOnce([5]).mockReturnValueOnce([3]);
                expect(Dice.hiddenToss("1d10+1d6+1")).toContain("9");
            });
        });
        describe("sanityRoll", () => {
            beforeAll(() => {
                const config = new Config();
                config.timesMax = 3;
                config.sidesMax = 100;
                Dice.setConfig(config);
            });
            describe("invalid", () => {
                test("empty", () => {
                    expect(Dice.sanityRoll("", "", "", 10)).toEqual("");
                });
                test("tooMany", () => {
                    expect(Dice.sanityRoll("", "5d10", "1d100", 50)).toEqual("不要扔这么多骰子!");
                });
            });
            test("failure", () => {
                random.die = jest.fn().mockReturnValueOnce(90);
                random.dice = jest.fn().mockReturnValueOnce([20]);
                const result = Dice.sanityRoll("", "1d10", "1d100", 60);
                expect(result).toContain("失败");
                expect(result).toContain("20");
            });
            test("success", () => {
                random.die = jest.fn().mockReturnValueOnce(10);
                random.dice = jest.fn().mockReturnValueOnce([5]);
                const result = Dice.sanityRoll("", "1d10+1", "1d100", 60);
                expect(result).toContain("成功");
                expect(result).toContain("6");
            });
        });
    });
});
