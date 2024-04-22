const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptions = Schema({
    endpoint : { type : String , required : true} ,
    expirationTime : { type : Date , default : null },
    keys : { type : Object , required : true }
});

module.exports = mongoose.model('Subscriptions' , subscriptions);