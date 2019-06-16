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

    parseVerse(verseStr) {
        if (!verseStr) {
            throw new Error('verse was not supplied');
        }
        const re = /(\d*\s*\w+)\s+(\d+)/;
        const results = re.exec(verseStr);
        let verse = {};
        if (results.length === 3) {
            verse = {
                label: results[0],
                book: results[1],
                chapter: results[2],
                verse: null
            };
        }

        return verse;
    }
}

// https://www.biblegateway.com/passage/?search=Genesis+7%3A9&version=ESV
module.exports = Parser;
