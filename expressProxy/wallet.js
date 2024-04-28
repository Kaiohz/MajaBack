import config from './config'
import Api from './api'
const cron = require('node-cron');
var https = require("https");


export const api = new Api(config);
export let wallet = ''
export let changeRate = ""
export let changeRateEth = ""

cron.schedule('*/1 * * * *', async function() {
    getWalletData()
    getBtcChangeRate()
    getEthChangeRate()
});


export async function getBtcChangeRate(){
	https.get('https://blockchain.info/tobtc?currency=EUR&value=1&cors=true', (result) => {
        let data = '';
        result.on('data', function (chunk) {
          data += chunk;
        });

        result.on('end', () => {
            try {
              var json = JSON.parse(data)
              changeRate=json
            } catch (e) {
              console.log("Erreur lors de la récupération du taux de change : "+e)
            }  
          });
    }).on('error', (e) => {
        console.error(e);
    });
}

export async function getEthChangeRate(){
	https.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR', (result) => {
        let data = '';
        result.on('data', function (chunk) {
          data += chunk;
        });

        result.on('end', () => {
            try {
              var json = JSON.parse(data)
              changeRateEth=json
            } catch (e) {
              console.log("Erreur lors de la récupération du taux de change : "+e)
            }  
          });
    }).on('error', (e) => {
        console.error(e);
    });
}

export async function getWalletData(){
	await api.getTime()
	// get balance
	.then(() => api.get('/main/api/v2/accounting/account2/BTC'))
	.then(result  => {
		wallet=result
	 })
	.catch(err => {
		if(err && err.response) console.log("Error getWalletData : ",err);
	})
}

export function getCurrentAmountWallet(){
	return wallet.totalBalance.substring(0,10)
}
