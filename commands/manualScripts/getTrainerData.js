const fs = require("fs");
const request = require('request');
const cheerio = require("cheerio");
const axios = require("axios");
const {trainerData} = require('./trainers');
log = console.log;
const trainerFolder = "/Users/alachhman/Documents/GitHub/DiscordBot/commands/embedbuilders/helpers/data/trainers/";

const getTrainerData = async () => {
    trainerData.map(async function (trainer) {
        const trainerUri = await axios.get(
            "https://gamepress.gg/pokemonmasters/trainer/" + trainer.Trainer.replace(". ", "-").replace(" ", "-").replace(" ", "-")
        );
        let $ = cheerio.load(trainerUri.data);

        const description = $('div.trainer-description').text();

        let base_potential_src = $('#sync-pair-table > tbody > tr:nth-child(2) > td').attr("src");
        if (base_potential_src === undefined) {
            base_potential_src = "5-star";
        }
        let base_potential;
        if (base_potential_src.includes("5-star")) {
            base_potential = 5;
        } else if (base_potential_src.includes("4-star")) {
            base_potential = 4;
        } else if (base_potential_src.includes("3-star")) {
            base_potential = 3;
        }

        const recruitMethod = $('#sync-pair-table > tbody > tr:nth-child(3) > td').text();

        const firstPokemonData = await axios.get('https://gamepress.gg' + ($('.view.view-pokemon-on-trainer-node').find('a').attr("href")));

        $ = cheerio.load(firstPokemonData.data);

        const type = $('#pokemon-table > tbody > tr:nth-child(1) > td').text().split('\n')[1];

        const object = {
            name: trainer.Trainer,
            info: description,
            type: type,
            base_potential: parseInt(base_potential),
            recruit_method: recruitMethod,
            pokemon_list: trainer.Pokemon.split("     ")
        };

        let objectString = JSON.stringify(object);
        fs.writeFileSync(trainerFolder + trainer.Trainer + ".json", objectString);
        console.log(object.name + " has been written");
    });
};

getTrainerData();
