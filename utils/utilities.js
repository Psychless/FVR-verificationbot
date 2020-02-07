
const config = require('../config.json');
const moment = require('moment');

module.exports = {
    isVerifyChannel: function(message) {
        if(message.guild === null)
            return false;

        const serverConf = config.servers[message.guild.id];
        return message.channel.id === serverConf.verificationChannel || message.channel.name === "verify";
    },
    logToChannel: function(client, channelID, text) {
        const timestamp = moment().format("DD/MM/YYYY HH:mm:ss");
        client.channels.get(channelID).send(`${timestamp}: ${text}`);
    }
}