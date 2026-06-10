#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var fsExtra = require('fs-extra');
var yargs = require('yargs');

var cmds = {};

cmds.init = {
  command: 'init',
  desc: 'initialize context directory with shared symlink to @plotdb/guides/src',
  handler: function(argv) {
    var cwd = process.cwd();
    var contextDir = path.join(cwd, 'context');
    var sharedLink = path.join(contextDir, 'shared');
    var guidesRoot = path.relative(contextDir, path.join(cwd, 'node_modules', '@plotdb', 'guides', 'src'));

    if (!fs.existsSync(guidesRoot)) {
      console.error('[ERROR] @plotdb/guides is not installed. Cannot find: ' + guidesRoot);
      process.exit(1);
    }

    fsExtra.ensureDirSync(contextDir);

    var linkExists = false;
    try { fs.lstatSync(sharedLink); linkExists = true; } catch(e) {}
    if (linkExists) {
      console.log('context/shared already exists. skipped.');
      return;
    }

    fs.symlinkSync(guidesRoot, sharedLink);
    console.log('created: context/shared -> ' + guidesRoot);
  }
};

var arg = yargs;
for (var k in cmds) {
  arg = arg.command(cmds[k]);
}
arg.demandCommand(1, 'Please specify a command.')
  .help()
  .argv;
