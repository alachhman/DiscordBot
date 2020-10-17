const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const pokemonFolder = "C:\\Users\\Anthony\\WebstormProjects\\DiscordBot\\commands\\embedbuilders\\helpers\\data\\pokemon\\";

const getPokemonMastersPokemonList = async () => {
    let json = await axios.get(
        "https://gamepress.gg/sites/default/files/aggregatedjson/PokemonMastersPokemonList.json"
    );

    json.data.map(async function (pokemon) {
        let name = pokemon.title_plain
            .split("&amp;")
            .pop()
            .trim();
        let trainer = pokemon.title_plain
            .split(" &amp;")[0]
            .replace("Sygna Suit ","");
        let filename = name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/\(|\)/g, "");

        let type1 = pokemon.type1_plain;
        let type2 = pokemon.type2_plain;
        let weakness = pokemon.weakness_plain;
        let role = pokemon.role;
        let bulk = pokemon.bulk;
        let image = pokemon.icon
            .replace(/\n/g, "")
            .trim()
            .replace(/<a href="(.*)"><img src="|".*$/gm, "")
            .replace(/^\/sites.*(?=pm)|\?.*$/g, "");
        let moves = [];

        const pokemonMovesUri = await axios.get(
            "https://pokemonmasters.gamepress.gg" + pokemon.path
        );

        const $ = cheerio.load(pokemonMovesUri.data);

        const rarityUrl = $(".base-potential-image > img").attr("src");
        let rarity = "";
        if(rarityUrl.includes("5-star")){
            rarity = 5;
        }else if(rarityUrl.includes("4-star")){
            rarity = 4;
        }else if(rarityUrl.includes("3-star")){
            rarity = 3;
        }else{
            rarity = 3;
        }

        const otherForms = $(".pokemon-title")
            .text()
            .split("\n")
            .filter(x => x !== "")
            .map(x => x
                .replace(trainer + " & ","")
                .replace("Sygna Suit ", ""));

        const movesTable = $(
            ".view-moves-on-pokemon-node.pokemon-node-moves-container > div.views-row.pokemon-node-move > div.move-pokemon-page-container"
        );

        movesTable.each(function () {
            const move_name = $(this)
                .find(".move-pokemon-page-title > a")
                .text();
            const move_type = $(this)
                .find(".move-type > td")
                .text()
                .trim();
            const move_category = $(this)
                .find(".move-category > td > img")
                .attr("src")
                .split("/")
                .pop()
                .split(".")[0]
                .replace(/%20/g, " ");
            const move_power = {
                min_power: parseInt(
                    $(this)
                        .find(".move-pokemon-page-power > span.min-power")
                        .text()
                ),
                max_power: parseInt(
                    $(this)
                        .find(".move-pokemon-page-power > span.max-power")
                        .text()
                )
            };
            const move_accuracy = parseInt(
                $(this)
                    .find(".move-accuracy > th:contains('Accuracy') + td")
                    .text()
            );
            const move_target = $(this)
                .find(".move-target > th:contains('Target') + td")
                .text();
            const move_cost =
                $(this).find(".pokemon-cost-box-PG").length > 0
                    ? parseInt($(this).find(".pokemon-cost-box-PG").length)
                    : "";
            const move_uses =
                $(this).find(".move-uses > td > a").length > 0
                    ? parseInt(
                    $(this)
                        .find(".move-uses > td > a")
                        .text()
                    )
                    : "";
            const move_effect = $(this)
                .find(".move-effect")
                .text();
            const move_unlock_requirements = [];

            $(this)
                .find(
                    ".field--name-field-move-unlock-requirements > .field__items > .field__item"
                )
                .each(function () {
                    move_unlock_requirements.push(
                        $(this)
                            .find(".move-unlock-requirements-text")
                            .text()
                    );
                });

            moves.push({
                name: move_name,
                type: move_type,
                category: move_category,
                power: move_power,
                accuracy: move_accuracy,
                target: move_target,
                cost: move_cost,
                uses: parseInt(move_uses),
                effect: move_effect,
                unlock_requirements: move_unlock_requirements
            });
        });

        const Sync = $(".sync-move-pokemon-page-container");
        const SyncTable = $(Sync).find(".sync-move-pokemon-page-left");
        const SyncMove = {
            name: $(Sync).find(".sync-move-pokemon-page-title > a").text(),
            type: $(SyncTable).find(".sync-type > td").text().replace("\n", ""),
            category: $(SyncTable).find(".sync-category > td > img")
                .attr("src")
                .split("/")
                .pop()
                .split(".")[0]
                .replace(/%20/g, " "),
            power: {
                min_power: parseInt($(SyncTable).find(".min-power").text()),
                max_power: parseInt($(SyncTable).find(".max-power").text())
            },
            target: $(SyncTable).find("> table > tbody > tr:nth-child(5) > td").text(),
            effect_tag: $(SyncTable).find("> table > tbody > tr:nth-child(6) > td").text(),
            description: $(Sync).find(".sync-move-pokemon-page-right > p").text()
        };

        const passives = [];
        const passivesDom = $(".view.view-passive-skill-on-pokemon-node > div.view-content > div.views-row");
        passivesDom.each(function () {
            passives.push({
                name: $(this).find(".passive-title").text(),
                description: $(this).find(".passive-skill-effect").text().replace("\n", "").replace("\n", "")
            })
        });

        let stats = [];

        const pokemonStats = await axios.get(
            "https://gamepress.gg/sites/default/files/aggregatedjson/StatRankingsMastersPokemon.json"
        );

        await pokemonStats.data.map(stat => {
            let statFileName = stat.title
                .split("&amp;")
                .pop()
                .trim()
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/\(|\)/g, "");
            if (statFileName === filename) {
                stats = {
                    base: {
                        attack: parseInt(stat.field_base_attack),
                        defense: parseInt(stat.field_base_defense),
                        hp: parseInt(stat.field_base_hp),
                        speed: parseInt(stat.field_base_speed),
                        sp_atk: parseInt(stat.field_base_sp_atk),
                        sp_def: parseInt(stat.field_base_sp_def)
                    },
                    max: {
                        attack: parseInt(stat.field_max_attack),
                        bulk: parseInt(stat.field_max_bulk_floored),
                        defense: parseInt(stat.field_max_defense),
                        hp: parseInt(stat.field_max_hp),
                        speed: parseInt(stat.field_max_speed),
                        sp_atk: parseInt(stat.field_max_sp_atk),
                        sp_def: parseInt(stat.field_max_sp_def)
                    }
                };
            }
        });

        let object = {
            name: name === "" ? "" : name,
            trainer: trainer === "" ? "" : trainer,
            type1: type1 === "" ? "" : type1,
            type2: type2 === "" ? "" : type2,
            weakness: weakness === "" ? "" : weakness,
            rarity: rarity,
            role: role === "" ? "" : role,
            image: image === "" ? "" : image,
            stats: stats,
            bulk: bulk,
            moves: moves,
            syncMove: SyncMove,
            passives: passives,
            otherForms: otherForms
        };

        let objectString = JSON.stringify(object);
        fs.writeFileSync(pokemonFolder + filename + "-" + trainer + ".json", objectString);
        console.log(object.name + " has been written");
    });
};

getPokemonMastersPokemonList();
