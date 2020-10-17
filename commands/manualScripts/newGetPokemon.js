const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const pokemonFolder = "C:\\Users\\Anthony\\WebstormProjects\\DiscordBot\\commands\\embedbuilders\\helpers\\data\\pokemon\\";


const getPokemonList = async () => {
    let body = await axios.get(
        "https://gamepress.gg/pokemonmasters/database/sync-pair-list"
    );
    const $ = cheerio.load(body.data);
    let links = [];
    const pokeTable = $('#sync-pairs-new-list > tbody > tr').each(async function () {
        const trainerUrl = $(this)
            .find("td:nth-child(1) > a")
            .attr("href");
        links.push("https://gamepress.gg" + trainerUrl);
    });
    return links;
};

const getPokemonData = async (links) => {
    links.map(async x => {
        let body = await axios.get(x);
        const $ = cheerio.load(body.data);

        const pokemonName = $("#page-title > h1")
            .text()
            .split(" & ")[1];

        let filename = pokemonName
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/\(|\)/g, "");

        const trainer = $("#page-title > h1")
            .text()
            .split(" & ")[0]
            .replace("Sygna Suit ","");

        const dataTable = $("#pokemon-table");

        let pokemonTyping = [];
        $(dataTable.find("tbody > tr:nth-child(1) > td > span")).each(await async function () {
            const type = $(this).attr("class");
            pokemonTyping.push(type.replace("-type", ""))
        });

        const weakness = $(dataTable.find("tbody > tr:nth-child(2) > td > span"))
            .attr("class")
            .replace("-type", "");

        const role = $(dataTable.find(".role-image > a")).text();

        const rarityImage = $(dataTable.find(".base-potential-image > img")).attr("src");
        let rarity = "";
        if(rarityImage.includes("3-star")){rarity = "3";}
        if(rarityImage.includes("4-star")){rarity = "4";}
        if(rarityImage.includes("5-star")){rarity = "5";}

        const gender = $(dataTable.find(".pokemon-gender-cell > a")).text();

        let moves = [];
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

        let baseStats = [];
        let maxStats = [];
        const baseStatGroup = $("#pokemon-stats > div.tab-content-stats.base-stat-bars")
            .find(".stat-text")
            .each(await async function() {
                const stat = $(this).text().split("\n");
                if(stat.length > 1){
                    stat.pop();
                    baseStats.push(stat);
                }
        });
        const maxStatGroup = $("#pokemon-stats > div.tab-content-stats.max-stat-bars")
            .find(".stat-text")
            .each(await async function() {
                const stat = $(this).text().split("\n");
                if(stat.length > 1){
                    stat.pop();
                    maxStats.push(stat);
                }
            });

        let grid = [];
        const gridData = $("#sort-table > tbody").find("tr").each(await async function () {
            const bonus = $(this)
                .find("td.views-field.views-field-nothing-1")
                .text();
            const syncOrbCost = $(this)
                .find("td.views-field.views-field-field-sync-orb-cost")
                .text();
            const energyCost = $(this)
                .find("td.views-field.views-field-field-energy-cost")
                .text();
            const reqSyncLevel = $(this)
                .find("td.views-field.views-field-field-unlocks-at-sync-level")
                .text();
            const gridPos = $(this)
                .find("td.views-field.views-field-nothing-2")
                .text();
            grid.push({
                bonus: bonus.replace(/(\r\n|\n|\r)/gm, ""),
                syncOrbCost: syncOrbCost.trim(),
                energyCost: energyCost.trim(),
                reqSyncLevel: (reqSyncLevel === " ") ? "1" : reqSyncLevel,
                gridPos: gridPos.trim()
            });
        });

        const pokemon = {
            name: pokemonName,
            trainer: trainer,
            typing: pokemonTyping,
            weakness: weakness,
            role: role,
            rarity: rarity,
            gender: gender,
            otherForms: otherForms,
            moves: moves,
            syncMove: SyncMove,
            passives: passives,
            stats: {
                base: baseStats,
                max: maxStats
            },
            grid: grid,
        };

        let objectString = JSON.stringify(pokemon);
        fs.writeFileSync(pokemonFolder + filename + "-" + trainer + ".json", objectString);
        console.log(pokemon.name + " has been written");
    });
};

getPokemonList().then(x => getPokemonData(x)).then(y => console.log("done."));
