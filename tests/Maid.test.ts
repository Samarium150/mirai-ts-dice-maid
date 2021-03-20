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

jest.mock("../src/utils");
import {readConfig, random} from "../src/utils";
import Maid from "../src/Maid";
import Config from "../src/config";
import {ChatMessage} from "mirai-ts/dist/types/message-type";

describe("validate", () => {
    let config: Config, friendMessage: ChatMessage, groupMessage: ChatMessage;
    beforeAll(() => {
        config = new Config();
        config.skillDefault = 25;
        Maid.setConfig(config);
        friendMessage = {
            type: "FriendMessage",
            messageChain: [
                {type: "Source", id: 0, time: 0},
                {type: "Plain", text: ""}
            ],
            sender: {id: 0, nickname: "Nick", remark: "*remark*"},
            plain: "",
            group: () => false,
            friend: () => true,
            reply: () => new Promise<void>(_ => {
                return _;
            }),
            get: () => null
        };
        groupMessage = {
            type: "GroupMessage",
            messageChain: [
                {type: "Source", id: 0, time: 0},
                {type: "Plain", text: ""}
            ],
            sender: {
                id: 0,
                memberName: "Nick",
                permission: "ADMINISTRATOR",
                group: {
                    id: 0,
                    name: "Group",
                    permission: "ADMINISTRATOR"
                }},
            plain: "",
            isAt: () => false,
            group: () => false,
            friend: () => true,
            reply: () => new Promise<void>(_ => {
                return _;
            }),
            get: () => null,
        };
        random.die = jest.fn().mockReturnValue(1);
        random.dice = jest.fn().mockReturnValue([1]);
    });
    describe("maid", () => {
        test("getConfig", () => {
            expect(Maid.getConfig().skillDefault).toEqual(25);
        });
        test("updateConfig", () => {
            config.skillDefault = 20;
            (readConfig as jest.Mock).mockReturnValue(config);
            Maid.updateConfig();
            expect(Maid.getConfig().skillDefault).toEqual(20);
        });
        describe("command", () => {
            test("notMatched", () => {
                friendMessage.plain = "测试";
                expect(Maid.command(friendMessage)).toEqual("");
            });
            describe("generate", () => {
                test("friendGenerate", () => {
                    friendMessage.plain = `${config.prefix}coc7`;
                    expect(Maid.command(friendMessage)).toContain("调查员作成Ex");
                });
                test("groupGenerate", () => {
                    groupMessage.plain = `${config.prefix}coc7 5`;
                    expect(Maid.command(groupMessage)).toContain("调查员作成Ex");
                });
            });
            describe("madness", () => {
                test("temporary", () => {
                    groupMessage.plain = `${config.prefix}ti`;
                    expect(Maid.command(groupMessage)).toContain("临时症状");
                });
                test("indefinite", () => {
                    groupMessage.plain = `${config.prefix}li`;
                    expect(Maid.command(groupMessage)).toContain("总结症状");
                });
            });
            describe("checkSkill", () => {
                test("simplified", () => {
                    groupMessage.plain = `${config.prefix}ra`;
                    expect(Maid.command(groupMessage)).toContain("进行检定");
                });
                test("detailed", () => {
                    groupMessage.plain = `${config.prefix}ra 测试 60`;
                    expect(Maid.command(groupMessage)).toContain("进行测试检定");
                });
            });
            describe("checkSkillBonusOrPenalty", () => {
                describe("bonus", () => {
                    test("simplified", () => {
                        groupMessage.plain = `${config.prefix}rb`;
                        expect(Maid.command(groupMessage)).toContain("奖励骰");
                    });
                    test("detailed", () => {
                        groupMessage.plain = `${config.prefix}rb2 测试 60`;
                        expect(Maid.command(groupMessage)).toContain("奖励骰");
                    });
                });
                describe("penalty", () => {
                    test("simplified", () => {
                        groupMessage.plain = `${config.prefix}rp`;
                        expect(Maid.command(groupMessage)).toContain("惩罚骰");
                    });
                    test("detailed", () => {
                        groupMessage.plain = `${config.prefix}rp2 测试 60`;
                        expect(Maid.command(groupMessage)).toContain("惩罚骰");
                    });
                });
            });
            describe("improve", () => {
                test("simplified", () => {
                    groupMessage.plain = `${config.prefix}en`;
                    expect(Maid.command(groupMessage)).toContain("进行成长检定");
                });
                test("detailed", () => {
                    groupMessage.plain = `${config.prefix}en 测试 30`;
                    expect(Maid.command(groupMessage)).toContain("进行测试成长检定");
                });
            });
            describe("toss", () => {
                test("simplified", () => {
                    groupMessage.plain = `${config.prefix}rd`;
                    expect(Maid.command(groupMessage)).toContain("投1d100");
                });
                test("detailed", () => {
                    groupMessage.plain = `${config.prefix}rd 测试`;
                    expect(Maid.command(groupMessage)).toContain("因为测试");
                });
            });
            describe("hiddenToss", () => {
                test("simplified", () => {
                    groupMessage.plain = `${config.prefix}h`;
                    expect(Maid.command(groupMessage)).toContain("投1d100");
                });
                test("detailed", () => {
                    groupMessage.plain = `${config.prefix}h1d10`;
                    expect(Maid.command(groupMessage)).toContain("投1d10");
                });
            });
            test("sanityRoll", () => {
                groupMessage.plain = `${config.prefix}sc 1d10/1d100 60`;
                expect(Maid.command(groupMessage)).toContain("进行理智检定");
            });
        });
    });
});
