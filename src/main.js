const Config = require('../config/config.json')
const MessageHandler = require('./message_handler.js')
const Discord = require('discord.js')
const client = new Discord.Client()

client.once('ready', () => console.log('Ready!'))
client.on('message', (msg) => MessageHandler.handleMessage(Config['owners'], Config['prefix'], msg))
client.on('guildMemberAdd', MessageHandler.handleJoin)
client.on('guildCreate', (guild) => MessageHandler.guildCreate(guild))

client.login(Config['Njg5NTQwMzExMjQ4MDExMjc2.Xn3ivQ.tIZ8JztPI8zH9GXfkjYwW3JUse8'])