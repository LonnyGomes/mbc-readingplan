const Exporter = require('./export');
const Parser = require('./parse');

const main = async (inputFile, outputIcsFile) => {
    const parser = new Parser(inputFile);
    const exporter = new Exporter();
    const readingList = await parser.parse();

    const events = exporter.genEvents(readingList);
    await exporter.exportIcs(events, outputIcsFile);
};

module.exports = main;
