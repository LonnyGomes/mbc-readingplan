#!/usr/bin/env node
const path = require('path');
const chalk = require('chalk');
const log = console.log;
const readingPlanExport = require('../src/index');
const errorMsg = msg => {
    log(`${chalk.red('✖')} ${msg}`);
    process.exit(1);
};
const successMsg = msg => log(`${chalk.green('✔')} ${msg}`);
const [, , ...args] = process.argv;
const [inputFile, outputPath] = args;

if (args.length === 1) {
    errorMsg('Must supply output path for the .ics file!');
}

if (args.length !== 2) {
    errorMsg('Must supply input text file and output path for the .ics file!');
}

if (path.extname(outputPath) !== '.ics') {
    errorMsg('Output file should have a ".ics" extension!');
}

// run export and handle errors
readingPlanExport(inputFile, outputPath)
    .then(() => {
        successMsg(
            `successfully generated calendar file at ${chalk.bold.green(
                outputPath
            )}`
        );
    })
    .catch(err => {
        errorMsg(`Encountered error while processing: ${err.message}`);
    });
