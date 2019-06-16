const path = require('path');
const Parser = require('../src/parse');
const SAMPLE_INPUT = path.resolve('tests', 'fixtures', 'sample.txt');

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
        try {
            expect.assertions(7);
            const parser = new Parser(SAMPLE_INPUT);
            const results = await parser.parse();
            expect(Array.isArray(results)).toBeTruthy();
            expect(results).toBeDefined();
            expect(results.length).toEqual(2);

            const data = results[0];
            expect(data.week).toBeDefined();
            expect(data.date).toBeDefined();
            expect(data.readings).toBeDefined();
            expect(data.memoryVerse).toBeDefined();
        } catch (err) {}
    });
});
