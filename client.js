const Discord = require("discord.js");
const fs = require("fs");
const config = require("./config.json");
const constants = require("./utils/constants.js");
const utils = require("./utils/utilities.js");
const commands = new Map();

const client = new Discord.Client({ disableEveryone: true });

Object.defineProperties(client, {
    commands: {
        value: commands
    },
    config: {
        value: config
    },
    constants: {
        value: constants
    },
    utils: {
        value: utils
    },
    query: {
        value: new Map()
    }
});

// Init events
fs.readdir("./events/", (err, data) => {
    if (err) return console.error("Could not read `./events/` directory: " + err);

    for(const filename of data) {
        const event = require(`./events/${filename}`);
        try {
            client.on(filename.substr(0, filename.indexOf(".js")), event.run.bind(client));
        } catch(e) {
            console.error(e.stack);
        }
    }
});

// Init commands
fs.readdir("./commands/", (err, data) => {
    if (err) return console.error("Could not read `./commands/` directory: " + err);

    for(const filename of data) {
        const command = require(`./commands/${filename}`);
        try {
            commands.set(filename.substr(0, filename.indexOf(".js")), command);
        } catch(e) {
            console.error(e.stack);
        }
    }
});

// Message rection event
client.on('raw', event => {
    const eventName = event.t;
    if(eventName === 'MESSAGE_REACTION_ADD' || eventName === 'MESSAGE_REACTION_REMOVE') {
        // Read rules role adding/removing
        if(event.d.message_id === config.servers[event.d.guild_id].rulesMsg){
                let reactionChannel = client.channels.get(event.d.channel_id);
                if(reactionChannel.messages.has(event.d.message_id))
                    return;
                else {
                    reactionChannel.fetchMessage(event.d.message_id)
                    .then(msg => {
                        const msgReaction = msg.reactions.get(event.d.emoji.name + ":" + event.d.emoji.id);
                        const user = client.users.get(event.d.user_id);
                        client.emit((eventName === 'MESSAGE_REACTION_ADD' ? 'messageReactionAdd' : 'messageReactionRemove'), msgReaction, user);
                    })
                    .catch(console.error);
                }
        }
    }
})

client.on('messageReactionAdd', (reaction, user) => {
    if(reaction.emoji.name === config.servers[reaction.message.guild.id].rulesReadEmoji){
        const member = reaction.message.guild.members.find(member => member.id === user.id);
        if(member) {
            member.addRole(config.servers[reaction.message.guild.id].rulesReadRole);
        }
    }
});

client.on('messageReactionRemove', (reaction, user) => {
	if(reaction.emoji.name === config.servers[reaction.message.guild.id].rulesReadEmoji){
        const member = reaction.message.guild.members.find(member => member.id === user.id);
        if(member) {
            member.removeRole(config.servers[reaction.message.guild.id].rulesReadRole);
        }
    }
});

if (config.token === "Bot Token") {
    console.log("Looks like you forgot to put your token into the config.json file.");
} else client.login(config.token);