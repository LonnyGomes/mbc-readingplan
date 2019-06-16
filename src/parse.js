const fs = require('fs-extra');

class Parser {
    constructor(inputPath) {
        if (!inputPath) {
            throw new Error('input path must be supplied');
        }
        this.inputPath = inputPath;
    }

    async load() {
        try {
            this.data = await fs.readFile(this.inputPath);
        } catch (error) {
            throw new Error(`Failed to open input file: ${error.message}`);
        }
    }

    async parse() {
        try {
        } catch (error) {
            throw new Error(`parse error: ${error}`);
        }
    }
}

module.exports = Parser;
