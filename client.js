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

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

if (config.token === "Bot Token") {
    console.log("Looks like you forgot to put your token into the config.json file.");
} else {
    client.login(config.token);
}