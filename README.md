# MBC Reading Plan calendar

![Node CI](https://github.com/LonnyGomes/mbc-readingplan/workflows/Node%20CI/badge.svg)

Generates a .ics calendar based off of the [McLean Bible Church Reading plan](https://mcleanbible.org/wp-content/uploads/2019/12/2020BibleReadingPlan.pdf).

## Usage

NodeJS is required to run this script.

### ESV API

To include memory verse text you must retrieve an API key from https://api.esv.org/docs/passage-text/. You can make use of your API key by setting it to the environment variable named `ESV_TOKEN`.

Once node is installed, and the API key is optionally set you can run the following:

```bash
git clone git@github.com:LonnyGomes/mbc-readingplan.git
cd mbc-readingplan
npm install -g .
# generate daily reading calendar
mbc-calexport -i input/readingplan-2020-psalm.txt -o calendar.ics
# generate memory verse calendar
mbc-calexport -m -i input/readingplan-2020-psalm.txt -o memory-verse-calendar.ics
```

## Expected text format

This export script expects a text representation of the reading plan in the following format:

```
[WEEK #]
[DATE],[VERSE]
Memory Verse: [VERSE]
...
```

| Key      | Format                             | Examples             |
| -------- | ---------------------------------- | -------------------- |
| [WEEK #] | WEEK \d                            | WEEK 1, WEEK 4       |
| [DATE]   | Month Day                          | Jan 6, Feb 2         |
| [VERSE]  | Book Chapter or Book Chapter:Verse | Psalm 8, Psalm 101:2 |

### Example input file

```
WEEK 1
Jan 1,Psalm 1
Jan 2,Psalm 2
Jan 3,Psalm 3
Jan 4,Psalm 4
Jan 5,Psalm 5
Memory Verse: Psalm 101:2

WEEK 2
Jan 6,Psalm 6
Jan 7,Psalm 7
Jan 8,Psalm 8
Jan 9,Psalm 9
Jan 10,Psalm 10
Jan 11,Psalm 11
Jan 12,Psalm 12
Memory Verse: Psalm 106:8
```

## Tests

Unit tests are built using jest can can be run with the following command

```bash
npm test
```
