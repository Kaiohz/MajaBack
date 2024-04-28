const cron = require('node-cron');
var https = require("https");
var wallet = require("./wallet")
var rigs  = require("./rigs")



const TelegramBot = require('node-telegram-bot-api');
const token = '1987367857:AAFoN7Le6spwFkTMNDdd848CyJ6Z5RDiVW0';
export const bot = new TelegramBot(token, {polling: true});
export const chatId = -554461408;
export const chatIdKd = -589908224;
const activated = false


bot.on('message', (msg) => {
    if(msg.text==="/renta" && msg.chat.id===chatId){
        bot.sendMessage(chatId, 'Rentabilité : '+rigs.getProfitability() +" BTC/J  "+(rigs.getProfitability()/wallet.changeRate).toFixed(2)+"€/J");
    }
 
    if(msg.text==="/wallet" && msg.chat.id===chatId){
      bot.sendMessage(chatId, " Wallet : "+(Number(wallet.getCurrentAmountWallet())/Number(wallet.changeRate)).toFixed(2)+"€");
    }

    if(msg.text==="/unpaid" && msg.chat.id===chatId){
      bot.sendMessage(chatId, " Montant impayé : "+(rigs.getUnpaid()/wallet.changeRate).toFixed(2)+"€");
    }

    if(msg.text==="/rate"){
      bot.sendMessage(chatId, " Change rate : 1 BTC = "+(1/wallet.changeRate).toFixed(2)+"€");
    }

    
    if(msg.text==="/help"){
      bot.sendMessage(msg.chat.id,"Pour avoir la rentabilité tapez /renta");
      bot.sendMessage(msg.chat.id,"Pour avoir le montant du wallet tapez /wallet");
      bot.sendMessage(msg.chat.id,"Pour avoir le montant impayé du wallet tapez /unpaid");
      bot.sendMessage(msg.chat.id,"Pour avoir le taux du bitcoin tapez /rate");
    }         
  });




  // Schedule tasks to be run on the server.
cron.schedule('*/10 * * * *', function() {
  if(activated){
    try {
      if(rigs.rigsJson.miningRigs!==undefined){
        rigs.rigsJson.miningRigs.forEach(rig => {
          if(rig.minerStatus != "MINING"){
            if(rig.devices.length == 0)
              bot.sendMessage(chatId, "Le rig "+rig.name+" est hors ligne.");
            rig.devices.forEach(device => {
              if(device.powerUsage!==undefined && device.powerUsage > 0 && device.status.description !== 'Mining'){
                bot.sendMessage(chatId, device.name+" sur le rig "+rig.name+" est hors ligne.");
              }
            })
          }
        });
      }
    } catch (e) {
      console.log("Erreur lors de l'analyse des rigs : "+e)
    }  
  }
  });