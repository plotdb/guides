#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var os = require('os');
var fsExtra = require('fs-extra');
var yargs = require('yargs');
var child_process = require('child_process');

var CONTEXT_HOME = path.join(os.homedir(), '.context', '@plotdb', 'guides');

var cmds = {};

cmds.init = {
  command: 'init',
  desc: 'initialize context directory with shared symlink to @plotdb/guides/src',
  builder: function(yargs) {
    return yargs.option('global', {
      alias: 'g',
      type: 'boolean',
      description: 'link context/shared to the globally installed @plotdb/guides package'
    });
  },
  handler: function(argv) {
    var cwd = process.cwd();
    var contextDir = path.join(cwd, 'context');
    var sharedLink = path.join(contextDir, 'shared');
    var isGlobal = argv.global || false;
    var sourceAbs, sourceDisplay;

    if (isGlobal) {
      sourceAbs = path.join(CONTEXT_HOME, 'src');
      sourceDisplay = CONTEXT_HOME + '/src';
      if (!fs.existsSync(sourceAbs)) {
        if (!fs.existsSync(CONTEXT_HOME)) {
          console.log('Cloning @plotdb/guides to ' + CONTEXT_HOME + ' ...');
          fsExtra.ensureDirSync(path.dirname(CONTEXT_HOME));
          try {
            child_process.execSync('git clone https://github.com/plotdb/guides ' + CONTEXT_HOME, {stdio: 'inherit'});
          } catch(e) {
            console.error('Failed to clone @plotdb/guides: ' + e.message);
            process.exit(1);
          }
        }
        if (!fs.existsSync(sourceAbs)) {
          console.error('Could not find src/ in ' + CONTEXT_HOME);
          process.exit(1);
        }
      }
    } else {
      sourceAbs = path.join(cwd, 'node_modules', '@plotdb', 'guides', 'src');
      sourceDisplay = path.relative(cwd, sourceAbs);
      if (!fs.existsSync(sourceAbs)) {
        console.error('Local @plotdb/guides was not found.\n\nInstall it locally:\n  npm install -D github:plotdb/guides\n\nOr use the globally installed package:\n  npx @plotdb/guides init -g');
        process.exit(1);
      }
    }

    fsExtra.ensureDirSync(contextDir);

    // handle context/shared
    var linkStatus = 'created';
    try {
      var stat = fs.lstatSync(sharedLink);
      if (stat.isSymbolicLink()) {
        var current = fs.readlinkSync(sharedLink);
        var currentAbs = path.resolve(contextDir, current);
        if (currentAbs === sourceAbs) {
          linkStatus = 'already configured';
        } else {
          fs.unlinkSync(sharedLink);
          linkStatus = 'updated';
        }
      } else {
        console.error('context/shared already exists and is not a symbolic link.\n\nMove or remove it manually before running init again.');
        process.exit(1);
      }
    } catch(e) {
      // lstatSync threw: path doesn't exist, proceed to create
    }

    if (linkStatus !== 'already configured') {
      var linkTarget = isGlobal ? sourceAbs : path.relative(contextDir, sourceAbs);
      fs.symlinkSync(linkTarget, sharedLink);
    }

    // update .gitignore
    var gitignorePath = path.join(cwd, '.gitignore');
    var gitignoreStatus = 'updated';
    var gitignoreEntry = '/context/shared';
    var existing = '';
    if (fs.existsSync(gitignorePath)) {
      existing = fs.readFileSync(gitignorePath, 'utf8');
    }
    if (existing.split('\n').some(function(line) { return line.trim() === gitignoreEntry; })) {
      gitignoreStatus = 'already configured';
    } else {
      var append = (existing.length && !existing.endsWith('\n') ? '\n' : '') + gitignoreEntry + '\n';
      fs.appendFileSync(gitignorePath, append, 'utf8');
    }

    // create context/index.json
    var indexPath = path.join(contextDir, 'index.json');
    var indexStatus;
    if (fs.existsSync(indexPath)) {
      indexStatus = 'unchanged';
    } else {
      fs.writeFileSync(indexPath, JSON.stringify({
        system: 'check path \'context/shared\' for context info (from github:plotdb/guides)'
      }, null, 2) + '\n', 'utf8');
      indexStatus = 'created';
    }

    console.log('@plotdb/guides initialized.\n');
    console.log('Mode: ' + (isGlobal ? 'global' : 'local'));
    console.log('Source: ' + sourceDisplay);
    console.log('Link: context/shared (' + linkStatus + ')');
    console.log('Git ignore: ' + gitignoreEntry + ' (' + gitignoreStatus + ')');
    console.log('Context index: ' + indexStatus);
  }
};

var arg = yargs;
for (var k in cmds) {
  arg = arg.command(cmds[k]);
}
arg.demandCommand(1, 'Please specify a command.\n\nUsage:\n  npx @plotdb/guides init [options]\n\nOptions:\n  -g, --global\n      Link context/shared to the globally installed @plotdb/guides package.')
  .help()
  .argv;
