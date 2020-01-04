const moment = require('moment');
const ics = require('ics');
const fs = require('fs-extra');

class Exporter {
    constructor() {}

    /**
     * Accepts a passage entry and creates an event object parsable by the ics module
     * @param {string} title Title for calendar event
     * @param {number} duration total days for event
     * @param {object} passage and object containing date, verse, and url items
     * @returns {object} ics event object
     */
    mapToEvent(title, duration, passage) {
        if (isNaN(duration)) {
            throw new Error('duration must be supplied as an integer');
        }

        if (!passage.date) {
            throw new Error('date item missing in passage');
        }

        const date = new Date(passage.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const endDate = moment(passage.date)
            .add(duration, 'days')
            .toDate();
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth() + 1;
        const endDay = endDate.getDate();

        const event = {
            start: [year, month, day],
            end: [endYear, endMonth, endDay],
            title,
            description: `Today's reading: ${passage.verse}`,
            url: passage.url
        };

        return event;
    }

    /**
     * Generates ics-compliant objects for all reading passages and memory verses
     * @param {array} readingList array of weeks that compose the reading list
     * @returns {array} list of ics-compliant objects
     */
    genEvents(readingList) {
        let passages = null;
        let curDay = 1;
        const events = [];

        // loop through all weeks
        for (const curWeek of readingList) {
            // loop through all the readings for the week
            passages = curWeek.readings;

            for (const passage of passages) {
                try {
                    const curTitle = `MBC Reading Plan: ${curWeek.week}, Day ${curDay}`;
                    const curEvent = this.mapToEvent(curTitle, 1, passage);
                    events.push(curEvent);
                } catch (error) {
                    console.log('failed to add event', passage, error);
                    continue;
                }
                curDay += 1;
            }
        }

        return events;
    }

    exportIcs(events, outputPath) {
        return new Promise((resolve, reject) => {
            ics.createEvents(events, async (error, icsOutput) => {
                if (error) {
                    console.log(error);
                    reject(error);
                    return;
                }

                try {
                    await fs.writeFile(outputPath, icsOutput);
                    resolve(icsOutput);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}

module.exports = Exporter;
