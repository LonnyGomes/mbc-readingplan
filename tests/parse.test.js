const path = require('path');
const Parser = require('../src/parse');
const SAMPLE_INPUT = path.resolve('tests', 'fixtures', 'sample-2022.txt');
const SAMPLE_MULTI_INPUT = path.resolve(
    'tests',
    'fixtures',
    'sample2020-mult-verse.txt'
);

describe('constructor', () => {
    test('should accept input path', () => {
        const parser = new Parser(SAMPLE_INPUT);
        expect(parser.inputPath).toEqual(SAMPLE_INPUT);
    });

    test('should throw error if no path is supplied', () => {
        const parser = new Parser(SAMPLE_INPUT);
        expect(() => new Parser()).toThrow(/input path must be supplied/);
    });
});

describe('load', () => {
    test('should load inputFile', async () => {
        const parser = new Parser(SAMPLE_INPUT);
        await parser.load();
        expect(parser.data).toBeDefined();
    });

    test('should fail if path does not exist', async () => {
        expect.assertions(1);
        try {
            const parser = new Parser('fake-file.txt');
            await parser.load();
        } catch (err) {
            expect(err.message).toMatch(/^Failed to open input file/);
        }
    });
});

describe('parse', () => {
    test('should return an array of results', async () => {
        const EXPECTED_RESULTS_COUNT = 17;
        const EXPECTED_ASSERTIONS = 6;

        expect.assertions(EXPECTED_ASSERTIONS);
        const parser = new Parser(SAMPLE_INPUT);
        const results = await parser.parse();

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBeTruthy();
        expect(results.length).toEqual(EXPECTED_RESULTS_COUNT);

        const data = results[0];
        expect(data.verse).toBeDefined();
        expect(data.date).toBeDefined();
        expect(data.url).toBeDefined();
    });

    test('should contain a populated object', async () => {
        const EXPECTED_ASSERTIONS = 3;
        const EXPECTED_VERSE = 'Ezra 1';
        // date should equal Jan 1 2022
        const EXPECTED_DATE = new Date(2022, 0, 1);
        const EXPECTED_URL =
            'https://www.biblegateway.com/passage/?search=Ezra%201&version=ESV';

        expect.assertions(EXPECTED_ASSERTIONS);
        const parser = new Parser(SAMPLE_INPUT);
        const results = await parser.parse();

        const data = results[0];

        expect(data.verse).toEqual(EXPECTED_VERSE);
        expect(data.date).toEqual(EXPECTED_DATE);
        expect(data.url).toEqual(EXPECTED_URL);
    });

    test.skip('should handle days with multiple verses', async () => {
        expect.assertions(13);
        const parser = new Parser(SAMPLE_MULTI_INPUT);
        const results = await parser.parse();
        // date should equal Jan 1 2020
        const expectedFirstDate = new Date(2020, 1, 9);
        const expectedSecondDate = new Date(2020, 1, 15);

        const data = results[0];

        expect(results.length).toEqual(2);
        expect(data.week).toEqual('WEEK 7');
        expect(data.readings.length).toEqual(14);
        expect(data.startDate).toEqual(expectedFirstDate);
        expect(data.endDate).toEqual(expectedSecondDate);

        expect(data.memoryVerse.verse).toEqual('1 Corinthians 1:17');
        expect(data.memoryVerse.url).toEqual(
            'https://www.biblegateway.com/passage/?search=1%20Corinthians%201:17&version=ESV'
        );

        let reading = data.readings[0];
        expect(reading.verse).toEqual('1 Corinthians 1:1-31');
        expect(reading.url).toEqual(
            'https://www.biblegateway.com/passage/?search=1%20Corinthians%201:1-31&version=ESV'
        );
        expect(reading.date).toEqual(expectedFirstDate);

        reading = data.readings[1];
        expect(reading.verse).toEqual('Psalm 40');
        expect(reading.url).toEqual(
            'https://www.biblegateway.com/passage/?search=Psalm%2040&version=ESV'
        );
        expect(reading.date).toEqual(expectedFirstDate);
    });
});

describe('parseVerse', () => {
    test('should throw an error if argument is not supplied', () => {
        const parser = new Parser(SAMPLE_INPUT);
        expect(() => parser.parseVerse()).toThrow(/verse was not supplied/);
    });

    test('should parse verse in BOOK CHAPTER format', () => {
        let result = null;
        let results = null;
        const parser = new Parser(SAMPLE_INPUT);

        // test base case
        results = parser.parseVerse('Genesis 11');
        expect(Array.isArray(results)).toBeTruthy();
        expect(results.length).toBe(1);
        result = results[0];
        expect(result.label).toEqual('Genesis 11');
        expect(result.book).toEqual('Genesis');
        expect(result.chapter).toEqual('11');
        expect(result.verse).toBeNull();

        // test case with dashes
        results = parser.parseVerse('1 Corinthians 9-10');
        expect(Array.isArray(results)).toBeTruthy();
        expect(results.length).toBe(1);
        result = results[0];
        expect(result.label).toEqual('1 Corinthians 9');
        expect(result.book).toEqual('1 Corinthians');
        expect(result.chapter).toEqual('9');
        expect(result.verse).toBeNull();
    });

    test('should parse verse in BOOK CHAPTER:VERSE format', () => {
        let result = null;
        const parser = new Parser(SAMPLE_INPUT);
        const results = parser.parseVerse('2 Samuel 3:1');

        expect(Array.isArray(results)).toBeTruthy();
        expect(results.length).toBe(1);
        result = results[0];
        expect(result.label).toEqual('2 Samuel 3:1');
        expect(result.book).toEqual('2 Samuel');
        expect(result.chapter).toEqual('3');
        expect(result.verse).toEqual('1');
    });

    test('should parse multiple verses separated by a "|"', () => {
        let result = null;
        const parser = new Parser(SAMPLE_MULTI_INPUT);
        const results = parser.parseVerse(
            '2 Samuel 3:1 | 1 Corinthians 1:1-31'
        );

        expect(Array.isArray(results)).toBeTruthy();
        expect(results.length).toBe(2);
        result = results[0];
        expect(result.label).toEqual('2 Samuel 3:1');
        expect(result.book).toEqual('2 Samuel');
        expect(result.chapter).toEqual('3');
        expect(result.verse).toEqual('1');
        result = results[1];
        expect(result.label).toEqual('1 Corinthians 1:1-31');
        expect(result.book).toEqual('1 Corinthians');
        expect(result.chapter).toEqual('1');
        expect(result.verse).toEqual('1-31');
    });
});

describe('parseDate', () => {
    test('should be defined', () => {
        var parser = new Parser(SAMPLE_INPUT);

        expect(parser.parseDate).toBeDefined();
    });

    test('should return null if null is supplied', () => {
        let result = null;
        var parser = new Parser(SAMPLE_INPUT);
        result = parser.parseDate();

        expect(result).toBeNull();
    });

    test('should return null if invalid date is supplied', () => {
        let result = null;
        var parser = new Parser(SAMPLE_INPUT);
        result = parser.parseDate('Bad 42');

        expect(result).toBeNull();
    });

    test('should a Date object for a valid date string', () => {
        const SAMPLE_DATE = 'Jan 10';
        const expected = new Date(2022, 0, 10);
        let result = null;
        var parser = new Parser(SAMPLE_INPUT);
        result = parser.parseDate(SAMPLE_DATE);

        expect(result).toEqual(expected);
    });
});

describe('genBibleGatewayUrl', () => {
    test('should return null if no parameters are supplied', () => {
        let result = null;
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genBibleGatewayUrl();

        expect(result).toBeNull();
    });

    test('should return null if only a book is supplied', () => {
        let result = null;
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genBibleGatewayUrl('Psalm');

        expect(result).toBeNull();
    });

    test('should return url when only book and chapter are supplied', () => {
        let result = null;
        const expected =
            'https://www.biblegateway.com/passage/?search=Psalm%2023&version=ESV';
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genBibleGatewayUrl('Psalm', 23);

        expect(result).toEqual(expected);
    });

    test('should return url specific verse all parameters are supplied', () => {
        let result = null;
        const expected =
            'https://www.biblegateway.com/passage/?search=Psalm%2031:1&version=ESV';
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genBibleGatewayUrl('Psalm', 31, 1);

        expect(result).toEqual(expected);
    });

    test('should return url when a range of verses is supplied', () => {
        let result = null;
        const expected =
            'https://www.biblegateway.com/passage/?search=Psalm%2031:1-2&version=ESV';
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genBibleGatewayUrl('Psalm', 31, '1-2');

        expect(result).toEqual(expected);
    });
});

describe('genEsvApiUrl', () => {
    test('should return null if no parameters are supplied', () => {
        let result = null;
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genEsvApiUrl();

        expect(result).toBeNull();
    });

    test('should return null if only a token is supplied', () => {
        let result = null;
        const token = 'f4k3t0k3n';
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genEsvApiUrl(token);

        expect(result).toBeNull();
    });

    test('should return null if a chapter is not supplied', () => {
        let result = null;
        const token = 'f4k3t0k3n';
        const book = 'John';
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genEsvApiUrl(token, book);

        expect(result).toBeNull();
    });

    test('should return a valid object containing first verse if verse is not supplied', () => {
        let result = null;
        const token = 'f4k3t0k3n';
        const book = 'John';
        const chapter = '3';
        const expected = {
            header: `Authorization: Token ${token}`,
            url: `https://api.esv.org/v3/passage/text/?q=${book}+${chapter}:1`
        }
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genEsvApiUrl(token, book, chapter);

        expect(result).toEqual(expected);
    });

    test('should return a valid object if all parameters are supplied', () => {
        let result = null;
        const token = 'f4k3t0k3n';
        const book = 'John';
        const chapter = '3';
        const verse = '16x';
        const expected = {
            header: `Authorization: Token ${token}`,
            url: `https://api.esv.org/v3/passage/text/?q=${book}+${chapter}:${verse}`
        }
        const parser = new Parser(SAMPLE_INPUT);

        result = parser.genEsvApiUrl(token, book, chapter, verse);

        expect(result).toEqual(expected);
    });
});

