const Exporter = require('../src/export');
const SAMPLE_INPUT = require('./fixtures/parsed-sample.json');

describe('constructor', () => {
    test('should accept passages array', () => {
        const exporter = new Exporter(SAMPLE_INPUT);
        expect(exporter.passages).toEqual(SAMPLE_INPUT);
    });

    test('should throw error if no path is supplied', () => {
        const exporter = new Exporter(SAMPLE_INPUT);
        expect(() => new Exporter()).toThrow(
            /passages array must be supplied supplied/
        );
    });
});

describe('mapToEvent', () => {
    test('should throw an error if duration is not supplied', () => {
        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.readings[0]);
        const exporter = new Exporter(SAMPLE_INPUT);

        expect(() => exporter.mapToEvent('title')).toThrow(
            /duration must be supplied as an integer/
        );
    });

    test('should throw an error if duration is not an integer', () => {
        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.readings[0]);
        const exporter = new Exporter(SAMPLE_INPUT);

        expect(() => exporter.mapToEvent('title', '1a', passage)).toThrow(
            /duration must be supplied as an integer/
        );
    });

    test('should throw an error if passage object does not contain a date element', () => {
        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.readings[0]);
        const exporter = new Exporter(SAMPLE_INPUT);

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
            description: 'Psalm 1',
            url:
                'https://www.biblegateway.com/passage/?search=Psalm%201&version=ESV'
        };

        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.readings[0]);
        const exporter = new Exporter(SAMPLE_INPUT);
        const result = exporter.mapToEvent('Day 1 Reading', 1, passage);
        expect(result).toEqual(expectedResult);
    });

    test('should generate ics-compliant event object that spans multiple days', () => {
        const expectedResult = {
            start: [2020, 1, 1],
            end: [2020, 1, 8],
            title: 'Week 1 Memory Verse',
            description: 'Psalm 101:2',
            url:
                'https://www.biblegateway.com/passage/?search=Psalm%20101:2&version=ESV'
        };

        const weekObj = SAMPLE_INPUT[0];

        const passage = Object.assign({}, weekObj.memoryVerse);
        passage.date = weekObj.startDate;
        const exporter = new Exporter(SAMPLE_INPUT);
        const result = exporter.mapToEvent('Week 1 Memory Verse', 7, passage);
        expect(result).toEqual(expectedResult);
    });
});
