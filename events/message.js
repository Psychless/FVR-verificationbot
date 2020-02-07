module.exports.run = function(message) {
    // Check if server is being ignored
    if (this.config.ignoreServers.includes((message.guild || { id: "0" }).id)) return;

    // Delete message if it was sent in verification channel
    if (this.utils.isVerifyChannel(message)){
        if (this.config.deleteMessages === true) {
            const deleteTime = message.author.id !== this.user.id ? this.config.usrMsgDeleteTime : this.config.botMsgDeleteTime;
            message.delete(deleteTime);
        }
    }

    // Instruct user to use commands in the server if they are trying to use them in DMs
    const verifyCmd = `${this.config.prefix}verify`
    if(!message.guild && !message.author.bot && message.content.startsWith(verifyCmd)) {
        return message.reply(`${this.constants.BOT_PREFIX_ERROR}The ${verifyCmd} command should be used only in server's #verify text channel!`);;
    }

    // Check if message starts with prefix, is not sent by a bot and not in DMs
    if (!message.content.startsWith(this.config.prefix) || message.author.bot || !message.guild) return;

    // Define required properties
    Object.defineProperties(message, {
        command: {
            value: message.content.substr(this.config.prefix.length).split(" ")[0]
        },
        args: {
            value: message.content.split(" ").slice(1)
        }
    });

    // Check if command exists
    const command = this.commands.get(message.command);
    const configCommand = this.config.commands[message.command];
    if (!command) return;

    // Check if command is enabled
    if (command.enabled === false) return message.reply(`${this.constants.BOT_PREFIX_ERROR}This command has been disabled.`);

    // Check if author is allowed to execute command
    if (!configCommand) return message.reply(`${this.constants.BOT_PREFIX_ERROR}Command not set in config.json file!`);
    if (configCommand.executors.length > 0 && !configCommand.executors.includes(message.author.id))
        return message.reply(`${this.constants.BOT_PREFIX_ERROR}You are not allowed to execute this command.`);
    if (configCommand.requiredPermissions.length > 0 && !configCommand.requiredPermissions.some(v => message.member.hasPermission(v.toUpperCase())))
        return message.reply(`${this.constants.BOT_PREFIX_ERROR}You are not allowed to execute this command.`);

    // Check args length
    const requiredArgs = command.info.args.filter(v => v.required);
    if (message.args.length < requiredArgs.length)
        return message.reply(`${this.constants.BOT_PREFIX_ERROR}Invalid arguments: ${requiredArgs.length} are needed but ${message.args.length} were provided.`);

    // Run command
    command.call(this, message);
};