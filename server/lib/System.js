var _ = require('underscore')
    , fs = require('fs')
    , Garam = require('./Garam')
    , Base = require('./Base')
    , Express = require('express')
    , Http = require('http')
    , domain = require('domain')
    , redis = require('socket.io-redis')
    , engine = require('ejs-locals')
    , os = require('os')
    , assert= require('assert');

exports = module.exports = System;

function System (mgr, name) {
    Base.prototype.constructor.apply(this,arguments);

}
_.extend(System.prototype, Base.prototype, {

    cpuAverage : function() {



        //Initialise sum of idle and time of cores and fetch CPU info
        var totalIdle = 0, totalTick = 0;
        var cpus = os.cpus();


        //Loop through CPU cores
        for(var i = 0, len = cpus.length; i < len; i++) {

            //Select CPU core
            var cpu = cpus[i];

            //Total up the time in the cores tick
            for(type in cpu.times) {
                totalTick += cpu.times[type];
            }

            //Total up the idle time of the core
            totalIdle += cpu.times.idle;
        }

        //Return the average Idle and Tick times
        return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
    },
    start : function() {
        var self = this;
        this.logData = [];
        this._loadavg1 = [];
        this._loadavg5 = [];
        this._loadavg15 = [];
        this._cpuUsage = [];
        this._checkDate = [];

        setTimeout(function(){
            if (Garam.getCluster().isMaster()) {
                self.startMonitoring();
                var startMeasure = self.cpuAverage();

                setInterval(function(){
                    //console.log(  os.loadavg(15))
                    var d = new Date(),logs={};
                  //  logs.now = d.getFullYear() +'-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() +':'+d.getSeconds();
                    logs.now = d.getTime();

                    logs.load_avg = [];
                    logs.cpuUsage='';
                    var endMeasure = self.cpuAverage();

                    //Calculate the difference in idle and total time between the measures
                    var idleDifference = endMeasure.idle - startMeasure.idle;
                    var totalDifference = endMeasure.total - startMeasure.total;

                    //Calculate the average percentage CPU usage
                    var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
                    logs.cpuUsage = percentageCPU;
                    //Output result to console
                   // console.log(percentageCPU + "% CPU Usage.");

                    var loadavg = os.loadavg();

                     logs.load_avg.push(loadavg[0].toFixed(6));
                     logs.load_avg.push(loadavg[1].toFixed(6));
                     logs.load_avg.push(loadavg[2].toFixed(6));
                    self.addLog(logs);
                    //시스템의 최근 1,5,15 분의 시스템의 평균 부하량(Load Average)에 대한 정보
                   // console.log(load_avg_percentage);
                },10000 );


            }
        },10000);

    },
    addLog : function(logs) {

        if (this.logData.length > 20) {
            this.logData.shift();
            this._loadavg1.shift();
            this._loadavg5.shift();
            this._loadavg15.shift();
            this._cpuUsage.shift();
            this._checkDate.shift();
        }

        //var data =   [['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
        //    ['data1', 30, 200, 100, 400, 150, 250],
        //    ['data2', 130, 340, 200, 500, 250, 350]];
        this._loadavg1.push(logs.load_avg[0]);
        this._loadavg5.push(logs.load_avg[1]);
        this._loadavg15.push(logs.load_avg[2]);
        this._cpuUsage.push(logs.cpuUsage);
        this._checkDate.push(logs.now);

        this.logData.push(logs);
    },
    getChartData : function() {
        var arr = [];
        var d = [].concat('x',this._checkDate);
        var loadavg1 = [].concat('loadavg1',this._loadavg1);
        var loadavg5 = [].concat('loadavg5',this._loadavg5);
        var loadavg15 = [].concat('loadavg15',this._loadavg15);
        arr.push(d);
        arr.push(loadavg1);
        arr.push(loadavg5);
        arr.push(loadavg15);

        return {loadavg:arr,cpu:[].concat('cpu',this._cpuUsage)}

    },
    startMonitoring : function() {
        var app = Express(),self=this;
        this.server = Http.createServer(app);
        app.set('views', process.cwd() + '/server/monitor/views');
        app.set('view engine', 'ejs');
        app.engine('ejs', engine);

        var bodyParser = require('body-parser');
        var compress = require('compression');
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.use(compress());
        app.use(require('method-override')());

        app.use(Express.static(process.cwd() + '/server/monitor/public', { maxAge: 31557600000 }));

        app.get('/',function(req,res){
            res.render('index',{'url':'http://d3e1m892uw2y6p.cloudfront.net/'});
        });

        app.get('/getAvgData',function(req,res){
            res.contentType('application/json');
            var jsonData = JSON.stringify({'columns':self.getChartData()});
            res.send(jsonData);
        });
        app.get('/debug',function(req,res){

            if (req.headers.host.indexOf('localhost') === -1) {
                //self.sendStatus(200);
                res.sendStatus(200);
                return;
            }
            res.render('debugSocket',{'url':'http://d3e1m892uw2y6p.cloudfront.net/','debugmode':'socket'});

        });
        var port =10019;
        if (Garam.get('systemMonitorPort')) {
            port = Garam.get('systemMonitorPort');
        }

        app.listen(port,function(){

            Garam.logger().info("server Monitoring on port " +port);
        });


    }

});