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

            for (let PKMN of unit.pokemon) {
                let searchTerm;
                if (PKMN.includes("(")) {
                    if (PKMN.includes("(Mega")) {
                        searchTerm = PKMN.match(/\((.*)\)/).pop()
                    } else if (PKMN.includes("(Female") || PKMN.includes("(Male")){
                        searchTerm = PKMN.split("(")[0].trim()
                    } else{
                        searchTerm = PKMN
                    }
                } else {
                    searchTerm = PKMN;
                }
                PKMNList.push(await HELPER.findJSON(searchTerm, "pokemon", unit.name))
            }

            PKMNList.sort((a, b) => b.stats.max[0][1] - a.stats.max[0][1]);

            const color = await GENERAL.getColorByRarity(unit.rarity);

            if (unit.name === "Oak") {
                image = "https://i.imgur.com/e5C5a9v.png";
            }

            const baseEmbed = new Discord.RichEmbed()
                .setAuthor(unit.name + " " + rarity)
                .setThumbnail(icon)
                .setTitle('View This Info In Your Browser')
                .setURL("https://www.antnee.net/#/trainer/" + unit.name.replace("Synga Suit ", "").toLowerCase().replace(" ", "_"))
                .setImage(image)
                .setColor(color);
            embedArr.push(baseEmbed);

            for (let PKMNJson of PKMNList) {
                embedArr.push(await generateIndividualPKMNEmbed(PKMNJson, client))
            }

        } else if (!unit) {
            const pokemon = await HELPER.findMultipleJSON(args.join(" "), "pokemon", "none");
            if (pokemon.length > 1) {
                for (const pkmn of pokemon) {
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
    let isTwoTyped = PKMN.typing.length === 1;
    const icon = await HELPER.getUnitIcon(PKMN.trainer);
    let movesOut = await HELPER.generateMovesOut(PKMN.moves, client) + await HELPER.generateSyncOut(PKMN.syncMove, client);
    if (movesOut.length > 1024) {
        movesOut = "Sorry, this sync pair's moves descriptions are too long to display here, you can see their information here: https://www.antnee.net/#/pm/pair/" + PKMN.trainer.replace("Synga Suit ", "").toLowerCase().replace(" ", "_") + '\n'
    }
    return new Discord.RichEmbed()
        .setAuthor(PKMN.trainer + " & " + PKMN.name + " ・ " + PKMN.role + " " + await GENERAL.generateStars(PKMN.rarity), await HELPER.getPKMNIcon(PKMN.name))
        .setTitle('View This Info In Your Browser')
        .setURL("https://www.antnee.net/#/trainer/" + PKMN.trainer.replace("Synga Suit ", "").toLowerCase().replace(" ", "_"))
        .addField("**〜 Typing 〜**", "**Type: ** " + await GENERAL.getEmoji(PKMN.typing[0].toLowerCase(), client)
            + (isTwoTyped ? " " : await GENERAL.getEmoji(PKMN.typing[1].toLowerCase(), client))
            + " ・ **Weakness:** " + await GENERAL.getEmoji(PKMN.weakness.toLowerCase(), client)
        )
        .addField("**〜 Stats 〜**", await HELPER.generateStatTable(PKMN.stats))
        .addField("**〜 Passives 〜**", await HELPER.generatePassivesOut(PKMN.passives))
        .addField("**〜 Moves 〜**", movesOut)
        .setThumbnail(icon)
        .setColor(await GENERAL.getColor(PKMN.typing[0]));
}
