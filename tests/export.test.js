const Exporter = require('../src/export');

const SAMPLE_INPUT = [{ key: 'value' }];

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
