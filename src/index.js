const Exporter = require('./export');
const Parser = require('./parse');
const ESV_TOKEN = process.env['ESV_TOKEN'];

const main = async (inputFile, outputIcsFile, isMemoryVerse = false) => {
    if (isMemoryVerse && !ESV_TOKEN) {
        throw new Error('ESV_TOKEN is not set as an environment variable')
    }

    const parser = new Parser(inputFile);
    const exporter = new Exporter();
    const readingList = await parser.parse(ESV_TOKEN);

    if (isMemoryVerse) {
        // export memory verse events
        const memoryVerseEvents = await exporter.genMemoryVerseEvents(readingList);
        await exporter.exportIcs(memoryVerseEvents, outputIcsFile);
    } else {
        // export daily passage events
        const events = exporter.genEvents(readingList);
        await exporter.exportIcs(events, outputIcsFile);
    }
};

module.exports = main;
