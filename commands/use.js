const fs      = require('fs');
const path    = require('path');
const winston = require('winston');
const glob    = require('glob');

exports.command = 'use [name]';
exports.desc    = 'switch to a different configuration in /config\n';

function deleteExisting() {
  try {
    fs.unlinkSync(path.join(__dirname, '..', 'config', 'local.js'))
  } catch (error) {}
}

exports.handler = function(argv) {
  if (!argv.name) return winston.error('Please enter a name for the new configuration');

  if (fs.existsSync(path.join(__dirname, '..', 'config', argv.name + '.js'))) {
    deleteExisting();
    fs.symlinkSync(
      path.join(__dirname, '..', 'config', argv.name + '.js'),
      path.join(__dirname, '..', 'config', 'local.js')
    );
    winston.info(`Now using ${argv.name} gallery configuration`);
  } else {
    return winston.error(`Unable to find config file config/${argv.name}.js`);
  }
};
