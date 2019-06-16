const fs = require('fs-extra');
const readline = require('readline');

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
        return new Promise((resolve, reject) => {
            const data = [];
            let isReadingState = true;
            let curWeek = null;
            const fileStream = fs.createReadStream(this.inputPath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            rl.on('line', line => {
                if (line.match(/WEEK \d/)) {
                    if (curWeek) {
                        data.push(curWeek);
                    }

                    isReadingState = true;

                    curWeek = {
                        week: line,
                        date: '',
                        readings: [],
                        memoryVerse: {}
                    };
                } else if (line.match(/^MEMORY VERSE$/)) {
                    isReadingState = false;
                } else {
                    if (isReadingState) {
                        curWeek.readings.push({
                            verse: line,
                            url: ''
                        });
                    } else {
                        curWeek.memoryVerse = {
                            verse: line,
                            url: ''
                        };
                    }
                }
            });

            rl.on('error', () => {
                reject();
            });

            rl.on('close', () => {
                data.push(curWeek);
                resolve(data);
            });
        });
    }
}

module.exports = Parser;
