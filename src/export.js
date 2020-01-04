const moment = require('moment');

class Exporter {
    constructor(passages) {
        if (!passages) {
            throw new Error('passages array must be supplied supplied');
        }
        this.passages = passages;
    }

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
            description: passage.verse,
            url: passage.url
        };

        return event;
    }
}

module.exports = Exporter;
