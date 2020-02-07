module.exports.run = async function(reaction, user) {
    const serverConf = this.config.servers[reaction.message.guild.id];
	if(reaction.emoji.name === serverConf.verification.rulesReadEmoji){
        const member = reaction.message.guild.members.find(member => member.id === user.id);
        if(member) {
            member.removeRole(serverConf.verification.rulesReadRole);
        }
    }
}