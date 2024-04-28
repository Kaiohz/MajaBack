import config from './config'
import Api from './api'

export const api = new Api(config);
export let adresses = ''
export let orderBig5 = ''
const wallet = require('./wallet');
var bdd = require("./bdd")
const cron = require('node-cron');
const TelegramBot = require('./telegram');

const percentages = new Map()
percentages.set("a4fc30a2-1421-4df5-a15d-52c5dda66102", "0.11") //vincent
percentages.set("c3075fed-dd32-4dfb-9c52-3339e5c2bde1", "0.11") //benoit
percentages.set("b958eb07-77f6-4e7a-9cfd-b137a717a2cd","0.33") //aurélien
percentages.set("b0f07a3b-0172-4802-9b3a-88703beb617a","0.11") //fec
percentages.set("165c1ff4-fb2a-462a-92a8-51299ea5a8a6","0.33") //moi

//

var done=false;
// Schedule tasks to be run on the server.

cron.schedule('*/30 * * * *', async function() {
    getWithdrawalAdresses()
});

cron.schedule('*/10 * * * *', async function() {
	var date = new Date();
	var firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDate();
	if((date.getDate()==firstDay) && done == false){
	  try {
		  adresses.list.filter(l => percentages.has(l.id)).forEach(element => {
			if(percentages.get(element.id) > 0  && Number(wallet.getCurrentAmountWallet()) > 0.001 ){
				console.log("sendOrder : "+element.id,Number(wallet.getCurrentAmountWallet())*Number(percentages.get(element.id)),element.address)
				sendOrder(element.id,Number(wallet.getCurrentAmountWallet())*Number(percentages.get(element.id)),element.address)
			}
		  });
		  done=true
		} catch (e) {
		  console.log("Erreur lors de la tentative de virements : "+e)
	  	} 
	} else if((date.getDate()!=firstDay) && done == true){
		done = false
	}
  });

export async function getWithdrawalAdresses(){
	await api.getTime()
	.then(() => api.get('/main/api/v2/accounting/withdrawalAddresses?currency=BTC'))
	.then(result  => {
		adresses=result
	 })
	.catch(err => {
		if(err && err.response) console.log("Error getWithdrawalAdresses : ",err);
	})
}

export async function sendOrder(uuid,amount){
		var order = {
			query: undefined,
			body : {"currency": "BTC","amount": amount,"withdrawalAddressId": uuid},
			time: undefined,
		}
		await api.getTime()
		.then(() => api.post('/main/api/v2/accounting/withdrawal',order))
		.then(result  => {
			orderBig5 = result
			TelegramBot.bot.sendMessage(TelegramBot.chatId, 'Virement de '+amount +' BTC effectué pour '+uuid);
		 })
		.catch(err => {
			if(err && err.response) console.log("erreur lors du virement :"+err+" url : "+err.response.request.method,err.response.request.uri.href);
		})
}
