const Db = require('./db.js')
const { TaskTimer } = require('tasktimer')

const assertPermissions = (msg) => msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('MANAGE_CHANNELS') // N
const assertSub = (msg) => {
  console.log(Db.getSubscription(msg.guild))
  if(Db.getSubscription(msg.guild) == 'NONE')
    return 'Renew sub'
  return true
}

const isLiteSub = (msg) => {
  const sub = Db.getSubscription(msg.guild)
  return sub === 'LITE'
}

const isProSub = (msg) => {
  const sub = Db.getSubscription(msg.guild)
  return sub === 'PRO'
}

const isFreeSub = (msg) => {
  const sub = Db.getSubscription(msg.guild)
  return sub === 'FREE'
}

const randomAccountCount = () => { 
    const per = Math.round(Math.random() * 99) + 1 
    if(per <= 5)
        return 3
    else if(per > 5 && per <= 16)
        return 2
    else
        return 1
}

const usePublicStorage = () => {
  return Math.round(Math.random())
} // XD\*

async function addChannel(msg) {
  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
  if(!assertPermissions(msg)) {
    msg.reply('Invalid permissions!')
    return
  }

    if(msg.content == '') {
        msg.reply('Usage: !addchannel <type>')
        return
    }
    console.log(msg.channel.id)
    Db.addChannel(msg.guild.id, msg.channel.id, msg.content)
    msg.reply('Added channel!')
}

async function submitAccounts(msg) {
  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
  
    const split = msg.content.split('\n')
    const type = split.shift(1)

    let accs = []
    for(let i of split) {
        const credentials = i.split(':')
        console.log(credentials)
        if(credentials.length != 2) {
            msg.reply("Invalid credentials: " + i)
            return;
        }
        accs.push({"login": credentials[0], "password": credentials[1]})
    }
    console.log(accs)

    Db.addAccounts(msg.guild.id, type, accs)
    msg.reply('Accounts submitted!')
    msg.delete()
}

async function submitAccountsPublic(msg) {
  /*if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }*/
  const split = msg.content.split('\n')
    const type = split.shift(1)

    let accs = []
    for(let i of split) {
        const credentials = i.split(':')
        console.log(credentials)
        if(credentials.length != 2) {
            msg.reply("Invalid credentials: " + i)
            return;
        }
        accs.push({"login": credentials[0], "password": credentials[1]})
    }
    console.log(accs)

    Db.addAccounts('global', type, accs)
    msg.reply('Accounts submitted!')
    msg.delete()
}

let dupa
const animate = async function(umsg, msg, str, seccs) {
  let state = 0
  dupa = new TaskTimer().add({
    id: msg.author.id,
    tickInterval: 1,
    totalRuns: 4,
    async callback(task) {
      console.log(state)
      if(state == 3) {
        console.log('ddd', state)
        try {
          const embed = {
            title: 'Your account:',
            description: str,
            color: 0x4c4cff,
            footer: {
              icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
              text: 'AccountBot by Wandal',
            },
            author: {
              name: 'AccountBot',
              icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
            },
            fields: seccs
          };
          await umsg.author.send({ embed });
        } catch (err) {
          throw (err);
        }
        msg.edit('Account was sent')
      }
      else  {
        let rv = ''
        switch(state) {
          case 0: rv = '<:one:665865229389004810>'; break
          case 1: rv = '<:two:665865229389004810>'; break
          case 2: rv = '<:three:665865229389004810>'; break
          default: break
        }
        msg.edit(rv)
      }
      state++
    }
  }).start()
}



async function generateAccount(msg) {
  if(usePublicStorage() == 1 && isProSub(msg)) {
    generateAccountPublic(msg)
    return
  }

  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
    if(msg.content == '') {
        msg.reply('Usage: !generate <type>')
        return
    }

    if(!Db.checkPermissions(msg.guild.id, msg.channel.id, msg.content)) {
      msg.reply('You cannot use this command on this channel')
      return
    }


    let acc = []
    let seccs = []
    let str = ''
    const count = randomAccountCount()
    for(let i = 0; i < count; i++)
        acc.push(Db.getAccount(msg.guild.id, msg.content))
    console.log('acc', acc)
    if(typeof(acc[0]) === 'string')
        str = acc[0]
    else {
        str = 'Count: ' + '**' + acc.length + '**'
        for(let i = 0; i < acc.length; i++)
            seccs.push({'name': 'Account ' + (i + 1), 'value': 'Login: **' + acc[i]['login'] + '**' + '\n' + 'Password: **' + acc[i]['password'] + '**' })
    }
    // const str = typeof(acc) == 'string' ? acc : 'Login: **' + acc['login'] + '**' + '\n' + 'Password: **' + acc['password'] + '**' 
        
    msg.channel.send('Please wait...').then((selfmsg) => animate(msg, selfmsg, str, seccs)).catch((err) => { throw err })

}

async function generateAccountPublic(msg) {
  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
    if(msg.content == '') {
      msg.reply('Usage: !generate <type>')
      return
    }

    let acc = []
    let seccs = []
    let str = ''
    const count = randomAccountCount()
    for(let i = 0; i < count; i++)
        acc.push(Db.getAccount('global', msg.content))
    console.log('acc', acc)
    if(typeof(acc[0]) === 'string')
        str = acc[0]
    else {
        str = 'Count: ' + '**' + acc.length + '**'
        for(let i = 0; i < acc.length; i++)
            seccs.push({'name': 'Account ' + (i + 1), 'value': 'Login: **' + acc[i]['login'] + '**' + '\n' + 'Password: **' + acc[i]['password'] + '**' })
    }
    // const str = typeof(acc) == 'string' ? acc : 'Login: **' + acc['login'] + '**' + '\n' + 'Password: **' + acc['password'] + '**' 
        
    msg.channel.send('Please wait...').then((selfmsg) => animate(msg, selfmsg, str, seccs)).catch((err) => { throw err })
}

async function stock(msg) {
  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
    const fieldList = Db.getStock(msg.guild.id)
    let str = ''
    for(let field of fieldList)
        str += field['type'] + ': ' + field['amount'] + '\n'

    try {
        const embed = {
          title: 'Server\'s stock:',
          description: str,
          color: 0x4c4cff,
          footer: {
            icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
            text: 'AccountBot by Wandal',
          },
          author: {
            name: 'AccountBot',
            icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
          },
        };
        await msg.channel.send({ embed });
      } catch (err) {
        throw (err);
    }  
}

async function stockPublic(msg) {
  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
    const fieldList = Db.getStock('global')
    let str = ''
    for(let field of fieldList)
        str += field['type'] + ': ' + field['amount'] + '\n'

    try {
        const embed = {
            title: 'Public stock:',
            description: str,
            color: 0x4c4cff,
            footer: {
            icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
            text: 'AccountBot by Wandal',
            },
            author: {
            name: 'AccountBot',
            icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
            },
        };
        await msg.channel.send({ embed });
        } catch (err) {
        throw (err);
    }    
}

async function unknownCommand(msg) {
    await msg.reply('Unkown command! Use !help for command list')
}

async function help(msg) {
    try {
        const embed = {
          title: 'AccountBot commands:',
          description: '- !help (All commands)\n- !stock / stockpub (Show accounts count)\n- !gen / genpub <type> (Generate account)\n- !add / addpub\n- !addchannel <type> (Add generating account type on some channel)\n- !removechannel (Remove entire channel permissions)\n- !removepermission (Remove single permission from channel)\n\nPublic storage feature versions have pub suffix\n\nAccount data format:\n<ServiceName\nLogin:Password\nLogin:Password...> \n**Last update: Add public storage**',
          color: 0x4c4cff,
          footer: {
            icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
            text: 'AccountBot by Wandal',
          },
          author: {
            name: 'AccountBot',
            icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
          },
        };
        await msg.channel.send({ embed });
      } catch (err) {
        throw (err);
      }
}

async function removeChannel(msg) {
  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
  if(!assertPermissions(msg)) {
    msg.reply('Invalid permissions!')
    return
  }
    Db.removeChannel(msg.guild.id, msg.channel.id)
    msg.reply('Removed channel!')
}

async function removePermission(msg) {
  if(assertSub(msg) !== true) {
    msg.reply('Renew sub')
    return
  }
  if(!assertPermissions(msg)) {
    msg.reply('Invalid permissions!')
    return
  }
    if(msg.content == '') {
        msg.reply('Usage: !removepermission <type>')
        return
    }
    Db.removePermission(msg.guild.id, msg.channel.id, msg.content)
    msg.reply('Removed permission' + msg.content + '!')
}

async function setSub(owner, msg) {
  console.log(owner.indexOf(msg.author.id) >= 0)
  console.log(owner)
  if(!(owner.indexOf(msg.author.id) >= 0)) {
    msg.reply('Not enough permissions')
    return
  }
  if(msg.content == '') {
    msg.reply('Usage: !setsub <type>')
    return
  }
  Db.setSubscription(msg.guild.id, msg.content.toLowerCase())
  msg.reply('Sub given')
}

module.exports.handleMessage = async function(owner, prefix, msg) {
    if(!msg.content.startsWith(prefix))
        return
    const cmd = msg.content.substr(prefix.length).split(' ')[0]
    msg.content = msg.content.substr(prefix.length + cmd.length + 1)
    console.log(msg.content)
    console.log(cmd)

    switch(cmd) {
        case 'setsub': await setSub(owner, msg); break;
        case 'addchannel': await addChannel(msg); break;        
        case 'removechannel': await removeChannel(msg); break;
        case 'removepermission': await removePermission(msg); break;
        case 'add': await submitAccounts(msg); break;
        case 'addpub': await submitAccountsPublic(msg); break;
        case 'gen': await generateAccount(msg); break;
        // case 'genpub': await generateAccountPublic(msg); break;
        case 'stock': await stock(msg); break;
        case 'stockpub': await stockPublic(msg); break;
        case 'help': await help(msg); break;

        default: await unknownCommand(msg); break;
    }
}

module.exports.handleJoin = async function(member) {
  if(member.guild.id !== '641683082138615808')
    return

  let acc = []
  let seccs = []
  let str = ''
  const count = randomAccountCount()
  for(let i = 0; i < count; i++)
      acc.push(Db.getAccount(msg.guild.id, msg.content))
  console.log('acc', acc)
  if(typeof(acc[0]) === 'string')
      str = acc[0]
  else {
      str = 'Count: ' + '**' + acc.length + '**'
      for(let i = 0; i < acc.length; i++)
          seccs.push({'name': 'Account ' + (i + 1), 'value': 'Login: **' + acc[i]['login'] + '**' + '\n' + 'Password: **' + acc[i]['password'] + '**' })
  }
  // const str = typeof(acc) == 'string' ? acc : 'Login: **' + acc['login'] + '**' + '\n' + 'Password: **' + acc['password'] + '**' 
    const embed = {
      title: 'Your account:',
      description: str,
      color: 0x4c4cff,
      footer: {
        icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
        text: 'AccountBot by Wandal',
      },
      author: {
        name: 'AccountBot',
        icon_url: 'https://cdn.discordapp.com/attachments/658690980035297280/661888718432632833/image0.jpg',
      },
      fields: seccs
    };

  member.createDM().then((chan) => { chan.send(embed) }).catch((err) => { throw err })
}

module.exports.guildCreate = async function(guild) {
  if(!Db.hadPremium(guild)) {
    Db.setPremiumFlag(guild)
    Db.setSubscription(guild, 'free')
  } else {
    Db.setSubscription(guild, 'none')
  }
}