const Discord = require('discord.js');
const GENERAL = require('./embedbuilders/helpers/generalHelper');
module.exports = {
    name: 'carry',
    display: 'Carry',
    description: 'Get carried in pokemon masters',
    async execute(message, args, client, dataStore, requests) {
        let queueRole = message.guild.roles.get('667559290424393739');
        let member = message.member;
        switch (args[0]) {
            case 'resolve':
                let match = args[1].match(/^<@!?(\d+)>$/);
                if (!match) return;
                const toRemoveId = match[1];
                for (const carry of requests) {
                    if (carry.status.id.indexOf(message.author.id) !== -1 && carry.requestee.id === toRemoveId) {
                        const index = requests.indexOf(carry);
                        await message.channel.send(new Discord.RichEmbed()
                            .setTitle(`Carry Success!`)
                            .addField('Description', `<@${message.author.id}> has successfully carried <@${toRemoveId}>.`)
                            .setColor('#4286f4')
                        );
                        if (carry.status.count === 1) {
                            client.channels.get('665772841714581505').send(new Discord.RichEmbed()
                                .setTitle(`Carry Success!`)
                                .addField('Description', `<@${message.author.id}> has successfully carried <@${toRemoveId}>.`)
                                .setColor('#4286f4')
                            );
                        } else if (carry.status.count === 2) {
                            client.channels.get('665772841714581505').send(new Discord.RichEmbed()
                                .setTitle(`Carry Success!`)
                                .addField('Description', `<@${carry.status.id[0]}> and <@${carry.status.id[1]}> have successfully carried <@${toRemoveId}>.`)
                                .setColor('#4286f4')
                            );
                        }
                        requests.splice(index, 1);
                        let toRemoveMember = message.guild.members.get(toRemoveId);
                        if (toRemoveMember !== null && queueRole !== null) {
                            if (toRemoveMember.roles.has(queueRole.id)) {
                                await toRemoveMember.removeRole(queueRole).catch(console.error);
                            }
                        }
                    }
                }
                return;
            case 'view':
                if (requests.length > 0) {
                    if (message.channel.id === '620714509862174720' || message.channel.id === '665358096725704733') {
                        await GENERAL.paginationEmbed(message, requests.map((elem) => {
                            const claimedOut = (elem.status.count > 0) ? `Claimed by ${(elem.status.count === 1) ? elem.status.by[0] : elem.status.by[0] + ' | ' + elem.status.by[1]}` : 'Unclaimed';
                            return new Discord.RichEmbed()
                                .setTitle(`Carry Request From ${elem.requestee.username}`)
                                .setColor('#4286f4')
                                .setThumbnail(elem.requestee.avatar)
                                .addField('Team Power', elem.score, true)
                                .addField('Needs Help With', elem.ex)
                                .addField('Other Notes', elem.carryMessage)
                                .addField('User', `<@${elem.requestee.id}>`)
                                .addField('Status', claimedOut)
                                .addField('Submitted On', elem.submittedOn)
                        }), GENERAL.nextButtons, GENERAL.paginationTimeOut);
                    }
                } else {
                    if (message.channel.id === '620714509862174720' || message.channel.id === '665358096725704733') {
                        await message.channel.send(new Discord.RichEmbed()
                            .setTitle(`Error`)
                            .addField('Description', `sorry <@${message.author.id}>, but there are currently no requests to view.`)
                            .setColor('#ff0000')
                        );
                    }
                }
                return;
            case 'claim':
                if (message.member.roles.find(r => r.name === "任せて") && (message.channel.id === '620714509862174720' || message.channel.id === '665718303045582868' || message.channel.id === '665358096725704733')) {
                    let matches = args[1].match(/^<@!?(\d+)>$/);
                    if (!matches) return;
                    const id = matches[1];
                    for (const carry of requests) {
                        if (id === carry.requestee.id && !carry.status.occupied) {
                            requests[requests.indexOf(carry)].status.count++;
                            if (requests[requests.indexOf(carry)].status.count === 2) {
                                requests[requests.indexOf(carry)].status.occupied = true;
                                requests[requests.indexOf(carry)].status.by.push(message.author.username);
                                requests[requests.indexOf(carry)].status.id.push(message.author.id);
                            } else {
                                requests[requests.indexOf(carry)].status.by.push(message.author.username);
                                requests[requests.indexOf(carry)].status.id.push(message.author.id);
                            }
                            await message.channel.send(new Discord.RichEmbed()
                                .setTitle(`Carry Claimed`)
                                .addField('Description', `<@${message.author.id}> has claimed the carry request by <@${id}>.`)
                                .setColor('#4286f4')
                            );
                        } else if (id === carry.requestee.id && carry.status.occupied) {
                            await message.channel.send(new Discord.RichEmbed()
                                .setTitle(`Error`)
                                .addField('Description', `sorry <@${message.author.id}>, but that carry is already claimed by <@${carry.status.id}>`)
                                .setColor('#ff0000')
                            );
                        }
                    }
                }
                return;
            case 'remove':
                if (message.channel.id === '620714509862174720' || message.channel.id === '665718303045582868') {
                    for (const carry of requests) {
                        if (carry.requestee.id === message.author.id) {
                            const index = requests.indexOf(carry);
                            requests.splice(index, 1);
                            await message.channel.send(new Discord.RichEmbed()
                                .setTitle(`Request Deleted`)
                                .addField('Description', `<@${message.author.id}>, your carry request has been deleted.`)
                                .setColor('#4286f4')
                            );
                            if (member !== null && queueRole !== null) {
                                if (member.roles.has(queueRole.id)) {
                                    await member.removeRole(queueRole).catch(console.error);
                                }
                            }
                            return;
                        }
                    }
                }
                break;
            default:
                if (message.channel.guild.id === '591387128701780085' || message.channel.id === '665718303045582868') {
                    let hasCarry = false;
                    for (const carry of requests) {
                        if (carry.requestee.id === message.author.id) {
                            hasCarry = true;
                            await message.channel.send(new Discord.RichEmbed()
                                .setTitle(`Error`)
                                .addField('Description', `sorry <@${message.author.id}>, but you already have a request, wait for your request to be resolved or use \`>carry resolve\` to remove your current request.`)
                                .setColor('#ff0000')
                            );
                            return;
                        }
                    }
                    if (!hasCarry) {
                        const score = args[0];
                        const ex = args[1];
                        let carryMessage = '';
                        let count = 0;
                        for (const elem of args) {
                            if (count === 0 || count === 1) {/**/
                            } else {
                                carryMessage += (elem + ' ');
                            }
                            count++;
                        }
                        const date = new Date();
                        let timestamp = date.getDay() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' | ' + date.getHours() + ':' + date.getSeconds();
                        requests.unshift({
                            requestee: {
                                id: message.author.id,
                                username: message.author.username,
                                avatar: message.author.avatarURL
                            },
                            score: score,
                            ex: ex,
                            carryMessage: carryMessage,
                            status: {
                                count: 0,
                                occupied: false,
                                by: [],
                                id: [],
                            },
                            submittedOn: timestamp
                        });
                        message.channel.send(`User <@${message.author.id}> has requested a carry. A Carry will @ you in a Co-op channel ASAP!`);
                        client.channels.get('665772841714581505').send('<@&665606175974490119>');
                        client.channels.get('665772841714581505').send(new Discord.RichEmbed()
                            .setTitle(`New Carry Request From ${message.author.username}`)
                            .setColor('#4286f4')
                            .setThumbnail(message.author.avatarURL)
                            .addField('Team Power', score, true)
                            .addField('Needs Help With', ex)
                            .addField('Other Notes', carryMessage)
                            .addField('User', `<@${message.author.id}>`)
                            .addField('Submitted On', timestamp)
                        );
                    }
                    if (member !== null && queueRole !== null) {
                        if (!member.roles.has(queueRole.id)) {
                            await member.addRole(queueRole).catch(console.error);
                        }
                    }
                }
        }
    }
};
