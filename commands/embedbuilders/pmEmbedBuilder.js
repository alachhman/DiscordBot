const HELPER = require('./helpers/pmHelper');
const GENERAL = require('./helpers/generalHelper');
const Discord = require('discord.js');
module.exports = {
    pairSearchEmbed: async function (args, client) {
        let embedArr = [];
        let PKMNList = [];

        const unit = await HELPER.findJSON(args.join(" "), "trainers", "none");
        if (unit) {
            const rarity = await GENERAL.generateStars(unit.base_potential);
            const icon = await HELPER.getUnitIcon(unit.name);

            let image = 'https://www.serebii.net/pokemonmasters/syncpairs/' + unit.name.replace("Synga Suit ", "").toLowerCase().replace(" ", "") + '.png';

            for (let PKMN of unit.pokemon_list) {
                PKMNList.push(await HELPER.findJSON(PKMN.replace(unit.name + " & ", ""), "pokemon", unit.name))
            }

            PKMNList.sort((a, b) => b.stats.max.hp - a.stats.max.hp);

            const color = await GENERAL.getColor(unit.type);

            if (unit.name === "Oak") {
                image = "https://i.imgur.com/e5C5a9v.png";
            }

            const baseEmbed = new Discord.RichEmbed()
                .setAuthor(unit.name + " " + rarity)
                .setThumbnail(icon)
                .setTitle('View This Info In Your Browser')
                .setURL("https://www.antnee.net/#/pm/pair/" + unit.name.replace("Synga Suit ", "").toLowerCase().replace(" ", "_"))
                .addField("Obtain Method", unit.recruit_method === "" ? "Sync Pair Scout" : unit.recruit_method)
                .addField("Background", unit.info)
                .setImage(image)
                .setColor(color);
            embedArr.push(baseEmbed);

            for (let PKMNJson of PKMNList) {
                embedArr.push(await generateIndividualPKMNEmbed(PKMNJson, client))
            }

        } else if (!unit) {
            const pokemon = await HELPER.findMultipleJSON(args.join(" "), "pokemon", "none");
            if (pokemon.length > 1) {
                for(const pkmn of pokemon){
                    embedArr.push(await generateIndividualPKMNEmbed(pkmn, client));
                    for (let form of pkmn.otherForms) {
                        embedArr.push(
                            await generateIndividualPKMNEmbed(await HELPER.findJSON(form, "pokemon", "none"), client)
                        )
                    }
                }
            } else {
                embedArr.push(await generateIndividualPKMNEmbed(pokemon[0], client));
                for (let form of pokemon[0].otherForms) {
                    embedArr.push(
                        await generateIndividualPKMNEmbed(await HELPER.findJSON(form, "pokemon", "none"), client)
                    )
                }
            }

        }

        return embedArr;
    },
    joinJSON: async function (seek) {
        await HELPER.compileJson(seek);
    }
};

async function generateIndividualPKMNEmbed(PKMN, client) {
    let isTwoTyped = PKMN.type2 === "";
    const icon = await HELPER.getUnitIcon(PKMN.trainer);
    let movesOut = await HELPER.generateMovesOut(PKMN.moves, client) + await HELPER.generateSyncOut(PKMN.syncMove, client);
    if (movesOut.length > 1024) {
        movesOut = "Sorry, this sync pair's moves descriptions are too long to display here, you can see their information here: https://www.antnee.net/#/pm/pair/" + PKMN.trainer.replace("Synga Suit ", "").toLowerCase().replace(" ", "_") + '\n'
    }
    return new Discord.RichEmbed()
        .setAuthor(PKMN.trainer + " & " + PKMN.name + " ・ " + PKMN.role + " " + await GENERAL.generateStars(PKMN.rarity), await HELPER.getPKMNIcon(PKMN.name))
        .setTitle('View This Info In Your Browser')
        .setURL("https://www.antnee.net/#/pm/pair/" + PKMN.trainer.replace("Synga Suit ", "").toLowerCase().replace(" ", "_"))
        .addField("**〜 Typing 〜**", "**Type: ** " + await GENERAL.getEmoji(PKMN.type1.toLowerCase(), client)
            + (isTwoTyped ? " " : await GENERAL.getEmoji(PKMN.type2.toLowerCase(), client))
            + " ・ **Weakness:** " + await GENERAL.getEmoji(PKMN.weakness.toLowerCase(), client)
        )
        .addField("**〜 Stats 〜**", await HELPER.generateStatTable(PKMN.stats, PKMN.bulk))
        .addField("**〜 Passives 〜**", await HELPER.generatePassivesOut(PKMN.passives))
        .addField("**〜 Moves 〜**", movesOut)
        .setThumbnail(icon)
        .setColor(await GENERAL.getColor(PKMN.type1));
}
