const BUILDER = require('./embedbuilders/dragEmbedBuilder');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const paginationEmbed = require('discord.js-pagination');
const GENERAL = require('./embedbuilders/helpers/general');
module.exports = {
    name: 'dragt',
    display: 'Dragalia Lost',
    description: '`>drag [unit/dragon/weapon/print]` will return information on (mostly) anything in Dragalia Lost.',
    async execute(message, args) {
        GENERAL.startTypingAlert(message);
        paginationEmbed(message, await BUILDER.unitEmbed(message,args), GENERAL.nextButtons, GENERAL.paginationTimeOut);
        GENERAL.stopTypingAlert(message);
    }
};