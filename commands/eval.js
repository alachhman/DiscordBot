const Discord = require('discord.js');

module.exports = {
    name: 'eval',
    Display: 'Eval',
    description: 'Evaluate\'s some js code.',
    execute(message, args, client) {
        if(message.author.id !== "115270563349528579"){
            message.channel.send("You're not allowed to use this Command.")
        } else {
            let toEval = message.content.replace(">eval", "");
            toEval = toEval.split("```").join("");
            try {
                eval(toEval).then(x => message.delete());
            } catch (e) {
                message.channel.send("```" + e + "```")
            }
        }
    },
};
