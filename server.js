const express = require('express');
require('dotenv').config()
const session=require('express-session')
const {sessions} = require('./models/dashBoard');
const connectDb = require('./database/database')
const MongoStore = require('connect-mongo'); 
const cors = require('cors')
connectDb();

const app = express()
app.use(cors())
app.use('/uploads', express.static('uploads'));
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 30 }
}));

app.use(express.json())
const Routes = require('./routes/routes')
app.get('/',(req,res)=>{
    res.send('social media api is running ...')
})
app.use('/digi',Routes);
app.listen(5000,()=> console.log('Server Running On 5000'))