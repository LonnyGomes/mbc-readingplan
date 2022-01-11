const fs = require('fs-extra');
var moment = require('moment');
const readline = require('readline');

const PLAN_YEAR = 2022;
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
                crlfDelay: Infinity,
            });

            fileStream.on('error', (err) => reject(err));

            rl.on('line', (line) => {
                const [dateStr, verseStr] = line.split(',');
                const passages = this.parseVerse(verseStr);

                passages.forEach((passage) => {
                    const url = this.genBibleGatewayUrl(
                        passage.book,
                        passage.chapter,
                        passage.verse
                    );
                    const dateVal = this.parseDate(dateStr);

                    data.push({
                        verse: passage.label,
                        date: dateVal,
                        url,
                    });
                });
            });

            rl.on('error', (err) => reject(err));

            rl.on('close', () => {
                resolve(data);
            });
        });
    }

    parseVerse(verseStr) {
        if (!verseStr) {
            throw new Error('verse was not supplied');
        }

        const verses = [];
        // multiple verses are separated by pipes
        const verseTokens = verseStr.split(/\s*\|\s*/);
        const processVerse = (verseToken) => {
            let re = null;
            let results = null;
            let verse = null;

            // check for Book Chapter:verse-verse format
            re = /(\d*\s*\w+)\s+(\d+):(\d+-\d+)/;
            results = re.exec(verseToken);
            if (results && results.length >= 4) {
                verse = {
                    label: verseToken,
                    book: results[1],
                    chapter: results[2],
                    verse: results[3],
                };
            }

            if (!verse) {
                // check for Book Chapter:verse format
                re = /(\d*\s*\w+)\s+(\d+):(\d+)/;
                results = re.exec(verseToken);
                if (results && results.length === 4) {
                    verse = {
                        label: verseToken,
                        book: results[1],
                        chapter: results[2],
                        verse: results[3],
                    };
                }
            }

            if (!verse) {
                // check for Book Chapter format
                re = /(\d*\s*\w+)\s+(\d+)/;
                results = re.exec(verseToken);
                if (results && results.length === 3) {
                    verse = {
                        label: results[0],
                        book: results[1],
                        chapter: results[2],
                        verse: null,
                    };
                }
            }

            return verse;
        };

        verseTokens.forEach((curToken) => {
            const curVerse = processVerse(curToken);
            if (curVerse) {
                verses.push(curVerse);
            }
        });

        return verses;
    }

    parseDate(dateStr) {
        const formattedDate = `${dateStr} ${PLAN_YEAR}`;
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
