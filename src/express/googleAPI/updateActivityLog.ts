const { google } = require('googleapis')
const fetch = require('node-fetch')
const express = require('express')
export {}

class UpdateActivityLog {
    private express: typeof express;
    constructor(expressManger) {
        this.express = expressManger
    }

    spreadSheetID = '1WsvI8zER8_KH0bY3Aj9ajlGLkVZpS8ZETK-QiNJa5_4'

    async initialize() {
        let apiKeyAvailable = await fetch(`https://api.hypixel.net/key?key=${this.express.app.config.properties.minecraft.api_key}`)
            .then(async r => await r.json())
        if (!apiKeyAvailable.success) {
            this.express.app.log.express('Api unavailable')
            let res = await fetch('https://h.jimmywashere.repl.co/api/apinew')
            if (res.success) {
                this.initialize()
            }
            return
        }
        const date = new Date()
        const guild = await fetch(`https://api.hypixel.net/guild?key=${this.express.app.config.properties.minecraft.api_key}&id=602915918ea8c9cb50ede5fd`)
            .then(async g => await g.json())
        console.log(guild)
        const guildMembers = guild.guild.members
        let nickAndExpMembers = {}

        for (const member of guildMembers) {
            const userNamesHistory = await fetch(`https://api.mojang.com/user/profiles/${member.uuid}/names`)
                .then(async r => await r.json())
                .catch(e => console.error(e))
            if (!userNamesHistory) return
            nickAndExpMembers[userNamesHistory[userNamesHistory.length - 1].name] = member.expHistory
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: './googleSheetsCred.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient()
        const googleSheets = google.sheets({ version: 'v4', auth: client })
        await googleSheets.spreadsheets.get({
            spreadsheetId: this.spreadSheetID,
            ranges: `${date.getMonth() + 1}.${date.getFullYear()}`
        }).catch(async e => {
            if (e.errors[0].message.startsWith('Unable to parse range:')) {
                await this.createNewTab(googleSheets, `${date.getMonth() + 1}.${date.getFullYear()}`)
            }
        })
        const request = {
            spreadsheetId: this.spreadSheetID,
            range: `${date.getMonth() + 1}.${date.getFullYear()}!A3:A`
        }
        const usersInSheet = (await googleSheets.spreadsheets.values.get(request)).data.values
        Object.keys(nickAndExpMembers).forEach((member, index) => {
            setTimeout(() => {
                //if sheet is empty
                if (!usersInSheet) {
                    googleSheets.spreadsheets.values.append({
                        spreadsheetId: this.spreadSheetID,
                        range: `${date.getMonth() + 1}.${date.getFullYear()}!A3:A`,
                        valueInputOption: 'USER_ENTERED',
                        insertDataOption: 'INSERT_ROWS',
                        requestBody: { values: [[member]] }
                    })
                    return
                }
                //if there's some nicks already
                if (!usersInSheet.flat().find(element => element.toLowerCase() === member.toLowerCase())) {
                    googleSheets.spreadsheets.values.append({
                        spreadsheetId: this.spreadSheetID,
                        range: `${date.getMonth() + 1}.${date.getFullYear()}!A3:A`,
                        valueInputOption: 'USER_ENTERED',
                        insertDataOption: 'INSERT_ROWS',
                        requestBody: { values: [[member]] }
                    })
                }
            }, index * 1000)
        })
        setTimeout(async () => {
            const request = {
                spreadsheetId: this.spreadSheetID,
                range: `${date.getMonth() + 1}.${date.getFullYear()}!A3:A`
            }
            const allUsers = (await googleSheets.spreadsheets.values.get(request)).data.values
            allUsers.flat().forEach((user, index) => {
                let userActivity = nickAndExpMembers[user]
                if(!userActivity) return
                const todayExp = userActivity[Object.keys(userActivity)[0]]
                const yesterdayExp = userActivity[Object.keys(userActivity)[1]]
                const threeDaysAgoExp = userActivity[Object.keys(userActivity)[2]]
                const fourDaysAgoExp = userActivity[Object.keys(userActivity)[3]]
                const fiveDaysAgoExp = userActivity[Object.keys(userActivity)[4]]
                const sixDaysAgoExp = userActivity[Object.keys(userActivity)[5]]
                const sevenDaysAgoExp = userActivity[Object.keys(userActivity)[6]]
                const todayDate = Object.keys(userActivity)[0].split('-').slice(-1)[0]
                const yesterdayDate = Object.keys(userActivity)[1].split('-').slice(-1)[0]
                const threeDaysAgoDate = Object.keys(userActivity)[2].split('-').slice(-1)[0]
                const fourDaysAgoDate = Object.keys(userActivity)[3].split('-').slice(-1)[0]
                const fiveDaysAgoDate = Object.keys(userActivity)[4].split('-').slice(-1)[0]
                const sixDaysAgoDate = Object.keys(userActivity)[5].split('-').slice(-1)[0]
                const sevenDaysAgoDate = Object.keys(userActivity)[6].split('-').slice(-1)[0]
                setTimeout(() => {
                    googleSheets.spreadsheets.values.update({
                        spreadsheetId: this.spreadSheetID,
                        range: `${date.getMonth() + 1}.${date.getFullYear()}!${this.intToChar(parseInt(todayDate))}${index + 3}`,
                        requestBody: { values: [[todayExp]]},
                        valueInputOption: 'USER_ENTERED',
                    })
                    if (parseInt(todayDate) !== 1) {
                        googleSheets.spreadsheets.values.update({
                            spreadsheetId: this.spreadSheetID,
                            range: `${date.getMonth() + 1}.${date.getFullYear()}!${this.intToChar(parseInt(yesterdayDate))}${index + 3}`,
                            requestBody: { values: [[yesterdayExp]]},
                            valueInputOption: 'USER_ENTERED',
                        })
                    }
                    if (parseInt(todayDate) > 2) {
                        googleSheets.spreadsheets.values.update({
                            spreadsheetId: this.spreadSheetID,
                            range: `${date.getMonth() + 1}.${date.getFullYear()}!${this.intToChar(parseInt(threeDaysAgoDate))}${index + 3}`,
                            requestBody: { values: [[threeDaysAgoExp]]},
                            valueInputOption: 'USER_ENTERED',
                        })
                    }
                    if (parseInt(todayDate) > 3) {
                        googleSheets.spreadsheets.values.update({
                            spreadsheetId: this.spreadSheetID,
                            range: `${date.getMonth() + 1}.${date.getFullYear()}!${this.intToChar(parseInt(fourDaysAgoDate))}${index + 3}`,
                            requestBody: { values: [[fourDaysAgoExp]]},
                            valueInputOption: 'USER_ENTERED',
                        })
                    }
                    if (parseInt(todayDate) > 4) {
                        googleSheets.spreadsheets.values.update({
                            spreadsheetId: this.spreadSheetID,
                            range: `${date.getMonth() + 1}.${date.getFullYear()}!${this.intToChar(parseInt(fiveDaysAgoDate))}${index + 3}`,
                            requestBody: { values: [[fiveDaysAgoExp]]},
                            valueInputOption: 'USER_ENTERED',
                        })
                    }
                    if (parseInt(todayDate) > 5) {
                        googleSheets.spreadsheets.values.update({
                            spreadsheetId: this.spreadSheetID,
                            range: `${date.getMonth() + 1}.${date.getFullYear()}!${this.intToChar(parseInt(sixDaysAgoDate))}${index + 3}`,
                            requestBody: { values: [[sixDaysAgoExp]]},
                            valueInputOption: 'USER_ENTERED',
                        })
                    }
                    if (parseInt(todayDate) > 6) {
                        googleSheets.spreadsheets.values.update({
                            spreadsheetId: this.spreadSheetID,
                            range: `${date.getMonth() + 1}.${date.getFullYear()}!${this.intToChar(parseInt(sevenDaysAgoDate))}${index + 3}`,
                            requestBody: { values: [[sevenDaysAgoExp]]},
                            valueInputOption: 'USER_ENTERED',
                        })
                    }
                }, index * 11000)
            })
        }, Object.keys(nickAndExpMembers).length * 1000 + 5000)
    }

    async createNewTab(googleSheets, title) {
        const request = {
            'requests': [
                {
                    'duplicateSheet': {
                        'sourceSheetId': 2081310866,
                        'newSheetName': title
                    }
                }
            ]

        }
        return await googleSheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadSheetID,
            requestBody: request
        })
    }
    intToChar(int) {
        const intDate = parseInt(int)
        if (intDate >= 26) {
            switch (intDate) {
                case 26:
                    return "AA"
                case 27:
                    return "AB"
                case 28:
                    return "AC"
                case 29:
                    return "AD"
                case 30:
                    return "AE"
                case 31:
                    return "AF"
                default:
                    return "AG"
            }
        }
        const code = 'A'.charCodeAt(0);
        return String.fromCharCode(code + int);
    }
}

module.exports = UpdateActivityLog
