import gulp from "gulp";
import gulpTypedoc from "gulp-typedoc";
import gulpTypescript from "gulp-typescript";
import gulpEslint from "gulp-eslint";
import gulpJest from "gulp-jest";
import * as path from "path";
import fs from "fs-extra";

const paths = {
    root: path.join(__dirname, "/"),
    input: path.join(__dirname, "/src/index.ts"),
    output: path.join(__dirname, "/dist")
};

const project = gulpTypescript.createProject("tsconfig.json");

async function clean(): Promise<void> {
    if (fs.existsSync(paths.output))
        await fs.rm(paths.output, { recursive: true });
}

function test() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return gulp.src(["tests/"]).pipe(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        gulpJest()
    ) as NodeJS.ReadWriteStream;
}

function build() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return gulp.src(["src/**/*.ts"]).pipe(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        gulpEslint()
    ).pipe(
        project()
    ).pipe(
        gulp.dest(paths.output)
    ) as NodeJS.ReadWriteStream;
}

function doc() {
    return gulp.src(["src/"]).pipe(
        gulpTypedoc({
            out: path.join(paths.output, "/docs"),
            version: true
        })
    );
}

export default gulp.series(clean, test, gulp.parallel(build, doc));
