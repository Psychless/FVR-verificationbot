const { randomBytes } = require("crypto");
const { RichEmbed } = require("discord.js");

module.exports = async function(message) {

    const serverConf = this.config.servers[message.guild.id];

    // Check if message is sent in 'verify' channel (channel id or name)
    if(!this.utils.isVerifyChannel(message))
        return;

    if (message.args.length === 0) {
        // Check if they have read and accepted rules
        if (!message.member.roles.find(r => r.id === serverConf.verification.rulesReadRole)) {
            return message.reply(`${this.constants.BOT_PREFIX_ERROR}Please read and react to the rules in the <#${serverConf.verification.rulesChannel}> channel and then use ${this.config.prefix}verify again`);
        }

        // Generate captcha
        const captcha = randomBytes(32).toString("hex").substr(0, 6);
        await this.utils.getCaptchaImg(captcha).then((image) => {
            // Send captcha
            const embed = new RichEmbed()
            .setTitle("Verification")
            .setDescription(`Please solve this captcha by sending \`${this.config.prefix}verify [code]\` in <#${message.channel.id}>`)
            .attachFile({ attachment: image, name: "captcha.jpeg" })
            .setImage("attachment://captcha.jpeg");
            message.author.send(embed).then(sent => sent.delete(this.config.captchaDeleteTime)).catch(() => {
                message.reply(`${this.constants.BOT_PREFIX_ERROR}Could not send captcha, maybe you have DMs disabled?`);
            });

            this.query.set(message.author.id, captcha);
        }).catch((e) => {
            console.error(e);
            return message.reply(`${this.constants.BOT_PREFIX_ERROR}Error encountered while generating captcha. Contact server admin!`);
        });
    } else {
        // Check if user has requested captcha
        const captcha = this.query.get(message.author.id);
        if(!captcha) {
            return message.reply("Please request a captcha by sending `" + this.config.prefix + "verify`");
        }

        // Verify captcha
        if (message.args[0] !== captcha) {
            return message.reply(`${this.constants.BOT_PREFIX_ERROR}Invalid captcha!`);
        } else {
            // Add 'verified' role, remove 'read rules' role
            message.member.addRole(message.guild.roles.get(serverConf.verification.verifyRole)).then(() => {
                message.member.removeRole(serverConf.verification.rulesReadRole);
                message.reply(`${this.constants.BOT_PREFIX_SUCCESS}Successfully verified.`);
            }).catch(console.error);
            this.query.delete(message.author.id);

            // Log successful user verification
            this.utils.logToChannel(this, serverConf.logging.usrVerifChannel, `<@${message.author.id}> has been verified!`);
        }
    }
};

module.exports.info = {
    description: "Used to receive a captcha or to use it",
    args: [
        { required: false, description: "The captcha code", name: "captcha" }
    ]
};