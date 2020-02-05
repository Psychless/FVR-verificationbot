const { randomBytes } = require("crypto");
const Jimp = require("jimp");
const { RichEmbed } = require("discord.js");

module.exports = async function(message) {

    // Check if channel name is "verify" or in verificationChannels array
    if (message.channel.id !== (this.config.servers[(message.guild || {id: "0"}).id] || {verificationChannel: "0"}).verificationChannel && message.channel.name !== "verify") return;

    if (message.args.length === 0) {
        // No arguments provided

        const captcha = randomBytes(32).toString("hex").substr(0, 6);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
        const image = await Jimp.read("./assets/noise.jpg");
        image.print(font, 0, 0, {
            text: captcha,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, image.bitmap.width, image.bitmap.height);

        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        const embed = new RichEmbed()
            .setTitle("Verification")
            .setDescription("Please solve this captcha by sending `" + this.config.prefix + "verify [code]` in <#" + message.channel.id + ">")
            .attachFile({ attachment: buffer, name: "captcha.jpeg" })
            .setImage("attachment://captcha.jpeg");
        message.author.send(embed).catch(() => {
            message.reply("⛔ | Could not send captcha, maybe you have Direct Messages disabled?");
        });

        this.query.set(message.author.id, captcha);

    } else {
        // Arguments provided
        if (!this.query.has(message.author.id)) return message.reply("⛔ | Please request a captcha by sending `" + this.config.prefix + "verify`");

        const captcha = this.query.get(message.author.id);

        if (message.args[0] !== captcha) return message.reply("⛔ | Invalid captcha!");
        else {
            message.member.addRole(this.config.servers[message.guild.id].verifyRole).then(() => {
                message.reply("✅ | Successfully verified.");
            }).catch(console.error);
            this.query.delete(message.author.id);
        }
    }
};

module.exports.info = {
    description: "Used to receive a captcha or to use it",
    args: [
        { required: false, description: "The captcha code", name: "captcha" }
    ]
};