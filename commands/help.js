const Discord = require('discord.js');
module.exports = {
    name: 'help',
    Display: 'Help',
    description: 'help',
    execute(message, args, client) {
        const embed = new Discord.RichEmbed()
            .setColor("BLUE")
            //.setAuthor("Commands")
            .addField("Commands", client.commands.map((command) => {
                return "**" + command.display + ":**\n" + command.description;
            }));
        message.channel.send("|| "+{embed}+" ||")
    },
};
