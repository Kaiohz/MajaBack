

var express = require('express');
var path = require('path');
var cors = require('cors');
var app = express()
app.use(cors())
require = require("esm")(module/*, options*/);
var wallet = require("./wallet")
var rigs = require("./rigs")
var withdrawals = require("./withdrawals")
var https = require("https");
var bdd = require("./bdd")

wallet.getWalletData().then(result  => {
  console.log("Finish collect wallet data !")
 })

 wallet.getBtcChangeRate().then(result  => {
  console.log("Finish collect btc change rate !")
 })

 rigs.getRigsData().then(result  => {
  console.log("Finish collect rigs data !")
 })

 withdrawals.getWithdrawalAdresses().then( () => {
   console.log("Finish collecting adresses !")
 })

//routes
app.use('/btc',async function (req, res, next) {
  try {
    res.status(200).send({EUR: wallet.changeRate})
  } catch (e) {
    res.status(500).send({"error" : "Erreur lors de la récupération de l'api btc : "+e })
  }
});

app.use('/eth',async function (req, res, next) {
  try {
    res.status(200).send(wallet.changeRateEth)
  } catch (e) {
    res.status(500).send({"error" : "Erreur lors de la récupération de l'api eth : "+e })
  }
});

app.use('/nicehash',async function (req, res, next) {
  try {
    res.status(200).send(rigs.rigsJson)
  } catch (e) {
    res.status(500).send({"error" : "Erreur lors de la récupération de l'api nicehash : "+e })
  }
});


app.use('/wallet', async function (req, res, next){
  try {
    res.status(200).send(wallet.wallet)
    } catch (e) {
      res.status(500).send({"error" : "Erreur lors de la récupération de l'api wallet : "+e })
    }
});

app.use('/withdrawals', async function (req, res, next){
  try {
    res.status(200).send(withdrawals.adresses)
    } catch (e) {
    res.status(500).send({"error" : "Erreur lors de la récupération de l'api adresses : "+e })
  }
});

app.use('/order/:id/:amount', async function (req, res, next){
  var id = req.params.id
  var amount = req.params.amount
  await withdrawals.sendOrder(id,amount)
  try {
    res.status(200).send(withdrawals.orderBig5)
    } catch (e) {
    res.status(500).send({"error" : "Erreur lors de la récupération de l'api order : "+e })
  }
});

app.use('/averageProfit/:rig', async function (req, res, next){
  var rig = req.params.rig
  bdd.selectAverages(res,"profitability",rig)
});

app.use('/averageHashrate/:rig', async function (req, res, next){
  var rig = req.params.rig
  bdd.selectAverages(res,"hashrate",rig)
});

app.use('/profitStats/:rig', async function (req, res, next){
  var rig = req.params.rig
  bdd.selectAll(res,"profitability",rig)
});

app.use('/hashrateStats/:rig', async function (req, res, next){
  var rig = req.params.rig
  bdd.selectAll(res,"hashrate",rig)
});

app.use('/changerateGraph/:table', async function (req, res, next){
  var table = req.params.table
  bdd.changerateGraph(res,table)
});

app.use('/getUptime/:rig', async function (req, res, next){
  var rig = req.params.rig
  bdd.getUptime(res,rig)
});



module.exports = app;
