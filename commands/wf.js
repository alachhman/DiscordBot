const cheerio = require('cheerio');
const request = require('request');
const fetch = require('node-fetch');
const Discord = require('discord.js');
//const cheerioTableparser = require('cheerio-tableparser')

//So the discord wrapper runs without problems which is nice. Nothing happens of course because I think it has to be ran on the server
module.exports = {
    name: 'wf',
    description: 'Find weapons',
    execute(message, args) {
        //this is supposed to string match labels later so that I don't have to guess and check what position in an array a label is in
        //It's not working right now of course


        var append = "";
        for(var x = 0; x < args.length; x++){
            if(x !== 0){
                append += "_";
            }
            append += args[x].charAt(0).toUpperCase() + args[x].slice(1);
        }

        var url = 'https://warframe.fandom.com/wiki/'+ append.replace(" ","_");

request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {



        const $ = cheerio.load(html);
        const gunName = $('h1').html()
        const body = $('body')
        const imageLocation = $('div.floatnone')
        const labelArr = {}
        const valueArr = {}
        const value = body.find($('div.pi-data-value')).each(function (i, elem) {
            valueArr[i] = $(this).text()
        })
        const label = body.find($('.pi-data-label')).each(function (i, elem) {
            labelArr[i] = $(this).text()
        })

        var convert2D = Object.keys(labelArr).map(function (key) {
            return[labelArr[key]];
        });

        var finalConvertedLabel = [];

        for(i = 0; i < convert2D.length; i++){
            finalConvertedLabel = finalConvertedLabel.concat(convert2D[i]);
        }

        var convert2D = Object.keys(valueArr).map(function (key) {
            return[valueArr[key]];
        });

        var finalConvertedValue = [];

        for(i = 0; i < convert2D.length; i++){
            finalConvertedValue = finalConvertedValue.concat(convert2D[i]);
        }

        const ammoType = finalConvertedLabel.indexOf('Ammo Type');
        const critC = finalConvertedLabel.indexOf('Crit Chance');
        const statusC = finalConvertedLabel.indexOf('Status Chance');
        const fireRate = finalConvertedLabel.indexOf('Fire Rate');

        var image = imageLocation.find($('a.image.image-thumbnail')).attr('href');
        console.log(finalConvertedLabel);
        console.log('==============================================' + '\n');
        console.log('==============================================' + '\n');
        console.log('==============================================' + '\n');
        console.log(finalConvertedValue);

        const embed = new Discord.RichEmbed()
            .setImage(image)
            .addField(labelArr[ammoType], " " + valueArr[ammoType+1])
            .addField(labelArr[fireRate], " " + valueArr[fireRate+1])
            .addField(labelArr[statusC], " " + valueArr[statusC+1])
            .addField(labelArr[statusC], " " + valueArr[critC+1])
            //.addField(labelArr[y] + "  " + valueArr[y])
            //.addField(labelArr[z] + "  " + valueArr[z])
            //.addField("Label","MR"+"\n"+"Slot"+"\n"+"Type"+"\n"+labelArr[3]+"\n"+labelArr[4]+"\n"+labelArr[5]+"\n"+labelArr[6]+"\n"+labelArr[7]+"\n"+labelArr[8]+"\n"+labelArr[9]+"\n"+labelArr[10]+"\n"+labelArr[11]+"\n"+labelArr[12],true)
            //.addField("Value",valueArr[1]+"\n"+valueArr[2]+"\n"+valueArr[3]+"\n"+valueArr[4]+"\n"+valueArr[5]+"\n"+valueArr[6]+"\n"+valueArr[7]+"\n"+valueArr[8]+"\n"+valueArr[9]+"\n"+valueArr[10]+"\n"+valueArr[11]+"\n"+valueArr[12]+"\n",true)
        message.channel.send({embed})

        //console.log(image);

    }
})
},
};






/* function searchString (str, array1) {
        const x = array1.indexOf(str);
        return x;
       }*/

/*
       function searchString (str, array1) {
            for (var j = 0; j < array1.length; j++) {
                var k = 0;
                if (array1[j].match(str)) {
                    k = j;
                    return k;
                }
            }
            return k;
        }

*/

/*
        function searchString (str, array1) {
            for (var j = 0; j < array1.length; j++) {
                console.log(j);
                console.log(str);
                //uh wtf?
                console.log(array1[j]);
                if (array1[j].match(str)) {
                    return j;
                }
            }
            return j;
        }
*/


/*
        function searchString (str, array) {
            for (var j = 0; j < array.length; j++) {
                console.log(j);
                console.log(str);
                //uh wtf?
                console.log(array[j]);
                if (array[j].match(str)) {
                    return j;
                }
            }
            return j;
        }
*/