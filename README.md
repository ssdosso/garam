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

//conf/default.json



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
	
	
    
 # cluster mode
  
 clusterMode : true  //서버는 클러스터로 동작 할 수 도 있고, 싱글모드로 동작할 수 도있다.  
 
 # webserver cpu auto
 
   "portInfo":{
     "mode" :"cpu",
     "maxCount":1,
     "portType" : 0,
     "defaultPort" : 8080
   },
   
# webserver number maxCount 
    //portType 이 1 이면 8080 에서 부터 순차적으로 포트 번호를 부여한다.
   
   
     "portInfo":{
       "mode" :"number",
       "maxCount":3,
       "portType" : 1,
       "defaultPort" : 8080
     },
 
 
     portType = 1;
	 listen Port 8080, 8081,8082
	  
 
 
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
   
   
   
  #controllers
   application/controllers 폴더에 파일을 여러개 생성하면 참조 가능
   
   해당 폴더에 규칙에  맞쳐 파일을 생성하면 된다.
   
   사용예 ) Garam.getCtl('app').func();
   
   
   #routers
   
   application/routers 폴더에 파일을 여러개 생성하면 참조 가능
   
   #transactions 
   application /transactions 폴더에 TCP 패킷을 부여한다.
    application /transactions/폴더 이름은 controllers/파일 명과 동일하게 생성한다.
	
	 var packet  =Garam.getCtl('cont').getTransactioon('tranName').addPacket({}};
	
   
