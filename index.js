const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
		args: ['--no-sandbox'],
	}
});


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('auth_failure', (session) => {    
    console.log('Auth failure, restarting...!', session);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});


client.on('message', message => {
    const msg = message.body.toLowerCase()
    const chat = message.getChat();
    const contact = message.getContact();



    if(msg === '!ping') {
		message.reply('pong');
	}

    else if(msg === 'hai') {
		client.sendMessage(message.from, 'halo');
	}

    else if(msg === 'hi') {
        chat.sendMessage(`Hello @${contact.id.user}`, {
            mentions: [contact]
        });
	}

    else if (msg == '!groups') {
        client.getChats().then(chats => {
            const groups = chats.filter(chat => chat.isGroup);

            if (groups.length == 0) {
                msg.reply('You have no group yet.');
            } else {

                let replyMsg = '*YOUR GROUPS*\n\n';
                groups.forEach((group, i) => {
                    replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
                });
                replyMsg += '_You can use the group id to send a message to the group._'
                msg.reply(replyMsg);
            }
        });
    }

    else if(msg.body === '!everyone') {
        const chat = message.getChat();
        
        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = client.getContactById(participant.id._serialized);
            
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        chat.sendMessage(text, { mentions });
    }
    
});



client.initialize();