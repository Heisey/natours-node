// ?????????????????????????????????????????????????????????
// ?????????????????? Morgan Handler ???????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????
const chalk = require('chalk');
const morgan = require('morgan');

// ~~ Morgan Function
const morganMiddleware = morgan(function (tokens, req, res) {
    return [
        chalk.blue.bold.inverse(tokens.method(req, res)),
        chalk.blue.bold.inverse(tokens.status(req, res)),
        chalk.blue.bold.inverse(tokens.url(req, res)),
        chalk.blue.bold.inverse(tokens['user-agent'](req, res)),
    ].join('');
});

module.exports = morganMiddleware