const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const trainerFolder = "C:\\Users\\Anthony\\WebstormProjects\\DiscordBot\\commands\\embedbuilders\\helpers\\data\\trainers\\";

const getTrainerData = async () => {
    let body = await axios.get(
        "https://serebii.net/pokemonmasters/trainers.shtml"
    );
    const $ = cheerio.load(body.data);
    const trainerData = $("#content > main > table:nth-child(8) > tbody > tr");
    let isFirst = true;
    trainerData.each(await async function() {
        if(isFirst){
            isFirst = false;
            return;
        }

        const trainerName = $(this)
            .find(".fooinfo > a > u")
            .text();
        const trainerRarity = $(this)
            .find("td:nth-child(4)")
            .text();
        const pokemonList = $(this)
            .find("td:nth-child(5)")
            .html()
            .split("<br>");

        const trainer = {
            name: trainerName,
            rarity: trainerRarity.length,
            pokemon: pokemonList,
            image: "https://serebii.net/pokemonmasters/syncpairs/" + trainerName.replace("Synga Suit ", "").toLowerCase().replace(" ", "") + ".png"
        };

        let objectString = JSON.stringify(trainer);
        fs.writeFileSync(trainerFolder + trainer.name + ".json", objectString);
        console.log(trainer.name + " has been written");
    })
};

getTrainerData().then(x => x);
