module.exports = {
    name: 'givet',
    display: 'Give',
    description: 'shhh.',
    async execute(message, args, client, data) {
        // if(!message.member.roles.find(role => role.id === "602992760076894256")) return;
        if(!message.member.roles.find(role => role.id === "591388268503892136")) return;
        let roleExists = false;
        let roleToGive;
        const request = {
            user: args[0],
            roleName: args[1],
            //days: args[2] * 86400000,
            days: args[2],
            color: args[3]
        };
        const guildMember = message.guild.members
            .find(user => user.id === request.user);
        message.guild.roles.forEach(role => {
            if (role.name.toLocaleUpperCase() === request.roleName.toLocaleUpperCase()) {
                roleExists = true;
                roleToGive = role;
            }
        });
        if (roleExists) {
            try {
                await addRole(guildMember, roleToGive);
                setTimeout(removeRole, request.days, guildMember, roleToGive);
            } catch (e) {
                console.log(e)
            }
        } else {
            try {
                message.guild.createRole({
                    name: request.roleName,
                    color: (request.color) ? request.color : "WHITE",
                }).then(role => {
                    addRole(guildMember, role);
                    setTimeout(removeRole, request.days, guildMember, role);
                })
            } catch (e) {
                console.log(e);
            }

        }
    }
};

function removeRole(member, role) {
    member.removeRole(role).then(r => member.user.sendMessage(`The time for your ${role.name} role has expired.`))
}

async function addRole(guildMember, roleToGive) {
    await guildMember.addRole(roleToGive);
}
