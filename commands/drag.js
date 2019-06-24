const cheerio = require('cheerio');
const request = require('request');
const Discord = require('discord.js');
const cheerioTableparser = require('cheerio-tableparser');
module.exports = {
    name: 'drag',
    description: 'view the drag wiki',
    execute(message, args) {
        var appendFinal = "";
        try {
            var isDragon = false;
            if (args[0] == null) {
                //
                //
                // Construction Zone: passing in no argument will return general info about the game ie: event countdown timer
                //
                //
                url = 'https://dragalialost.gamepress.gg/';
                request(url, (error, response, html) => {
                    if (!error && response.statusCode === 200) {
                        const $ = cheerio.load(html);
                        const body = $('body');
                        cheerioTableparser($);
                        const running = body.find($('table')).find($('.event-countdown-table'));
                        console.log(running.find($('tbody')).text());
                    }
                });
                //
                //
                //
                //
                //
            }
            else {
                //solve edge cases of apostrophe and spaces in the unit's name
                var append = "";
                for (var x = 0; x < args.length; x++) {
                    if (x !== 0) {
                        append += "_";
                    }
                    append += args[x].charAt(0).toUpperCase() + args[x].slice(1);
                }
                append = append.replace('\'', '%27');
                appendFinal = append;
                var url = 'https://dragalialost.gamepedia.com/' + append.replace(" ", "_");
                request(url, (error, response, html) => {
                    if (!error && response.statusCode === 200) {
                        const $ = cheerio.load(html);
                        const body = $('body');
                        const infoArr = {};
                        const unitName = $('h1').html();
                        var elementColor;
                        //get unit element
                        const elem = body.find($('.panel-heading')).children().find($('img')).attr('src');
                        //set embed color
                        switch (elem) {
                            case 'https://gamepedia.cursecdn.com/dragalialost_gamepedia_en/thumb/5/57/Icon_Element_Flame.png/19px-Icon_Element_Flame.png?version=93869689432f028c9512a1ee3b10f615':
                                elementColor = "#ff0000";
                                break;
                            case 'https://gamepedia.cursecdn.com/dragalialost_gamepedia_en/thumb/8/80/Icon_Element_Water.png/19px-Icon_Element_Water.png?version=f3dd8ff8dc143d3c60d4b59a62bcf317':
                                elementColor = "#3366cc";
                                break;
                            case 'https://gamepedia.cursecdn.com/dragalialost_gamepedia_en/thumb/6/62/Icon_Element_Wind.png/19px-Icon_Element_Wind.png?version=0b1d41ad1bd00a810f13e583622b34c0':
                                elementColor = "#33cc33";
                                break;
                            case 'https://gamepedia.cursecdn.com/dragalialost_gamepedia_en/thumb/0/0d/Icon_Element_Shadow.png/19px-Icon_Element_Shadow.png?version=84a3a06f13b0e4fd51006fdadd97f944':
                                elementColor = "#660066";
                                break;
                            case 'https://gamepedia.cursecdn.com/dragalialost_gamepedia_en/thumb/1/19/Icon_Element_Light.png/19px-Icon_Element_Light.png?version=e09c55012f71496a9234c49a37d02793':
                                elementColor = "#ffff66";
                                break;
                        }
                        //get unit portrait
                        var image = body.find($('.adv-portrait')).children().find($('img')).attr('src');
                        if (image == null) {
                            image = body.find($('.tabbertab')).children().find($('img')).attr('src');
                            isDragon = true;
                        }
                        //get unit info array
                        const info = body.find($('.dd-description')).each(function (i, elem) {
                            infoArr[i] = $(this).text()
                        });

                        //get unit type
                        const title = body.find($('.panel-heading div[style]')).text();
                        //get unit rarity
                        const rarity = body.find($('.dd-description div[style]')).find($('img')).last().attr('src');
                        var stars;
                        switch (rarity) {
                            case "https://gamepedia.cursecdn.com/dragalialost_gamepedia_en/thumb/2/2e/Icon_Rarity_Row_5.png/90px-Icon_Rarity_Row_5.png?version=7b9cbdb84207b0b299ee8ecc364606dc":
                                stars = 5;
                                break;
                            case "https://gamepedia.cursecdn.com/dragalialost_gamepedia_en/thumb/9/9e/Icon_Rarity_Row_4.png/90px-Icon_Rarity_Row_4.png?version=a5fa99709cd101b1ac26e6a5101ebde3":
                                stars = 4;
                                break;
                            case "https://gamepedia.cursecdn.com/dragalialost_gamepedia_en/thumb/2/21/Icon_Rarity_Row_3.png/90px-Icon_Rarity_Row_3.png?version=9e6ddb955467dfade7f770dce533d5f8":
                                stars = 3;
                                break;
                        }
                        var rarityStr = "";
                        var i;
                        for (i = 0; i < stars; i++) {
                            rarityStr = rarityStr + "⭐";
                        }
                        //initialize and set up table parser
                        cheerioTableparser($);
                        const unitTable = $('table');
                        const data = $(unitTable).parsetable(true, true, true);
                        //
                        // Debug
                        //
                        /*
                        for(x in data){
                            for(var z in data[x]){
                                console.log(x + ", " + z + " : " + data[x][z]);
                            }

                        }
                        console.log(rarity);
                        */
                        if (!isDragon && !(data[0][1] == null)) {

                            //what to execute if the specified argument is a unit
                            var s1, s2, coab, p1, p2, p3;
                            s1 = ["**" + data[0][0] + ": **", data[0][1].substring(data[0][1].indexOf('Lv. 3'), data[0][1].length).replace('Lv. 3', '')];
                            s2 = ["**" + data[0][2] + ": **", data[0][3].substring(data[0][3].indexOf('Lv. 2'), data[0][3].length).replace('Lv. 2', '')];
                            coab = ["**" + data[0][4] + "**", data[0][5].substring(data[0][5].lastIndexOf('\n') + 1)];
                            p1 = ["**" + data[0][6] + ": **", data[0][7].substring(data[0][7].lastIndexOf('\t') + 1)];
                            p2 = ["**" + data[0][8] + ": **", data[0][9].substring(data[0][9].lastIndexOf('\t') + 1)];
                            p3 = ["**" + data[0][10] + ": **", data[0][11].substring(data[0][11].lastIndexOf('\t') + 1)];
                            const embed = new Discord.RichEmbed()
                                .setColor(elementColor)
                                .setAuthor(unitName + ": " + title + " " + rarityStr, elem)
                                .setImage(image)
                                //.setThumbnail(rarity)
                                .addField("ENG VA", infoArr[9], true)
                                .addField("JP VA", infoArr[10], true)
                                .addField("---Co-Ability:---", coab)
                                .addField("-----Skills:-----", s1[0] + s1[1] + "\n" + s2[0] + s2[1])
                                .addField("-----Ability:-----", p1[0] + p1[1] + "\n" + p2[0] + p2[1] + "\n" + p3[0] + p3[1]);
                            message.channel.send({embed})
                        } else if(!(data[0][1] == null)){
                            //what to execute if the specified argument is a dragon
                            var modset, abilities;
                            if (data[0][4] != "Attack") {
                                abilities = (data[0][2] + ": **" + data[0][3].substring(data[0][3].lastIndexOf('\t') + 1)) + "\n**" + data[0][4] + ": **" + data[0][5].substring(data[0][5].lastIndexOf('\t') + 1);
                                modset = [7, 8, 9];
                            }
                            else {
                                abilities = (data[0][2] + ": **" + data[0][3].substring(data[0][3].lastIndexOf('\t') + 1));
                                modset = [5, 6, 7];
                            }
                            var h001 = data[1][modset[0]];
                            var h002 = data[1][modset[1]];
                            var h003 = data[1][modset[2]];
                            if (h001.length < 4) {
                                h001 += " ";
                            }
                            if (h002.length < 4) {
                                h002 += " ";
                            }
                            if (h003.length < 4) {
                                h003 += " ";
                            }
                            var date;
                            //console.log(infoArr[4]);
                            var today = new Date().getDay();
                            switch (infoArr[4]) {
                                case " Juicy Meat":
                                    date = "Monday";
                                    break;
                                case " Kaleidoscope":
                                    date = "Tuesday";
                                    break;
                                case " Floral Circlet":
                                    date = "Wednesday";
                                    break;
                                case " Compelling Book":
                                    date = "Thursday";
                                    break;
                                case " Mana Essence":
                                    date = "Friday";
                                    break;
                            }
                            var food = infoArr[4];
                            switch (date) {
                                case "Monday":
                                    if (today === 1) {
                                        food += " 👑";
                                    }
                                    break;
                                case "Tuesday":
                                    if (today === 2) {
                                        food += " 👑";
                                    }
                                    break;
                                case "Wednesday":
                                    if (today === 3) {
                                        food += " 👑";
                                    }
                                    break;
                                case "Thursday":
                                    if (today === 4) {
                                        food += " 👑";
                                    }
                                    break;
                                case "Friday":
                                    if (today === 5) {
                                        food += " 👑";
                                    }
                                    break;
                                case "Saturday":
                                    if (today === 6) {
                                        food += " 👑";
                                    }
                                    break;
                                case "Sunday":
                                    if (today === 7) {
                                        food += " 👑";
                                    }
                                    break;
                            }
                            const embed = new Discord.RichEmbed()
                                .setColor(elementColor)
                                .setAuthor(unitName + ": " + title + " " + rarityStr, elem)
                                .setImage(image)
                                //.setThumbnail(rarity)
                                .addField("Favorite gift", food, true)
                                .addField("Feeding Day:", date, true)
                                .addField("-----Skill:-----", "**" + data[0][0] + ": **" + data[0][1].substring(data[0][1].indexOf('Lv. 2'), data[0][1].length).replace('Lv. 2', ''))
                                .addField("----Ability:----", "**" + abilities)
                                .addField("---Modifiers:---", "```╔═════════╦══════════╦═════════╗\n" +
                                    "║ Attack  ║   Mod    ║  #Hits  ║\n" +
                                    "╠═════════╬══════════╬═════════╣\n" +
                                    "║ Combo1  ║   " + h001 + "   ║    " + data[2][modset[0]] + "    ║\n" +
                                    "║ Combo2  ║   " + h002 + "   ║    " + data[2][modset[1]] + "    ║\n" +
                                    "║ Combo3  ║   " + h003 + "   ║    " + data[2][modset[2]] + "    ║\n" +
                                    "╚═════════╩══════════╩═════════╝```");
                            message.channel.send({embed})
                        }
                        if(data[0][1] == null){
                            message.channel.send("The information for the unit you've requested is not ready yet.");
                        }
                    }
                });
            }
        }catch (e) {
            //
        }finally {
            console.log(`DRAG  || ${message.author.username} requested ${appendFinal}`);
        }
    },
};

