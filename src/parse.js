const fs = require('fs-extra');

class Parser {
    constructor(inputPath) {
        if (!inputPath) {
            throw new Error('input path must be supplied');
        }
        this.inputPath = inputPath;
    }
}

module.exports = Parser;
