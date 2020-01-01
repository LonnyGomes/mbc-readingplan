const path = require('path');
const Parser = require('../src/parse');
const SAMPLE_INPUT = path.resolve('tests', 'fixtures', 'sample2020.txt');

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
        expect.assertions(8);
        const parser = new Parser(SAMPLE_INPUT);
        const results = await parser.parse();
        expect(Array.isArray(results)).toBeTruthy();
        expect(results).toBeDefined();
        expect(results.length).toEqual(2);

        const data = results[0];
        expect(data.week).toBeDefined();
        expect(data.date).toBeDefined();
        expect(Array.isArray(data.readings)).toBeTruthy();
        expect(data.readings).toBeDefined();
        expect(data.memoryVerse).toBeDefined();
    });

    test('should contain a populated object', async () => {
        //expect.assertions(7);
        const parser = new Parser(SAMPLE_INPUT);
        const results = await parser.parse();

        const data = results[0];
        const reading = data.readings[0];

        expect(data.week).toEqual('WEEK 1');
        expect(data.date).toBeDefined();

        expect(data.memoryVerse.verse).toEqual('Psalm 101:2');
        expect(data.memoryVerse.url).toBeDefined();

        expect(reading.verse).toBeDefined();
        expect(reading.verse).toEqual('Psalm 1');
        expect(reading.url).toBeDefined();
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
});
