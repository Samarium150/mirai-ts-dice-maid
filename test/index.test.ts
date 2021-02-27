import assert from "assert";
import {main} from "../src";

describe('validate', () => {
    describe('main', () => {
        test("return expected string", () => {
            assert.strictEqual(main("World!"), "Hello, World!")
        })
    });
});
