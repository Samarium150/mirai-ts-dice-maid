import gulp from "gulp";
import gulpTypedoc from "gulp-typedoc";
import gulpTypescript from "gulp-typescript";
import * as path from "path";
import fs from "fs-extra";
import eslint from "gulp-eslint";

const paths = {
    root: path.join(__dirname, "/"),
    input: path.join(__dirname, "/src/index.ts"),
    output: path.join(__dirname, "/lib")
};

const project = gulpTypescript.createProject("tsconfig.json");

function clean(callback: Function) {
    fs.rmdirSync("lib", {recursive: true});
    callback();
}

function build() {
    return gulp.src(["src/**/*.ts"]).pipe(
        eslint()
    ).pipe(
        project()
    ).pipe(
        gulp.dest(paths.output)
    );
}

function doc() {
    return gulp.src(["src/**/*.ts"]).pipe(
        gulpTypedoc({
            name: "temp",
            out: path.join(paths.output, "/docs"),
            version: true
        })
    );
}

export default gulp.series(clean, gulp.parallel(build, doc));
