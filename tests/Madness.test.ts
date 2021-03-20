import {MadnessType} from "../src/types";

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
import {random} from "../src/utils";
import Madness from "../src/Madness";

describe("validate", () => {

    describe("madness", () => {
        describe("getSymptom", () => {
            test("invalid", () => {
                expect(Madness.getSymptom(2)).toEqual("");
            });
            describe("temporary", () => {
                test("normal", () => {
                    random.integer = jest.fn().mockReturnValueOnce(5);
                    random.die = jest.fn().mockReturnValueOnce(1);
                    expect(Madness.getSymptom(MadnessType.temporary)).toEqual(
                        "疯狂发作-临时症状: 1d10=6\n昏厥：调查员当场昏倒.\n持续时间: 1d10=1轮"
                    );
                });
                test("phobia", () => {
                    random.integer = jest.fn().mockReturnValueOnce(8).mockReturnValueOnce(7);
                    random.die = jest.fn().mockReturnValueOnce(1);
                    expect(Madness.getSymptom(MadnessType.temporary)).toEqual(
                        "疯狂发作-临时症状: 1d10=9\n恐惧症：\n具体症状: 1d100=8\n恐风症：对风的恐惧.\n持续时间: 1d10=1轮"
                    );
                });
                test("mania", () => {
                    random.integer = jest.fn().mockReturnValueOnce(9).mockReturnValueOnce(0);
                    random.die = jest.fn().mockReturnValueOnce(1);
                    expect(Madness.getSymptom(MadnessType.temporary)).toEqual(
                        "疯狂发作-临时症状: 1d10=10\n狂躁症：\n具体症状: 1d100=1\n沐浴癖：执着于清洗自己.\n持续时间: 1d10=1轮"
                    );
                });
            });
            describe("indefinite", () => {
                test("normal", () => {
                    random.integer = jest.fn().mockReturnValueOnce(5);
                    random.die = jest.fn().mockReturnValueOnce(1);
                    expect(Madness.getSymptom(MadnessType.indefinite)).toEqual(
                        "疯狂发作-总结症状: 1d10=6\n重要之人：数小时或更久的时间中, 调查员将不顾一切地接近那个人, 并为他们之间的关系做出行动.\n持续时间: 1d10=1轮"
                    );
                });
                test("phobia", () => {
                    random.integer = jest.fn().mockReturnValueOnce(8).mockReturnValueOnce(7);
                    random.die = jest.fn().mockReturnValueOnce(1);
                    expect(Madness.getSymptom(MadnessType.indefinite)).toEqual(
                        "疯狂发作-总结症状: 1d10=9\n恐惧症：调查员患上一个新的恐惧症.\n具体症状: 1d100=8\n恐风症：对风的恐惧.\n持续时间: 1d10=1轮"
                    );
                });
                test("mania", () => {
                    random.integer = jest.fn().mockReturnValueOnce(9).mockReturnValueOnce(0);
                    random.die = jest.fn().mockReturnValueOnce(1);
                    expect(Madness.getSymptom(MadnessType.indefinite)).toEqual(
                        "疯狂发作-总结症状: 1d10=10\n狂躁症：调查员患上一个新的狂躁症.\n具体症状: 1d100=1\n沐浴癖：执着于清洗自己.\n持续时间: 1d10=1轮"
                    );
                });
            });
        });
    });
});
