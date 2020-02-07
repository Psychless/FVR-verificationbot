module.exports.run = async function(member) {
    const serverConf = this.config.servers[member.guild.id];
    this.utils.logToChannel(this, serverConf.logging.usrLeftChannel, `**${member.user.tag}** has left the server! :confused:`);
}