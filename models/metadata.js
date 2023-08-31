var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var metadataSchema = new Schema({
  network: Number,
  platform: String,
  image: String,
  name: String,
  description: String
}, { collection: 'metadata' });

module.exports = mongoose.model('metadata', metadataSchema);
