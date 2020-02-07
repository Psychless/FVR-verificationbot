module.exports.run = async function(event) {
    const eventName = event.t;
    if(eventName === 'MESSAGE_REACTION_ADD' || eventName === 'MESSAGE_REACTION_REMOVE') {
        // Read rules role adding/removing
        if(event.d.message_id === this.config.servers[event.d.guild_id].verification.rulesMsg){
            let reactionChannel = this.channels.get(event.d.channel_id);
            if(reactionChannel.messages.has(event.d.message_id))
                return;
            else {
                reactionChannel.fetchMessage(event.d.message_id)
                .then(msg => {
                    const msgReaction = msg.reactions.get(event.d.emoji.name + ":" + event.d.emoji.id);
                    const user = this.users.get(event.d.user_id);
                    this.emit((eventName === 'MESSAGE_REACTION_ADD' ? 'messageReactionAdd' : 'messageReactionRemove'), msgReaction, user);
                })
                .catch(console.error);
            }
        }
    }
}