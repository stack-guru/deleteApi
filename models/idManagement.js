var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var idManagementSchema = new Schema({
  network: Number,
  lastId: Number
}, { collection: 'idManagement' });

module.exports = mongoose.model('idManagement', idManagementSchema);
