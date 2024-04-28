import { del } from 'request';

export var mysql = require('mysql');
var withdrawals = require("./withdrawals")
var https = require("https");
var rigsData = require("./rigs")
var wallet = require("./wallet")
export var averageProfit = 0


const cron = require('node-cron');

export var con = mysql.createConnection({
  host: "10.6.0.1",
  user: "maja",
  password: "password",
  database: "maja"
});

cron.schedule('*/10 * * * *', async function() {
  statistics()
});

function statistics() {
  try {
    var speed = 0
    var rigsDetails = []
    var rigSpeed = 0
    rigsData.rigsJson.miningRigs.map(rig => {
      var name = rig.name
      rig.devices.map(device => {
        if(device.powerUsage > 0 && device.speeds[0] != undefined && device.status.enumName === "MINING"){
          speed = speed + Number.parseInt(device.speeds[0].speed.substring(0,8))
          rigSpeed = rigSpeed + Number.parseInt(device.speeds[0].speed.substring(0,8))
        }
      })
      rigsDetails.push({name: name, speed: rigSpeed, profitability: rig.profitability})
      rigSpeed = 0
    })

    insertProfit(rigsData.rigsJson.totalProfitability,"global")
    insertHashrate(speed,"global")

    rigsDetails.forEach(rig => {
      insertHashrate(rig.speed,String(rig.name).toLocaleLowerCase())
      insertProfit(rig.profitability,String(rig.name).toLocaleLowerCase())
    })

    insertChangeRate("",1/wallet.changeRate)
    insertChangeRate("eth",wallet.changeRateEth['EUR'])

  } catch (e) {
    console.log("Erreur lors de l'insertion en base des statistiques' : "+e)
  }
}

function insertProfit(profit,rig){
  var sql = "INSERT INTO profitability (value,rig) VALUES ("+profit+",'"+rig+"')";
  con.query(sql, function (err, result) {
      if (err) {
          console.log("Requête profitability echouée :"+err);
        }
  });
}

function insertHashrate(speed,rig){
  var sql = "INSERT INTO hashrate (value,rig) VALUES ("+speed+",'"+rig+"')";
  con.query(sql, function (err, result) {
      if (err) {
          console.log("Requête hasrate echouée :"+err);
        }
  });
}


export function insertChangeRate(currency,value) {
  var sql = "INSERT INTO changerate"+currency+" (value) VALUES ('"+value+"')";
  con.query(sql, function (err, result) {
      if (err) {
          console.log("Requête withdrawals echouée :"+err);
      }
    });
}

export function selectAverages(res,table,rig) {
        var sql = "SELECT AVG(value) as average FROM "+table+" WHERE rig = '"+rig+"'";
        con.query(sql, function (err, result) {
          if (err) {
            console.log("Select average echoué :"+err);
          }
          res.send({ value : result[0].average})
        });
}

export function selectAll(res,table,rig) {
  var sql = "SELECT value,timestamp FROM "+table+" WHERE rig = '"+rig+"' ORDER BY timestamp desc LIMIT 144";
  con.query(sql, function (err, result) {
    if (err) {
      console.log("Select all echoué :"+err);
    }
    res.send({ result : result})
  });
}

export function changerateGraph(res,table) {
  var sql = "SELECT value,timestamp FROM "+table+" ORDER BY timestamp desc LIMIT 36";
  con.query(sql, function (err, result) {
    if (err) {
      console.log("Select changerate echoué :"+err);
    }
    res.send({ result : result})
  });
}

export function getUptime(res,rig){
  var sql = "select count(value) as totalCount,( select count(value) from hashrate where rig = '"+rig+"' and value > 0) as onlineCount from hashrate where rig = '"+rig+"' order by `timestamp` desc" ;
  con.query(sql, function (err, result) {
    if (err) {
      console.log("Select uptime echoué :"+err);
    }
    var uptime = (result[0].onlineCount/result[0].totalCount) * 100
    res.send({ result : uptime})
  });
  
}