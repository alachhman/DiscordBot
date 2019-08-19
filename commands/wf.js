const cheerio = require('cheerio');
const request = require('request');
const fetch = require('node-fetch');
const Discord = require('discord.js');
//const cheerioTableparser = require('cheerio-tableparser')

//So the discord wrapper runs without problems which is nice. Nothing happens of course because I think it has to be ran on the server
module.exports = {
    name: 'Warframe Weapons, maybe frames?',
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
        console.log(labelArr[6]);
        const embed = new Discord.RichEmbed()
            .addField("Some bullshit",valueArr[1],true)
            .addField("Another bullshit",labelArr[2],true)
        message.channel.send({embed})

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



