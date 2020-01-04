class Exporter {
    constructor(passages) {
        if (!passages) {
            throw new Error('passages array must be supplied supplied');
        }
        this.passages = passages;
    }
}

module.exports = Exporter;
