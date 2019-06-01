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

    const url = 'https://warframe.fandom.com/wiki/'+ args[0];

request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const gunName = $('h1').html()
        const body = $('body')
        const labelArr = {}
        const valueArr = {}
        const value = body.find($('.pi-data-value')).each(function (i, elem) {
            valueArr[i] = $(this).text()
        })
        const label = body.find($('.pi-data-label')).each(function (i, elem) {
            labelArr[i] = $(this).text()
        })
        const image = body.find($('.lzyPlcHld')).attr('src');

        const embed = new Discord.RichEmbed()
            .setImage(image)
            .addField("Label","MR"+"\n"+"Slot"+"\n"+"Type"+"\n"+labelArr[3]+"\n"+labelArr[4]+"\n"+labelArr[5]+"\n"+labelArr[6]+"\n"+labelArr[7]+"\n"+labelArr[8]+"\n"+labelArr[9]+"\n"+labelArr[10]+"\n"+labelArr[11]+"\n"+labelArr[12],true)
            .addField("Value",valueArr[1]+"\n"+valueArr[2]+"\n"+valueArr[3]+"\n"+valueArr[4]+"\n"+valueArr[5]+"\n"+valueArr[6]+"\n"+valueArr[7]+"\n"+valueArr[8]+"\n"+valueArr[9]+valueArr[10]+"\n"+valueArr[11]+"\n"+valueArr[12]+"\n",true)
        message.channel.send({embed})
        //console.log(labelArr[0]);
/*the first element (labelArr[0]) seems to be the image of the gun
* */

    }
})
},
};


/*
=================***********=================****************=================***********=================
=================***********=================Test Shit Ignore=================***********=================
=================***********=================****************=================***********=================
url = 'https://warframe.fandom.com/wiki/Boltor Prime'

request(url, (error, response, html) => {
    if(!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const body = $('body')

    }
}*/



