# Garam Framework Prototype

# install
 npm install garam

# server Start
node index.js


# create dev options /application/conf/dev.json
node index.js -t dev  
\node index.js -l true //packet debug

옵션을 늘려서 실행 가능한다.





# db support MYSQL, MSSQL, REDIS, memory [다중 DB 지원]

 가장 큰 장점은 같은 인터페이스로 여러가지 다양한 DB를 접속하며 사용할 수 있다는 것이다.
 Redis 와 mssql 이 사용법이 동일함.



    {
      "namespace":"mysqltest",    //데이터 베이스를 구성하는 이름이다.
      "driver":"Mysql",       
      "hostname":"localhost",
      "username" :"root",
      "database" :"testdb",
      "password":"choil123",
      "port":"3306",
      "procedure" :true,
      "connLimit" :1            //mysql 에서는 1에서 늘리면 안된다.
    }
    
use
Garam.getDB('mysqltest').getModel('modelName').getUserFunc();
	
#model 
 application/model/mysqltest / create user model name .js
    
 # cluster mode
  
 clusterMode : true  //서버는 클러스터로 동작 할 수 도 있고, 싱글모드로 동작할 수 도있다.  
 
 # master send worker packet
 var testMessage = this.getTransaction('testMessage').addPacket({msg:'test'})
  Garam.getWorker().send(testMessage);
  Or 
  Garam.getMaster().send(int workerId, testMessage);  //특정 워커에게
  Garam.getMaster().sendAll( testMessage);            // 모든 워커에게
   
 # response transactions
   application/transactions/worker/testMessage.js
   addEvent : function(master) {
      
        master.on('testMessage',function(eventType,result){
           
        });
    }
 # worker send master packet   
     var testMessage = this.getTransaction('testMessage').addPacket({msg:'test'})
    Garam.getWorker().send(testMessage);
    
 # webserver cpu auto
 
   "portInfo":{
     "mode" :"cpu",
     "maxCount":1,
     "portType" : 0,
     "defaultPort" : 8080
   },
# webServer listion Type
     portInfo.mode : cpu Or number 
     cpu : cpu  core 만큼 클러스터 증가
     number : maxCount 만큼 임의로 클러스터 증가
     portType :  0 증가한 클러스터가 모두 같은 port 를 listen 
                 1 port  번호가 1씩 증가
     defaultPort :  기본 부여된  port
		 

 
 # remote  (Role to client server)
 
 // remote 서버 역할을 하는 서버는 대상 서버에 접속한다.
   "net": {
     "remote": [{
       "hostname":"dc",
       "ip" :"xxx.xx.xx.xx",
       "port":4000
     }]
   }
   
   
 # host server ( Role to host server )
   서버는 4000번 port 를 연다
   
     "net": {
       "host": [{
         "hostname":"dc",
         "port":4000
       }]
     },
   
 
 # transactions
  모든 transaction 패킷은 압축하여 전송된다
  특정한 바이트를 넘어서면 일정한 크기로 분리시켜서 분할 전송한다.
   
   this._packet = {
            pid : 'tournamentCreateReq',
            tournamentId : 0,
            gameTime : 0,
            prizePool :0,
            delayTime :0

        }
	
 패킷은  JSON 포멧으로 압축한다.	
	
 # controllers
   
   application/controllers 파일을 생성하면 된다
   
      exports.app  =App;
      exports.className  = 'testCtl'; //
   
      Garam.getCtl('testCtl').callFunc();
      
      createRouter : functoin() {
      
      }
      
  # controllers transactions 
    각  controller 에는 하나의 대칭되는 transaction 를 참조하게 된다.
    
    ex)  application/transactions/testCtl/testMessage.js
   
  # routers
   
   application/routers 폴더에 파일을 여러개 생성하면 참조 가능
   
   #transactions 
   application /transactions 폴더에 TCP 패킷을 부여한다.
    application /transactions/폴더 이름은 controllers/파일 명과 동일하게 생성한다.
	
	 var packet  =Garam.getCtl('cont').getTransactioon('tranName').addPacket({}};
	
   
