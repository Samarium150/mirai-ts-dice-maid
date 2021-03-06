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
 * @module utils
 */
import Config from "./config";
import fs from "fs-extra";

/**
 * Generate a random integer between min and max (both inclusive)
 * <br>
 * 生成[min, max]之间的随机数
 *
 * @param min
 * @param max
 * @return random generated integer
 */
export function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Read JSON configuration file
 * <br>
 * 读取JSON配置文件
 *
 * @param file
 * @return
 */
export function readConfig(file: string): Config {
    return Object.assign(new Config(), fs.readJSONSync(file) as string);
}

/**
 * Write JSON configuration file
 * <br>
 * 写入JSON配置文件
 *
 * @param file
 * @param config
 */
export function writeConfig(file: string, config: Config): void {
    fs.writeJSONSync(file, config, {spaces: 4});
}
