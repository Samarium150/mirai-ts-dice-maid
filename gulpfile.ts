import gulp from "gulp";
import gulpTypedoc from "gulp-typedoc";
import gulpTypescript from "gulp-typescript";
import * as path from "path";
import fs from "fs-extra";
import eslint from "gulp-eslint";

const paths = {
    root: path.join(__dirname, "/"),
    input: path.join(__dirname, "/src/index.ts"),
    output: path.join(__dirname, "/dist")
};

const project = gulpTypescript.createProject("tsconfig.json");

function clean(callback: Function): void {
    if (fs.existsSync(paths.output))
        fs.rmSync(paths.output, { recursive: true });
    callback();
}

function build(): any {
    return gulp.src(["src/**/*.ts"]).pipe(
        eslint()
    ).pipe(
        project()
    ).pipe(
        gulp.dest(paths.output)
    );
}

function doc(): any {
    return gulp.src(["src/"]).pipe(
        gulpTypedoc({
            out: path.join(paths.output, "/docs"),
            version: true
        })
    );
}

export default gulp.series(clean, gulp.parallel(build, doc));
