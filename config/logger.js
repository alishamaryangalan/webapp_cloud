const log4js = require('log4js');
log4js.configure({
    appenders: { logs: { type: 'file', filename: '/home/ec2-user/webapp/logs/csye6225.log' } },
    categories: { default: { appenders: ['logs'], level: 'info' } }
});
const logger = log4js.getLogger('logs');
module.exports = {logger}