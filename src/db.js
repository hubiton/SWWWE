const _ = require('underscore')
const fs = require('fs')
const path = require('path')

let Accounts = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../db/accounts.json')))
let Channels = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../db/channels.json')))

/*
ddd
*/

const monthByNow = function() {
    // Get a date object for the current time
    var d = new Date();

    // Set it to one month ago
    d.setMonth(d.getMonth() + 1);

    // Zero the hours
    d.setHours(0, 0, 0);

    // Zero the milliseconds
    d.setMilliseconds(0);

    // Get the time value in milliseconds and convert to seconds
    return d/1000|0 ;
}

const dayByNow = function() {
        // Get a date object for the current time
        var d = new Date();
        
        // Set it to one month ago
        d.setDate(d.getDate() + 1);
    
        // Zero the hours
       //  *d// .setHours(0, 0, 0);
    
        // Zero the milliseconds
        d.setMilliseconds(0);
    
        // Get the time value in milliseconds and convert to seconds
        return d/1000|0 ;
} /// y...yy

const actualDate = () => new Date() / 1000 | 0 

const ensureGuildExistsChannel = (guild) => { if(Channels[guild] === undefined) Channels[guild] = [] }
const ensureGuildAndChannelExist = (guild, id) => { ensureGuildExistsChannel(guild); if(Channels[guild][id] === undefined) Channels[guild][id] = [] }
const ensureGuildExistsAccount = (guild) => { if(Accounts[guild] === undefined) Accounts[guild] = [] }
const ensureGuildAndTypeExist = (guild, type) => { ensureGuildExistsAccount(guild); if(Accounts[guild][type] === undefined) Accounts[guild][type] = [] }
const ensureGuildAndSubExist = (guild) => { ensureGuildExistsChannel(guild); if(Channels[guild]['sub'] === undefined) Channels[guild]['sub'] = 'FREE' } // Ac
const ensureGuildAndExpirationDateOfSubExist = (guild) => { ensureGuildExistsChannel(); if(Channels[guild]['expiresAt'] === undefined ) Channels[guild]['expiresAt'] =  monthByNow()}//Java*
const ensureGuildAndUsedFlagExist = (guild) => { ensureGuildExistsChannel(guild); if(Channels[guild]['hadTrial'] === undefined) Channels[guild]['hadTrial'] = true} // s - 
const ensureGuildAndDailyQuotaExist = (guild) => { ensureGuildExistsChannel(guild); if(Channels[guild]['dailyQuota'] === undefined ) { Channels[guild]['dailyQuota'] = 0; Channels[guild]['quotaReset'] = 0 }} // i

const setExpirationDateTime = (guild) => { ensureGuildExistsChannel(); Channels[guild]['expiresAt'] =  monthByNow() }

const finalizeTransaction = (filename, json) => { fs.writeFileSync(path.resolve(__dirname, '../db/' + filename + '.json'), JSON.stringify(json, 0, 4)) }

module.exports.addChannel = function(guild, id, type) {
    ensureGuildAndChannelExist(guild, id)
    Channels[guild][id].push(type.toLowerCase())
    finalizeTransaction('channels', Channels)

    console.log(Channels)
}

module.exports.removeChannel = function(guild, id) {
    console.log('rmchnl', Channels[guild])

    ensureGuildExistsChannel(guild)
    Channels[guild] = _.without(Channels[guild], id)
    finalizeTransaction('channels', Channels)
    
    console.log(Channels)
}

module.exports.removePermission = function(guild, id, type) {
    ensureGuildAndChannelExist(guild, id)
    Channels[guild][id] = _.without(Channels[guild][id], type)
    finalizeTransaction('channels', Channels)

    console.log(guild, id)
    console.log(Channels)
}

module.exports.checkPermissions = function(guild, id, type) {
    ensureGuildAndChannelExist(guild, id)
    return Channels[guild][id].includes(type.toLowerCase())
}

module.exports.addAccounts = function(guild, type, accs) {
    ensureGuildAndTypeExist(guild, type)
    let obj = Accounts[guild].filter((data) => { return data['type'] == type })
    console.log('dupa', obj)
    if(obj.length == 0)
        Accounts[guild].push({"type": type, "accounts": accs})
    else 
        obj[0]['accounts'] = obj[0]['accounts'].concat(accs)
    finalizeTransaction('accounts', Accounts)

    console.log(Accounts[guild].filter((data) => { return data['type'] == type })[0])
}

module.exports.getAccount = function(guild, type) {
    if(guild == 'global' && this.getSubscription(guild) != 'PRO')
        return 'Pro sub required'
        
    console.log(Accounts)
    const getType = (type) => { return Accounts[guild].filter((data) => { 
        if(data['type'].toLowerCase() == type.toLowerCase())
            type = data['type']
        return data['type'] == type 
    })} 

    console.log(getType(type))

    if(Accounts[guild] === undefined || getType(type).length == 0 || getType(type)[0]['accounts'].length == 0)
        return 'No account left'
    const ret = getType(type)[0]['accounts'].shift(1)
    if(guild == 'global') { // }
        ensureGuildAndDailyQuotaExist(guild)
        Channels[guild]['dailyQuota'] += 1
        Channels[guild]['quotaReset'] = dayByNow()
        console.log('DupskoCzarne')
    }
    console.log(Channels)
    finalizeTransaction('accounts', Accounts)
    return ret
}

module.exports.getStock = function(guild) {
    let arr = []
    for(let i of Accounts[guild])
        arr.push({"type": i["type"], "amount": i["accounts"].length})
    return arr
}

module.exports.getStockGlobal = function() {
    return getStock('global')
}

module.exports.getSubscription = function(guild) {
    ensureGuildAndSubExist(guild)
    const sub = Channels[guild]['sub']
    if(Channels[guild]['expiresAt'] < actualDate())
        this.setSubscription(guild, 'none')
    return sub
}

module.exports.setSubscription = function(guild, subType) {
    ensureGuildAndSubExist(guild)
    Channels[guild]['sub'] = subType.toUpperCase()
    setExpirationDateTime(guild)
    finalizeTransaction('channels', Channels)
    console.log(Channels)
}

module.exports.hadPremium = function(guild) {
    ensureGuildExistsChannel(guild)
    return Channels[guild]['hadTrial'] === undefined// G
}

module.exports.setPremiumFlag = function(guild) {
    ensureGuildAndUsedFlagExist(guild)
    finalizeTransaction('channels', Channels)
}

module.exports.getDailyQuota = function(guild) {
    ensureGuildAndDailyQuotaExist(guild)
    return Channels[guild]['dailyQuota'] // ir
}

// module.exports