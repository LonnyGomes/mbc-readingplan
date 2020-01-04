const path = require('path');
const fs = require('fs-extra');
const BASE_FIXTURES_PATH = path.resolve(__dirname, 'fixtures');
const Exporter = require('../src/export');
const SAMPLE_INPUT = require('./fixtures/parsed-sample.json');

describe('mapToEvent', () => {
    test('should throw an error if duration is not supplied', () => {
        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.readings[0]);
        const exporter = new Exporter();

        expect(() => exporter.mapToEvent('title')).toThrow(
            /duration must be supplied as an integer/
        );
    });

    test('should throw an error if duration is not an integer', () => {
        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.readings[0]);
        const exporter = new Exporter();

        expect(() => exporter.mapToEvent('title', '1a', passage)).toThrow(
            /duration must be supplied as an integer/
        );
    });

    test('should throw an error if passage object does not contain a date element', () => {
        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.readings[0]);
        const exporter = new Exporter();

        passage.date = null;

        expect(() => exporter.mapToEvent('title', '1a', passage)).toThrow(
            /duration must be supplied as an integer/
        );
    });

    test('should generate ics-compliant event object', () => {
        const expectedResult = {
            start: [2020, 1, 1],
            end: [2020, 1, 2],
            title: 'Day 1 Reading',
            description: "Today's reading: Psalm 1",
            url:
                'https://www.biblegateway.com/passage/?search=Psalm%201&version=ESV'
        };

        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.readings[0]);
        const exporter = new Exporter();
        const result = exporter.mapToEvent('Day 1 Reading', 1, passage);
        expect(result).toEqual(expectedResult);
    });

    test('should generate ics-compliant event object that spans multiple days', () => {
        const expectedResult = {
            start: [2020, 1, 1],
            end: [2020, 1, 8],
            title: 'Week 1 Memory Verse',
            description: "Today's reading: Psalm 101:2",
            url:
                'https://www.biblegateway.com/passage/?search=Psalm%20101:2&version=ESV'
        };

        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.memoryVerse);
        passage.date = weekObj.startDate;
        const exporter = new Exporter();
        const result = exporter.mapToEvent('Week 1 Memory Verse', 7, passage);
        expect(result).toEqual(expectedResult);
    });
});

describe('genEvents', () => {
    test('should generate array of events', () => {
        const exporter = new Exporter();
        const result = exporter.genEvents(SAMPLE_INPUT);

        expect(Array.isArray(result)).toEqual(true);
        expect(result.length).toEqual(12);
    });
});

describe('exportIcs', () => {
    const OUTPUT_PATH = path.resolve(BASE_FIXTURES_PATH, 'temp-test.ics');

    beforeEach(() => fs.removeSync(OUTPUT_PATH));
    afterEach(() => fs.removeSync(OUTPUT_PATH));

    test('should export an ics file to specified location', async () => {
        expect.assertions(1);
        const exporter = new Exporter();
        const events = exporter.genEvents(SAMPLE_INPUT);

        const result = await exporter.exportIcs(events, OUTPUT_PATH);
        expect(fs.pathExistsSync(OUTPUT_PATH)).toEqual(true);
    });
});
