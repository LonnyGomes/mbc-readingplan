const path = require('path');
const fs = require('fs-extra');
const readingPlanExport = require('../src/index');
const BASE_FIXTURES_PATH = path.resolve(__dirname, 'fixtures');
const INPUT_FILE = path.resolve(BASE_FIXTURES_PATH, 'sample-2022.txt');
const OUTPUT_PATH = path.resolve(BASE_FIXTURES_PATH, 'tmp-index-test.ics');

describe('index', () => {
    beforeEach(() => fs.removeSync(OUTPUT_PATH));
    afterEach(() => fs.removeSync(OUTPUT_PATH));

    test('should parse a text version of reading plan and export an ics file', async () => {
        expect.assertions(1);
        await readingPlanExport(INPUT_FILE, OUTPUT_PATH);
        expect(fs.pathExistsSync(OUTPUT_PATH)).toEqual(true);
    });

    test('should throw an error if invalid file is supplied', async () => {
        expect.assertions(1);

        try {
            await readingPlanExport('BOGUS_PATH', OUTPUT_PATH);
        } catch (error) {
            expect(error.message).toMatch(/no such file or directory/);
        }
    });
});
