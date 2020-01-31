const HELPER = require('./helpers/pmHelper');
const GENERAL = require('./helpers/generalHelper');
const Discord = require('discord.js');
module.exports = {
    pairSearchEmbed: async function (args, client) {
        let embedArr = [];
        let PKMNList = [];

        const unit = await HELPER.findJSON(args.join(" "), "trainers");
        const rarity = await GENERAL.generateStars(unit.base_potential);
        const icon = await HELPER.getUnitIcon(unit);

        for (let PKMN of unit.pokemon_list) {
            PKMNList.push(await HELPER.findJSON(PKMN.replace(unit.name + " & ", ""), "pokemon"))
        }
        const color = await GENERAL.getColor(PKMNList[0].type1);

        PKMNList.sort((a, b) => b.stats.max.hp - a.stats.max.hp);

        for (let PKMNJson of PKMNList) {
            //Todo: find a better solution to situations like solgaleo rarity
            //*
            let solgaleoRarity;
            if(PKMNJson.name === 'Solgaleo'){
                solgaleoRarity = await GENERAL.generateStars('5');
                embedArr.push(await generateIndividualPKMNEmbed(PKMNJson, unit, solgaleoRarity, icon, client))
            }else{
                embedArr.push(await generateIndividualPKMNEmbed(PKMNJson, unit, rarity, icon, client))
            }
            //*
        }

        const baseEmbed = new Discord.RichEmbed()
            .setAuthor(unit.name + " " + rarity)
            .setThumbnail(icon)
            .setTitle('View This Info In Your Browser')
            .setURL("https://www.antnee.net/#/pm/pair/" + unit.name.replace("Synga Suit ", "").toLowerCase().replace(" ", "_"))
            .addField("Obtain Method", unit.recruit_method === "" ? "TELL ANTNEE TO FIX THIS" : unit.recruit_method)
            .addField("Background", unit.info)
            .setImage('https://www.serebii.net/pokemonmasters/syncpairs/' + unit.name.replace("Synga Suit ", "").toLowerCase().replace(" ", "") + '.png')
            .setColor(color);
        embedArr.push(baseEmbed);
        return embedArr;
    },
    joinJSON: async function (seek) {
        await HELPER.compileJson(seek);
    }
};

async function generateIndividualPKMNEmbed(PKMN, trainer, rarity, icon, client) {
    let isTwoTyped = PKMN.type2 === "";
    let movesOut = await HELPER.generateMovesOut(PKMN.moves, client);
    if(movesOut.length > 1024){
        movesOut = "Sorry, this sync pair's moves descriptions are too long to display here, you can see their information here: https://www.antnee.net/#/pm/pair/" + trainer.name + '\n'
    }
    return new Discord.RichEmbed()
        .setAuthor(trainer.name + " & " + PKMN.name + " ・ " + PKMN.role + " " + rarity, await HELPER.getPKMNIcon(PKMN.name))
        .setThumbnail(icon)
        .setTitle('View This Info In Your Browser')
        .setURL("https://www.antnee.net/#/pm/pair/" + trainer.name.replace("Synga Suit ", "").toLowerCase().replace(" ", "_"))
        .addField("**〜 Typing 〜**", "**Type: ** " + await GENERAL.getEmoji(PKMN.type1.toLowerCase(), client)
            + (isTwoTyped ? " " : await GENERAL.getEmoji(PKMN.type2.toLowerCase(), client))
            + " ・ **Weakness:** " + await GENERAL.getEmoji(PKMN.weakness.toLowerCase(), client)
        )
        .addField("**〜 Stats 〜**", await HELPER.generateStatTable(PKMN.stats))
        .addField("**〜 Passives 〜**", await HELPER.generatePassivesOut(PKMN.passives))
        .addField("**〜 Moves 〜**", movesOut + await HELPER.generateSyncOut(PKMN.syncMove, client))
        .setColor(await GENERAL.getColor(PKMN.type1));
}
