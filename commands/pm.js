const BUILDER = require('./embedbuilders/pmEmbedBuilder');
const GENERAL = require("./embedbuilders/helpers/generalHelper");
module.exports = {
    name: 'mst',
    display: 'Pokemon Masters New!',
    description: 'Try out the new redesigned masters search with `>ms [trainer or pokemon name]`',
    async execute(message, args, client) {
        if (message.content.startsWith(">" + this.name + " pooldata")) {
            await GENERAL.startTypingAlert(message);
            if (message.content.includes("trainers")) {
                message.channel.send("Pooling trainer JSON data.");
                await BUILDER.joinJSON("trainers");
                message.channel.send("done.");
            } else {
                message.channel.send("Pooling pokemon JSON data.");
                await BUILDER.joinJSON("pokemon");
                message.channel.send("done.");
            }
            await GENERAL.stopTypingAlert(message);
        } else {
            await GENERAL.startTypingAlert(message);
            try{
                await GENERAL.paginationEmbed(message, await BUILDER.pairSearchEmbed(args, client), GENERAL.nextButtons, GENERAL.paginationTimeOut);
                await GENERAL.stopTypingAlert(message);
            }catch (e) {
                console.log(e);
                await GENERAL.stopTypingAlert(message);
            }
        }
    },
};

