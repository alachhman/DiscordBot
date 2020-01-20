const fs = require('fs');
const fetch = require("node-fetch");
const AsciiTable = require('ascii-table');
const resourcePath = './commands/embedbuilders/helpers/data/';
const GENERAL = require('./generalHelper');
const iconUrl = 'https://gamepress.gg/sites/default/files/aggregatedjson/TrainersList.json?15813222081239323912';
const util = require('util');
module.exports = {
    findJSON: async function (arg, seek) {
        const trainerFiles = await fs.readdirSync(resourcePath + seek).filter(file => file.endsWith('.json'));
        for (const file of trainerFiles) {
            if (arg.toUpperCase() === 'AEGISLASH') {
                arg = 'aegislash (blade forme)';
            }
            let rawData = await fs.readFileSync(resourcePath + seek + "/" + file);
            let data = await JSON.parse(rawData);
            if (data.name.toUpperCase() === arg.toUpperCase()) {
                return data;
            }
            if (seek === "trainers") {
                for (const pkmn of data.pokemon_list) {
                    if ((pkmn.replace(data.name + " & ", "").toUpperCase()) === arg.toUpperCase()) {
                        return data;
                    }
                }
            }
        }
    },
    compileJson: async function (seek) {
        const trainerFiles = await fs.readdirSync(resourcePath + seek).filter(file => file.endsWith('.json'));
        let store = [];
        for (const file of trainerFiles) {
            let rawData = await fs.readFileSync(resourcePath + seek + "/" + file);
            let data = await JSON.parse(rawData);
            store.push(data);
        }
        for (const data of store) {
            console.dir(data, {depth: 10, colors: true});
            console.log(',')
        }
    },
    getPKMNIcon: async function (name) {
        if (name.includes('Mega ')) {
            return 'https://serebii.net//pokedex-sm/icon/' + await GENERAL.pokedexLookup(name.substring(5, name.length)) + '.png';
        } else {
            return 'https://serebii.net//pokedex-sm/icon/' + await GENERAL.pokedexLookup(name.replace(" Shield", "").replace(" Sword", "")) + '.png';
        }
    },
    generatePassivesOut: async function (passives) {
        let passivesOut = "";
        for (const passive of passives) {
            passivesOut += "**" + passive.name + ": **"
                + passive.description
                + "\n";
        }
        return passivesOut;
    },
    generateSyncOut: async function (sync, client) {
        let isStatus = sync.category.toLowerCase() === "status effect";
        return "**S. " + await GENERAL.getEmoji(sync.category.toLowerCase(), client) + " "
            + sync.name + " "
            + (isStatus
                    ? ""
                    : await GENERAL.getEmoji(sync.type.toLowerCase().replace(" ", ""), client)
            )
            + " ・ "
            + "PWR:** " + sync.power.min_power + "→" + sync.power.max_power
            + " ・ "
            + ((sync.target === "All opponents") ? " **AOE**" : " **ST**")
            + "\n"
            + sync.description;
    },
    generateStatTable: async function (stats) {
        let table = new AsciiTable();
        table
            .setBorder('|', '-', '■', '■')
            .setHeading('HP', 'ATK', 'DEF', 'SPATK', 'SPDEF', 'SPD')
            .addRow(stats.base.hp,
                stats.base.attack,
                stats.base.defense,
                stats.base.sp_atk,
                stats.base.sp_def,
                stats.base.speed)
            .addRow(stats.max.hp,
                stats.max.attack,
                stats.max.defense,
                stats.max.sp_atk,
                stats.max.sp_def,
                stats.max.speed);
        return "```" + table.toString() + "```";
    },
    //ToDo: hard code this
    getUnitIcon: async function (unit) {
        let icon;
        try {
            if (unit.name === "Main Character") {
                await fetch(iconUrl)
                    .then(response => response.json())
                    .then(iconsUrl => icon = iconsUrl.find(function (curUnit) {
                        return curUnit.title === "Player"
                    }).icon);
            } else {
                await fetch(iconUrl)
                    .then(response => response.json())
                    .then(iconsUrl => icon = iconsUrl.find(function (curUnit) {
                        return curUnit.title === unit.name
                    }).icon);
            }
        } catch (e) {
            icon = ""
        }
        return 'https://pokemonmasters.gamepress.gg' + icon.substring(icon.indexOf('<img src="') + 10, icon.indexOf('" width'));
    },
    generateMovesOut: async function (moves, client) {
        let count = 1;
        let out = "";
        for (const move of moves) {
            let isStatus = move.category.toLowerCase() === "status effect";
            out += "**" + count + ". "
                + await GENERAL.getEmoji(move.category.toLowerCase(), client) + " "
                + move.name + " "
                + (isStatus
                        ? ""
                        : await GENERAL.getEmoji(move.type.toLowerCase(), client)
                )
                + " ・ **"
                + (isStatus
                        ? " **Uses:** " + move.uses + " **Target:** " + move.target
                        : " **Cost:** " + move.cost + " **PWR:** " + move.power.min_power + "→" + move.power.max_power + " **ACC:** " + move.accuracy + ((move.target === "All opponents")
                            ? " **AOE**"
                            : "")
                )
                + "\n"
                + move.effect
                + "\n";
            count++;
        }
        return out;
    }
};
