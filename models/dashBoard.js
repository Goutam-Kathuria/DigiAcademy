const mongoose = require('mongoose');

const trafficSchema = new mongoose.Schema({
    period: {
        type: String,
        enum: ['day', 'month', 'year'],
        required: true
    },
    visits: { type: String, required: true },
    newUsers: { type: String, required: true },
    uniqueUser: { type: String, required: true },
    bounceRate: { type: String, required: true }
});
const userSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    ip: { type: String },
    userAgent: String,
    startedAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
  });
  const conversionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    type: String,
    conversionRate:Number,
    timestamp: { type: Date, default: Date.now }
  });
const dashBoardScheema= new mongoose.Schema({
    income:String,
    // traffic:[trafficSchema]
    traffic:String
})
const sessions = mongoose.model('sessions', userSessionSchema);
const conversion = mongoose.model('conversion', conversionSchema);
const dashBoard = mongoose.model('dashboard', dashBoardScheema);
module.exports = {sessions,conversion,dashBoard}