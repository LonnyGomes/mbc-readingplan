#!/usr/bin/env node
const package = require('../package.json');
const commander = require('commander');
const program = new commander.Command();
const path = require('path');
const chalk = require('chalk');
const log = console.log;
const readingPlanExport = require('../src/index');
const errorMsg = msg => {
    log(`${chalk.red('✖')} ${msg}`);
    process.exit(1);
};
const successMsg = msg => log(`${chalk.green('✔')} ${msg}`);

program
    .version(package.version)
    .requiredOption('-i, --inputFile [path]', 'path to text file of passages')
    .requiredOption('-o, --outputPath [path]', 'Output path for the .ics files')
    .option('-m, --memoryVerse', 'Output path for the .ics files');

program.parse(process.argv);

if (path.extname(program.outputPath) !== '.ics') {
    errorMsg('Output file should have a ".ics" extension!');
}

// run export and handle errors
readingPlanExport(
    program.inputFile,
    program.outputPath,
    program.memoryVerse || false
)
    .then(() => {
        successMsg(
            `successfully generated calendar file at ${chalk.bold.green(
                program.outputPath
            )}`
        );
    })
    .catch(err => {
        errorMsg(`Encountered error while processing: ${err.message}`);
    });
