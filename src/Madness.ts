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
 * @module Madness
 */
import madness from "../resources/madness.json";
import { MadnessType, MadnessList } from "./types";
import { random } from "./utils";

/**
 *
 */
export abstract class Madness {

    /**
     *
     */
    private static readonly temporary = madness["temporary"] as MadnessList;

    /**
     *
     */
    private static readonly indefinite = madness["indefinite"] as MadnessList;

    /**
     *
     */
    private static readonly phobia = madness["phobia"] as MadnessList;

    /**
     *
     */
    private static readonly mania = madness["mania"] as MadnessList;

    // /**
    //  *
    //  */
    // private constructor() { throw new Error("Abstract class should not be instantiated"); }

    /**
     *
     * @param type
     * @return
     */
    public static getSymptom(type: number): string {
        let t: string,
            name: string,
            symptom: string,
            detail = "";
        const num = random(0, 9),
            time = random(1, 10);
        switch(type) {
            case MadnessType.temporary:
                name = Object.keys(this.temporary)[num];
                symptom = this.temporary[name];
                t = "临时症状";
                break;
            case MadnessType.indefinite:
                name = Object.keys(this.indefinite)[num];
                symptom = this.indefinite[name];
                t = "总结症状";
                break;
            default:
                return "";
        }
        if (num >= 8) {
            const sub = random(0, 99),
                detailName = num == 8 ? Object.keys(this.phobia)[sub] : Object.keys(this.mania)[sub],
                detailSymptom = num == 8 ? this.phobia[detailName] : this.mania[detailName];
            detail = `具体症状: 1d100=${sub + 1}\n${detailName}：${detailSymptom}\n`;
        }
        return `疯狂发作-${t}: 1d10=${num + 1}\n${name}：${symptom}\n${detail}持续时间: 1d10=${time}轮`;
    }
}

export default Madness;
