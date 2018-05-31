const aws       = require('aws-sdk');
const config    = require('config');
const winston   = require('winston');

const initWinstonLoggers = function () {
  winston.remove(winston.transports.Console);
  if (config.log.console) {
    winston.add(winston.transports.Console, {
      level: config.log.level,
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: false
    });
  }
  if (config.log.file) {
    winston.add(winston.transports.File, {
      prettyPrint: false,
      level: config.log.level,
      silent: false,
      colorize: false,
      timestamp: true,
      filename: './logs/' + pkgjson.name + '.log',
      maxsize: 40000,
      maxFiles: 10,
      json: false
    });
  }
};
initWinstonLoggers();

winston.setLevels({
  error: 0, warn: 1, info: 2, verbose: 3, debug: 4
});
winston.addColors(config.log.colors);

const yargs = require('yargs');
const argv = yargs
  .usage('Usage: node . <command> [options]')
  .commandDir('commands')
  .option('debug', {
    alias: 'd',
    default: false,
    describe: 'more verbose, debug output for commands'
  })
  .help('h')
  .alias('help', 'h')
  .demandCommand(1, 'you must include a command')
  .check(function (argv) {
    if (argv.debug) {
      config.log.level = "debug";
      initWinstonLoggers();
    }
    return true;
  })
  .wrap(yargs.terminalWidth()/2)
  .argv;
