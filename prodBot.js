const fs = require('fs');
const Discord = require('discord.js');
const {prefix, prodToken, stagingToken, environment} = require('./auth.json');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const scraperFiles = fs.readdirSync('./Scripts').filter(file => file.endsWith('.js')).map((file) => {
    return require(`./Scripts/${file}`);
});
var timedMessage;
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// let imageSpamDetectedUsers = [];

let dataStore = {
    dragalia: {
        weapons: [],
        dragons: [],
        units: [],
        prints: []
    }
};

let requests = [];

client.once('ready', async () => {
    console.log(`Bot is running on ${client.guilds.size} servers`);
    client.user.setActivity('>help');
    //await runUpdates(scraperFiles);
});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.emoji.name === '🤝' && reaction.message.id === "606589614123384843") {
        try {
            let role = reaction.message.guild.roles.get('606594867136823316');
            let member = reaction.message.guild.members.find(member => (member.user.id === user.id));
            console.log(`CO-OP || ${user.username} has requested the Co-op Role.`);
            if (member !== null && role !== null) {
                if (!member.roles.has(role.id)) {
                    member.addRole(role).catch(console.error);
                }
            }
        } catch (e) {
            //ToDo: Figure somethin out.
        }
    }
    if (reaction.message.id === "622649753121062912") {
        console.log('cool');
    }
});
client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.emoji.name === '🤝' && reaction.message.id === "606589614123384843") {
        try {
            let role = reaction.message.guild.roles.get('606594867136823316');
            let member = reaction.message.guild.members.find(member => (member.user.id === user.id));
            console.log(`CO-OP || ${user.username} has un-requested the Co-op Role.`);
            if (member !== null && role !== null) {
                if (member.roles.has(role.id)) {
                    member.removeRole(role).catch(console.error);
                }
            }
        } catch (e) {
            //ToDo: Figure somethin out.
        }
    }
});

client.on('raw', packet => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    const channel = client.channels.get(packet.d.channel_id);
    if (channel.messages.has(packet.d.message_id)) return;
    channel.fetchMessage(packet.d.message_id).then(message => {
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        const reaction = message.reactions.get(emoji);
        if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
        }
    });
});
const antnee = '115270563349528579';

client.on('message', async (message) => {
    if (message.content === 'thanks bud' && message.author.id === antnee) {
        message.reply("no problem fam");
        return;
    }

    if (message.content === '>debug servers') {
        var guilds = client.guilds.array();
        for (var guild of guilds) {
            if (guild.owner) {
                console.log(guild.name + " : " + guild.id + " : " + guild.owner.user.username)
            } else {
                console.log(guild.name + " : " + guild.id)
            }
        }
        return;
    }

    if (message.content === '>debug emotes') {
        var out = "";
        message.guild.emojis.forEach((emote) => {
            if (!emote.animated) {
                out += emote.name + "\n";
            }
        });
        message.channel.send(out);
        return;
    }

    if (message.content === '>debug update') {
        message.reply('Starting Data Update');
        await runUpdates(scraperFiles);
        message.reply('Data Update Done');
    }

    if (message.content === '>debug carries') {
        for (const carry of requests) {
            console.dir(carry, {depth: 1, color: true})
        }
    }

    if (message.content === '>debug imagespam') {
        message.channel.send("users with active spam watch:\n" + imageSpamDetectedUsers.join("\n"))
    }

    if (message.content === '>debug data') {
        //console.dir(dataStore.dragalia.weapons.length, {depth: 5, colors: true});
        console.log('Dragons: ' + dataStore.dragalia.dragons.length + '\n' +
            'Units: ' + dataStore.dragalia.units.length + '\n' +
            'Weapons: ' + dataStore.dragalia.weapons.length + '\n' +
            'Prints: ' + dataStore.dragalia.prints.length)
    }

    try {
        if (message.content === '>start alerts') {
            var channel = message.channel.guild.channels.get('597471505571381272');
            var messageToSend = '```md\nALERT\n===========\nPlease refrain from making general discussion in this channel. Individuals chatting in here are expected to either be posting gacha/scouting results or salt about these posts. Anyone who is caught utilizing #gacha-results as a second #pm-chat will receive a warning or mute with no verbal warning beforehand. Any selling or trading is strictly prohibited on the pokemon masters discord, and anyone suspected of trying to initiate an account exchange with other users will be immediately banned. Remember to spend your money wisely, gacha is gambling.```';
            channel.send(messageToSend);
            settime(messageToSend, channel);
        }
        if (message.content === ">stop alerts") {
            clearTimeout(timedMessage);
        }
    } catch (e) {
        //
    }

    // if (message.guild.id === '583120259708616715' && message.channel.id === '651487042886172682') {
    //     if (message.attachments.size > 0 && !imageSpamDetectedUsers.includes(message.author.id)) {
    //         imageSpamDetectedUsers.push(message.author.id);
    //         setTimeout(removeFromSpam, 300000, imageSpamDetectedUsers, message.author.id)
    //     }else if(message.attachments.size > 0 && imageSpamDetectedUsers.includes(message.author.id)){
    //         await message.delete(200);
    //     }
    // }

    try {
        if (message.channel.id === '611678630925565972') {
            if (message.channel.guild.id !== '583120259708616715') return;
            await addTrainerRole(message);
        }
        if (message.channel.guild.id === '259802877269245952') {
            if (message.attachments != null) {
                var img = message.attachments.first().url;
                console.log("SNOOP || " + message.author.username + " => " + img);
            } else {
                console.log("SNOOP || " + message.author.username + " => " + message.content);
            }
        }
    } catch (e) {
        //
    }

    if (message.author.bot) return;
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (!client.commands.has(command)) return;
    try {
        client.commands.get(command).execute(message, args, client, dataStore, requests);
    } catch (error) {
        console.error(error);
        message.reply('Cannot run command!');
    }
});

client.login(environment === "production" ? prodToken : stagingToken);

async function addTrainerRole(message) {
    if (message.content === ">enter") {
        try {
            let member = message.member;
            let trainerRole = message.guild.roles.get('611638752015679596');
            if (member !== null && trainerRole !== null) {
                if (!member.roles.has(trainerRole.id)) {
                    await member.addRole(trainerRole).catch(console.error);
                }
            }
            message.delete(2000).catch(console.error);
            message.channel.send(`Trainer role given to ${message.author.username}`)
        } catch (e) {
            console.log(e)
        }
    } else {
        message.delete(10000).catch(console.error);
    }
};

function settime(messageToSend, channel) {
    timedMessage = setTimeout(() => {
        channel.send(messageToSend);
        settime(messageToSend, channel)
    }, 10800000);
}


//ToDo: something is FUCKY with the prod version of this runs fine on staging
async function runUpdates(scripts) {
    console.log('Starting data update');
    for (script of scripts) {
        switch (script.key) {
            case 'dragalia-units':
                await script.getUnitData().then(async (data) => {
                    for (const unit of data) {
                        dataStore.dragalia.units.push(await unit)
                    }
                    console.log("Units updated.")
                });
                break;
            case 'dragalia-weapons':
                await script.getWeaponData().then(async (data) => {
                    for (const weapon of data) {
                        dataStore.dragalia.weapons.push(await weapon);
                    }
                    console.log("Weapons updated.")
                });
                break;
            case 'dragalia-dragons':
                await script.getDragonData(await script.getDragonLinks()).then(async (data) => {
                    for (const dragon of data) {
                        dataStore.dragalia.dragons.push(await dragon);
                    }
                    console.log("Dragons updated.")
                });
                break;
            case 'dragalia-prints':
                await script.getPrintData().then(async (data) => {
                    for (const print of data) {
                        dataStore.dragalia.prints.push(await print);
                    }
                    console.log("Prints updated.")
                });
                break;
        }
    }
    console.log('Data Update Done');
}

function removeFromSpam(spamArr, userId) {
    const index = spamArr.indexOf(userId);
    if (index > -1) {
        imageSpamDetectedUsers.splice(index, 1);
    }
}
