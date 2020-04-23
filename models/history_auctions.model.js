const db = require('../utils/db');
module.exports = {
    add: entity => db.add("history_auctions", entity)
}