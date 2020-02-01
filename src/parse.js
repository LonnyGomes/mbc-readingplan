const fs = require('fs-extra');
var moment = require('moment');
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

    parse(token = null) {
        return new Promise((resolve, reject) => {
            const data = [];
            let isReadingState = true;
            let hasReadFirstDate = false;
            let curWeek = null;
            const fileStream = fs.createReadStream(this.inputPath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            fileStream.on('error', err => reject(err));

            rl.on('line', line => {
                if (line.match(/WEEK \d/)) {
                    if (curWeek) {
                        data.push(curWeek);
                    }

                    isReadingState = true;
                    hasReadFirstDate = false;

                    curWeek = {
                        week: line,
                        startDate: null,
                        endDate: null,
                        readings: [],
                        memoryVerse: {}
                    };
                } else if (line.match(/^Memory Verse:/)) {
                    const [mvToken, memoryVerseStr] = line.split(
                        /^Memory Verse: /
                    );
                    isReadingState = false;
                    const [passage] = this.parseVerse(memoryVerseStr);
                    const url = this.genBibleGatewayUrl(
                        passage.book,
                        passage.chapter,
                        passage.verse
                    );
                    curWeek.memoryVerse = {
                        verse: memoryVerseStr,
                        url
                    };

                    // if a token is supplied, generate api URL and header for memory verse
                    if (token) {
                        // generate the api request header/url to retrieve the text
                        const apiRequest = this.genEsvApiUrl(token, passage.book, passage.chapter, passage.verse);
                        Object.assign(curWeek.memoryVerse, {
                            apiUrl: apiRequest.url,
                            apiHeader: apiRequest.header
                        });
                    }
                } else {
                    if (isReadingState) {
                        const [dateStr, verseStr] = line.split(',');
                        const [passage] = this.parseVerse(verseStr);
                        const url = this.genBibleGatewayUrl(
                            passage.book,
                            passage.chapter,
                            passage.verse
                        );
                        const dateVal = this.parseDate(dateStr);

                        if (!hasReadFirstDate) {
                            hasReadFirstDate = true;
                            curWeek.startDate = dateVal;
                            curWeek.endDate = moment(dateVal)
                                .add(6, 'days')
                                .toDate();
                        }

                        curWeek.readings.push({
                            verse: verseStr,
                            date: dateVal,
                            url
                        });
                    }
                }
            });

            rl.on('error', err => reject(err));

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
        let re = null;
        let results = null;
        let verse = null;

        // check for Book Chapter:verse format
        re = /(\d*\s*\w+)\s+(\d+):(\d+)/;
        results = re.exec(verseStr);
        if (results && results.length === 4) {
            verse = {
                label: results[0],
                book: results[1],
                chapter: results[2],
                verse: results[3]
            };
        }

        if (!verse) {
            // check for Book Chapter format
            re = /(\d*\s*\w+)\s+(\d+)/;
            results = re.exec(verseStr);
            if (results && results.length === 3) {
                verse = {
                    label: results[0],
                    book: results[1],
                    chapter: results[2],
                    verse: null
                };
            }
        }

        return [verse];
    }

    parseDate(dateStr) {
        const formattedDate = `${dateStr} 2020`;
        const parsedDate = moment(formattedDate, 'MMM D YYYY');

        return parsedDate.isValid() ? parsedDate.toDate() : null;
    }

    genBibleGatewayUrl(book, chapter, verse) {
        const baseUrl = 'https://www.biblegateway.com/passage/?search=';
        const versionParam = 'version=ESV';
        let passage = null;

        if (!book || !chapter) {
            return null;
        }

        passage = `${book} ${chapter}`;

        if (verse) {
            passage = `${passage}:${verse}`;
        }

        const url = `${baseUrl}${passage}&${versionParam}`;

        return encodeURI(url);
    }

    genEsvApiUrl(token, book, chapter, verse) {
        const baseUrl = 'https://api.esv.org/v3/passage/text/?q=';
        const header = `Authorization: Token ${token}`;

        if (!token || !book || !chapter) {
            return null;
        }

        if (!verse) {
            verse = '1';
        }

        const passage = `${book}+${chapter}:${verse}`;
        const url = `${baseUrl}${passage}`;

        return { header, url };
    }
}

// https://www.biblegateway.com/passage/?search=Genesis+7%3A9&version=ESV
module.exports = Parser;
