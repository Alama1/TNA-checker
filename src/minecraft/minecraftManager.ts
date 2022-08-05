const Application = require('../Application')
const config = require('../../configProd.json')

class MinecraftManager {
    private app: typeof Application;
    private config: typeof config;

    constructor(app) {
        this.app = app
    }

    connect() {
        this.config = this.app.config.properties
    }

    async getMinecraftUUID(username) {
        return await this.fetchWithApiKey(`https://api.mojang.com/users/profiles/minecraft/${username}`)
            .then(async r => await r.json())
            .catch(e => this.app.log.error(e.message))
    }

    async getMinecraftNameByUUID(UUID) {
        const nameAndID = await fetch(`https://api.mojang.com/user/profile/${UUID}`)
            .then(r => r.json())
        return nameAndID.name
    }

    async fetchWithApiKey(link) {
        const response = await fetch(link, {
            method: 'GET',
            headers: {
                'Authorization': this.config.minecraft.api_key,
                'Content-type': 'json',
                'API-Key': this.config.minecraft.api_key
            }
        })
        return response
    }

    async getGuild() {
        return this.fetchWithApiKey('https://api.hypixel.net/guild?id=602915918ea8c9cb50ede5fd')
            .then(async r => await r.json())
    }

    async getSenitherProfileWithUUID(uuid) {
        return this.fetchWithApiKey(`https://hypixel-api.senither.com/v1/profiles/${uuid}/weight`)
            .then(async r => await r.json())
            .catch(e => this.app.log.error(e.message))
    }

    async getSenitherProfile(username) {
        const uuid = await this.getMinecraftUUID(username)
        if (!uuid) return false
        return this.fetchWithApiKey(`https://hypixel-api.senither.com/v1/profiles/${uuid.id}/weight`)
            .then(async r => await r.json())
            .catch(e => this.app.log.error(e.message))
    }

    async getSlothpixelProfile(username, profile = '') {
        const uuid = await this.getMinecraftUUID(username)
        if (!uuid) return false
        let profiles = await this.fetchWithApiKey(`https://api.slothpixel.me/api/skyblock/profile/${username}/${profile}`)
            .then(async r => await r.json())
            .catch(e => this.app.log.error(e.message))
        if (!profiles.hasOwnProperty('members')) return false
        if (!profiles.members.hasOwnProperty(uuid.id)) return false
        return profiles.members[uuid.id]
    }

    async checkApiKeyAvailability(): Promise<{ status: number }> {
        const isAvailable = await this.fetchWithApiKey(`https://api.hypixel.net/key`)
            .catch(e => this.app.log.error(e.message))
        return {status: isAvailable.status}
    }

}

export {}

module.exports = MinecraftManager
