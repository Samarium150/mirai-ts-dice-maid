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
 * @module config
 */
/**
 * This is the class representation of JSON configuration file
 * <br>
 * 用类来表示的JSON配置文件
 */
export class Config {
    /**
     *
     */
    public master = 0;

    /**
     *
     */
    public prefix = ".";

    /**
     *
     */
    public generateMax = 10;

    /**
     *
     */
    public timesMax = 100;

    /**
     *
     */
    public sidesMax = 1000;

    /**
     *
     */
    public skillDefault = 20;

    /**
     *
     */
    public rate = 0;

    /**
     *
     */
    public extraMax = 5;
}

export default Config;
