var _ = require('underscore')
    , fs = require('fs')
    , Garam = require('./Garam')

    , Base = require('./Base')
    , HostServer = require('./rpc/host/HostServer')
    , ClientServer = require('./rpc/remote/ClientServer')
    , async = require('async')
    , domain = require('domain')
    , Cluster = require('cluster')
    , readline = require('readline')
    , assert= require('assert');

exports = module.exports = Command;

function Command (mgr, name) {
    Base.prototype.constructor.apply(this,arguments);

}
/**
 *
 */
if (Cluster.isMaster) {

    _.extend(Command.prototype, Base.prototype, {
        create : function() {
            var self = this;
            this._commands = {};
            this.addCommand('sampleCmd',function(){
                console.log('test');
            });
            this._iproc = readline.createInterface({input:process.stdin, output:process.stdout});
            this._iproc.on('line', function(line) {

                var ix = line.lastIndexOf('\n');
                var cmds = (0 <= ix) ?  line.substr(0, ix).split(' ') : line.split(' ');

                if (false === self.command(cmds[0],cmds[1],cmds[2])) {
                    switch (cmds[0]) {

                        default:
                            console.log('command not found! - ', cmds[0],cmds[1],cmds[2]);
                            break;
                    }
                }
            }).on('close', function(){
                process.exit(0);
            });
        },
        addCommand : function(command,commandCallback) {
            console.log(command)
            if (typeof  commandCallback!== 'function') {
                assert(0);
            }
            this._commands[command] = commandCallback;
        },
        command:function(cmds,bet,action) {


            if (this._commands[cmds]) {

                if (typeof  this._commands[cmds] === 'function') {
                    this._commands[cmds](bet,action);

                }
                return true;
            }


            return false;
        }

    });
} else {

    _.extend(Command.prototype, Base.prototype, {
        create : function() { },
        addCommand : function(command,commandCallback) { },
        command:function(cmds) {
            return false;
        }

    });
}
