// ?????????????????????????????????????????????????????????
// ??????????????????? Server ??????????????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
const app = require('./app')

// ??????????????????? Vendor Modules ??????????????????????
const chalk = require('chalk');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// ~~ Set environment variables
dotenv.config({
    path: './config.env'
})

// ~~ Global Varialbes
const log = console.log;

// ~~ Set Port
const PORT = process.env.PORT;

// ~~ Create DB String
const DB = process.env.DB.replace('<PASSWORD>', process.env.DBPASSWORD);

// ~~ Start App Server
app.listen(PORT, () => {

    // ~~ Check Env to set custom response
    if (process.env.NODE_ENV === 'development') {
        log(chalk.green.bold.inverse(`<<<<< App is Running on Port ${PORT} >>>>>`));
    } else {
        log(`<<<<< App is Running on Port ${PORT} >>>>>`)
    }

});

// ## Connect to DB
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {

    // ~~ Check Env to set custom response
    if (process.env.NODE_ENV === 'development') {
        log(chalk.cyan.bold.inverse('<<<<< DB Connected Successfully >>>>>'))
    } else {
        log('<<<<< DB Connected Successfully >>>>>')
    }

})