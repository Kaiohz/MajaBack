import config from './config'
import Api from './api'
const cron = require('node-cron');

export const api = new Api(config);
export let rigsJson = ''

cron.schedule('*/1 * * * *', async function() {
    getRigsData()
});

export async function getRigsData(){
        await api.getTime()
        // get balance
        .then(() => api.get('/main/api/v2/mining/rigs2'))
        .then(result  => {
            rigsJson = result;
        })
        .catch(err => {
            if(err && err.response) console.log("Error getRigsData : ",err);
        })
}

export async function setPowerMode(rigId,deviceId,action,options){
    var body = {
        rigId: rigId,
        deviceId: deviceId,
        action: action,
        options: options
    }

    await api.getTime()
    .then(() => api.post('/main/api/v2/mining/rigs/status2',body))
    .then(result  => {
        //orderBig5 = result
        //TelegramBot.bot.sendMessage(TelegramBot.chatId, 'Virement de '+amount +' BTC effectué pour '+uuid);
     })
    .catch(err => {
        if(err && err.response) console.log("erreur lors du virement :"+err+" url : "+err.response.request.method,err.response.request.uri.href);
    })
}

export function getProfitability() {
    return rigsJson.totalProfitability
}

export function getUnpaid(){
    return rigsJson.unpaidAmount
}