const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const request = require('request');
const trainerFolder = "C:\\Users\\Anthony\\WebstormProjects\\DiscordBot\\commands\\embedbuilders\\helpers\\data\\trainers\\";

const getTrainerData = async () => {
    console.log("STARTING DATA DOWNLOAD\n===================");
    let body = await axios.get(
        "https://serebii.net/pokemonmasters/trainers.shtml"
    );
    const $ = cheerio.load(body.data);
    const trainerData = $("#content > main > table:nth-child(8) > tbody > tr");
    let isFirst = true;
    let imgURLs = [];
    await trainerData.each(await async function () {
        if (isFirst) {
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
            name: trainerName.replace("Professor ", ""),
            rarity: trainerRarity.length,
            pokemon: pokemonList,
            image: "http://pokemasdb.com/trainer/image/" + trainerName + ".png",
            data: "http://pokemasdb.com/trainer/" + trainerName.replace(" ", "%20")
        };

        //await download(trainer.image, "trainerImages/" + trainer.name + ".png");

        let objectString = JSON.stringify(trainer);
        await fs.writeFileSync(trainerFolder + trainer.name + ".json", objectString);
        console.log(trainer.name + " has been written");

        imgURLs.push({
            url: "https://serebii.net/pokemonmasters/syncpairs/" + trainerName.replace("Synga Suit ", "").toLowerCase().replace(" ", "") + ".png",
            name: trainer.name
        });
    });
    return imgURLs;
};

const getTrainerImages = async (imgURLs) => {
    console.log("STARTING IMAGE DOWNLOAD\n===================");
    let count = 1;
    imgURLs.forEach(await async function (img) {
        setTimeout(async x => {
            console.log("Downloading " + img.name + "'s image");
            await download(img.url, "trainerImages/" + img.name + ".png");
        }, count * 500);
        count++;
    })
};

const download = async (url, image_path) => {
    await axios({url, responseType: 'stream'})
        .then(await async function (response){
            return new Promise(await async function (resolve, reject) {
                await response.data
                    .pipe(await fs.createWriteStream(image_path))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            })
        })
};


getTrainerData().then(async x => await getTrainerImages(x));
