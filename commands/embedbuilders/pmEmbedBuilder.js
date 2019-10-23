const HELPER = require('./helpers/pmHelper');
const GENERAL = require('./helpers/general');
const Discord = require('discord.js');
module.exports = {
    pairSearchEmbed: async function (arg, client) {
        let embedArr = [];
        let PKMNList = [];
        const unit = await HELPER.findJSON(arg, "trainers");
        const rarity = await GENERAL.generateStars(unit.base_potential);
        for(let PKMN of unit.pokemon_list){ PKMNList.push( await HELPER.findJSON(PKMN,"pokemon"))}
        const color = await GENERAL.getColor(PKMNList[0].type1);
        PKMNList.sort(async (a,b)=>{await HELPER.sortByStats(a,b)});
        for(let PKMNJson of PKMNList){ embedArr.push( await generateIndividualPKMNEmbed(PKMNJson, unit, rarity))}

        const baseEmbed = new Discord.RichEmbed()
            .setAuthor(unit.name + " " + rarity)
            .addField("Background", unit.info)
            .setImage('https://www.serebii.net/pokemonmasters/syncpairs/' + unit.name.replace("Synga Suit ", "").toLowerCase().replace(" ", "") + '.png')
            .setColor(color);
        embedArr.push(baseEmbed);

        return embedArr;
    }
};

async function generateIndividualPKMNEmbed(PKMN, trainer, rarity){
    return new Discord.RichEmbed()
        .setAuthor(trainer.name + " & " + PKMN.name + " ・ " + PKMN.role + " " + rarity, await HELPER.getPKMNIcon(PKMN.name))
        .setColor(await GENERAL.getColor(PKMN.type1));
    //ToDo: move out and stats table, also passives, also type and weakness emoji
}
