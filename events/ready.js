module.exports.run = async function() {
    console.log(`[LOG] Logged in (${this.guilds.size} servers - ${this.users.size} users)!`);

    // Verify active servers against configured servers
    for (const guild of this.guilds.values()) {
        if (!this.config.servers[guild.id]) console.warn(`${guild.name} is not set in \`servers\` (config.json file)`);
    }

    for(let serverID in this.config.servers) {
        const guild = this.guilds.get(serverID);
        const statsConf = this.config.servers[serverID].serverStats;

        const totalUsers = this.channels.get(statsConf.totalUsersChannel);
        const onlineUsers = this.channels.get(statsConf.onlineUsersChannel);
        const offlineUsers = this.channels.get(statsConf.offlineUsersChannel);
        const bots = this.channels.get(statsConf.botUsersChannel);

        setInterval(function() {
            let userCount = guild.memberCount;
            let onlineCount = (guild.members.filter(m => m.presence.status === 'online').size + guild.members.filter(m => m.presence.status === 'idle').size + guild.members.filter(m => m.presence.status === 'dnd').size);
            let offlineCount = guild.members.filter(m => m.presence.status === 'offline').size;
            let botCount = guild.roles.get(statsConf.botUsersRole).members.size;
            totalUsers.setName(statsConf.totalUsersPrefix + userCount).catch(console.error);
            onlineUsers.setName(statsConf.onlineUsersPrefix + onlineCount).catch(console.error);
            offlineUsers.setName(statsConf.offlineUsersPrefix + offlineCount).catch(console.error);
            bots.setName(statsConf.botUsersPrefix + botCount).catch(console.error);
        }, statsConf.updateInterval);
    };
};