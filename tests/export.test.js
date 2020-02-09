const path = require('path');
const fs = require('fs-extra');
const BASE_FIXTURES_PATH = path.resolve(__dirname, 'fixtures');
const Exporter = require('../src/export');
const SAMPLE_INPUT = require('./fixtures/parsed-sample.json');
const SAMPLE_MULTI_INPUT = require('./fixtures/parsed-multi-verse-sample.json');

const axios = require('axios').default;
jest.mock('axios');

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

        const item = result[0];
        expect(item.start).toEqual([2020, 1, 1]);
        expect(item.end).toEqual([2020, 1, 2]);
        expect(item.title).toEqual('MBC Reading Plan: Psalm 1');
        expect(item.description).toEqual('WEEK 1\n\nToday\'s reading: Psalm 1');
        expect(item.url).toEqual('https://www.biblegateway.com/passage/?search=Psalm%201&version=ESV');
    });

    test('should generate array of events for multiple verses per day', () => {
        const exporter = new Exporter();
        const result = exporter.genEvents(SAMPLE_MULTI_INPUT);

        expect(Array.isArray(result)).toEqual(true);
        expect(result.length).toEqual(28);

        let item = result[0];
        expect(item.start).toEqual([2020, 2, 9]);
        expect(item.end).toEqual([2020, 2, 10]);
        expect(item.title).toEqual('MBC Reading Plan: 1 Corinthians 1:1-31');
        expect(item.description).toEqual('WEEK 7\n\nToday\'s reading: 1 Corinthians 1:1-31');
        expect(item.url).toEqual('https://www.biblegateway.com/passage/?search=1%20Corinthians%201:1-31&version=ESV');

        item = result[1];
        expect(item.start).toEqual([2020, 2, 9]);
        expect(item.end).toEqual([2020, 2, 10]);
        expect(item.title).toEqual('MBC Reading Plan: Psalm 40');
        expect(item.description).toEqual('WEEK 7\n\nToday\'s reading: Psalm 40');
        expect(item.url).toEqual('https://www.biblegateway.com/passage/?search=Psalm%2040&version=ESV');
    });
});

describe('genMemoryVerseEvents', () => {
    test('should generate array of memory verse events', async () => {
        expect.assertions(6);
        const exporter = new Exporter();
        const expectedApiResults = {
            data: {
                query: 'John 3:16',
                canonical: 'John 3:16',
                parsed: [],
                passage_meta: [],
                passages: [
                    'John 3:16\n' +
                    '\n' +
                    'For God So Loved the World\n' +
                    '\n' +
                    '  [16] “For God so loved the world,(1) that he gave his only Son, that whoever believes in him should not perish but have eternal life.\n' +
                    '\n' +
                    'Footnotes\n' +
                    '\n' +
                    '(1) 3:16 Or *For this is how God loved the world*\n' +
                    ' (ESV)'
                ]
            },
            status: 200,
            statusText: 'OK'
        };

        axios.mockResolvedValue(expectedApiResults);
        const result = await exporter.genMemoryVerseEvents(SAMPLE_INPUT);

        expect(Array.isArray(result)).toEqual(true);
        expect(result.length).toEqual(2);

        const firstResult = result[0]
        expect(firstResult.start).toBeDefined();
        expect(firstResult.end).toBeDefined();
        expect(firstResult.title).toBeDefined();
        expect(firstResult.description).toBeDefined();
    });
});

describe('getVerseContents', () => {
    test('should retrieve verse contents from API', async () => {
        expect.assertions(3);
        const exporter = new Exporter();
        const sampleHeader = "Authorization: Token XXXXXXXXXX";
        const sampleUrl = 'https://api.esv.org/v3/passage/text/?q=Psalm+8:1-5';
        const expectedResults = {
            data: {
                query: 'John 3:16',
                canonical: 'John 3:16',
                parsed: [],
                passage_meta: [],
                passages: [
                    'John 3:16\n' +
                    '\n' +
                    'For God So Loved the World\n' +
                    '\n' +
                    '  [16] “For God so loved the world,(1) that he gave his only Son, that whoever believes in him should not perish but have eternal life.\n' +
                    '\n' +
                    'Footnotes\n' +
                    '\n' +
                    '(1) 3:16 Or *For this is how God loved the world*\n' +
                    ' (ESV)'
                ]
            },
            status: 200,
            statusText: 'OK'
        };

        axios.mockResolvedValue(expectedResults);
        const result = await exporter.getVerseContents(sampleHeader, sampleUrl);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data.passages)).toEqual(true);
        expect(result.data.passages.length).toEqual(1);
    });

    test('should return null if header or url is not defined', async () => {
        expect.assertions(1);
        const exporter = new Exporter();

        const result = await exporter.getVerseContents(null, null);
        expect(result).toEqual(null);
    });

    test('should throw error on invalid API call', async () => {
        expect.assertions(1);
        const errMsg = 'bad API call';
        const sampleHeader = "Authorization: Token XXXXXXXXXX";
        const sampleUrl = 'https://api.esv.org/v3/passage/text/?q=Psalm+8:1-5';

        const exporter = new Exporter();

        axios.mockImplementation(() => Promise.reject(new Error(errMsg)));
        try {
            await exporter.getVerseContents(sampleHeader, sampleUrl);
        } catch (error) {
            expect(error.message).toEqual(errMsg);
        }
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
