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
```

## Expected text format

This export script expects a text representation of the reading plan in the following CSV format:

```
[DATE],[VERSE] | [VERSE]
[DATE],[VERSE] | [VERSE]
[DATE],[VERSE] | [VERSE]
...
```

| Key      | Format                             | Examples             |
| -------- | ---------------------------------- | -------------------- |
| *[DATE]*   | Month Day                          | Jan 6, Feb 2         |
| *[VERSE]*  | Book Chapter or Book Chapter:Verse | Psalm 8, Psalm 101:2 |
| *\|*       | Separator for multiple verses

### Example input file

```
January 1,Ezra 1 | Acts 1
January 2,Ezra 2 | Acts 2
January 3,Ezra 3 | Acts 3
January 4,Ezra 4 | Acts 4
January 5,Ezra 5 | Acts 5
January 6,Ezra 6 | Acts 6
January 7,Ezra 7 | Acts 7
January 8,Ezra 8 | Acts 8
January 9,Ezra 9 | Acts 9 | Acts 10
```

## Tests

Unit tests are built using jest can can be run with the following command

```bash
npm test
```

To test while developing run the the test watch command:

```bash
npm run test:watch
```
