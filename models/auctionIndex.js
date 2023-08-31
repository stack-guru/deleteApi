var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var auctionIndexSchema = new Schema({
  network: Number,
  latest: Number
}, { collection: 'AuctionIndex' });

module.exports = mongoose.model('AuctionIndex', auctionIndexSchema);
