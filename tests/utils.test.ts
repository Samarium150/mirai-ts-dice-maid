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
jest.mock("fs-extra");
import * as fs from "fs-extra";
import * as utils from "../src/utils";
import Config from "../src/config";

describe("validate", () => {
    describe("utils", () => {
        test("random", () => {
            for (let _ = 0; _ < 100; ++_) {
                const result = expect(utils.random.integer(1, 6));
                result.toBeGreaterThanOrEqual(1);
                result.toBeLessThanOrEqual(6);
            }
        });
        test("sum", () => {
            expect(utils.sum([1, 2, 3, 4])).toEqual(10);
        });
        test("readConfig", () => {
            (fs.readJSONSync as jest.Mock).mockReturnValue({
                "master":0,
                "prefix":".",
                "generateMax":10,
                "timesMax":100,
                "sidesMax":1000,
                "skillDefault":20,
                "rate":1
            });
            expect(utils.readConfig("").rate).toEqual(1);
        });
        test("writeConfig", () => {
            const spy = jest.spyOn(fs, "writeJSONSync");
            spy.mockReturnValue();
            utils.writeConfig("", new Config());
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
