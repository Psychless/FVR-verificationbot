const config = require('../config.json');

module.exports = {
    isVerifyChannel: function(message) {
        if(message.guild === null)
            return false;

        const serverConf = config.servers[message.guild.id];
        return message.channel.id === serverConf.verificationChannel || message.channel.name !== "verify";
    }
}