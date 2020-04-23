const db = require('../utils/db');
const config = require('../config/default.json');

module.exports = {
    all: (offset) => db.load(`select * from upgrade_requests JOIN bidders ON bidders.id=upgrade_requests.bidder_id limit ${config.paginate.limit} offset ${offset}`),
    count: async() => {
        const rows = await db.load(`select count(*) as total from upgrade_requests`)
        return rows[0].total;
    },
    single: (id) => db.load(`select * from upgrade_requests JOIN bidders ON bidders.id=upgrade_requests.bidder_id WHERE upgrade_requests.bidder_id=${id}`),
    del: (id) => db.del('upgrade_requests', { bidder_id: id }),
    add: entity => db.add('upgrade_requests', entity),
}