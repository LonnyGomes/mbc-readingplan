const Exporter = require('./export');
const Parser = require('./parse');

const main = async (inputFile, outputIcsFile, isMemoryVerse = false) => {
    const parser = new Parser(inputFile);
    const exporter = new Exporter();
    const readingList = await parser.parse();

    if (isMemoryVerse) {
        // export memory verse events
        const memoryVerseEvents = exporter.genMemoryVerseEvents(readingList);
        await exporter.exportIcs(memoryVerseEvents, outputIcsFile);
    } else {
        // export daily passage events
        const events = exporter.genEvents(readingList);
        await exporter.exportIcs(events, outputIcsFile);
    }
};

module.exports = main;
