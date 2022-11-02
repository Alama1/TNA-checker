const express = require('express')
const fs = require('fs')
const fetch = require('node-fetch')
export {}


class ExpressManager {
    private app: any;
    private express: typeof express;
    private router: typeof express.Router;
    constructor(app) {
        this.app = app
        this.express = express()
        this.router = express.Router()
    }

    initialize() {
        if (!this.app.config.express.enabled) {
            return this.app.log.express('Express disabled in configuration, skipping initialization.')
        }

        this.router.get('/keepAlive', this.keepAlive.bind(this))
        this.router.post('/updateKey', this.updateKey.bind(this))

        this.express.use(express.json(), express.urlencoded({ extended: false }), this.authenticate.bind(this), this.validateBody.bind(this))
        this.express.use('/api', this.router)
        this.express.set('json spaces', 2)

        this.express.listen(this.app.config.express.port, () => {
            this.app.log.express(`API online and is running on http://localhost:${this.app.config.express.port}/api/`)
        })
    }

    async updateKey(request, response) {
        this.app.log.express(`New key request. Body: ${JSON.stringify(request.body)}`)

        const key = request.body.key
        let apiKeyAvailable = await fetch(`https://api.hypixel.net/key?key=${key}`)
        await apiKeyAvailable.json()
        if (await apiKeyAvailable.status === 403) {
            return response.status(422).json({
                success: false,
                response: 'Key is not walid'
            })
        }
        this.app.config.properties.minecraft.api_key = key
        let config = await JSON.parse(fs.readFileSync('./configProd.json', 'utf-8'));
        config.minecraft.api_key = key
        fs.writeFile('./configProd.json', JSON.stringify(config), function writeJSON(err) {
            if (err) return console.log(err);
        });
        return response.status(200).json({
            success: true,
            response: 'Key updated'
        })
    }



    keepAlive(request, response) {
        return response.status(200).json({
            success: true,
            response: 'Still alive'
        })
    }

    authenticate(request, response, next) {
        try {
            next()
        } catch (error) {
            this.app.log.error(error)

            return response.status(500).json({
                success: false,
                reason: 'An internal server error occurred'
            })
        }
    }

    validateBody(request, response, next) {
        try {
            const path = request.path.slice(5)

            switch (path) {
                case 'updateKey':
                    if (this.missing(['key'], request.body)) {
                        return response.status(400).json({
                            success: false,
                            reason: 'Malformed Body'
                        })
                    }
                    next()
                    break

                case 'keepAlive':
                    next()
                    break

                case 'override':
                    if (this.missing(['message'], request.body)) {
                        return response.status(400).json({
                            success: false,
                            reason: 'Malformed Body'
                        })
                    }
                    next()
                    break

                case 'mute':
                    if (this.missing(['username', 'duration'], request.body)) {
                        return response.status(400).json({
                            success: false,
                            reason: 'Malformed Body'
                        })
                    }
                    break

                default:
                    if (this.missing(['username'], request.body)) {
                        return response.status(400).json({
                            success: false,
                            reason: 'Malformed Body'
                        })
                    }
                    next()
            }
        } catch (error) {
            this.app.log.error(error)

            return response.status(500).json({
                success: false,
                reason: 'An internal server error occurred'
            })
        }
    }

    missing(array, object) {
        try {
            let missing = false

            array.forEach(element => {
                if (!object[element]) missing = true
            })

            return missing
        } catch (error) {
            return true
        }
    }

    override(request, response) {
        try {
            if (this.app.minecraft.bot?.player) {
                return response.status(200).json({
                    success: true
                })
            }
            return response.status(409).json({
                success: false,
                reason: 'Minecraft client is unavailable at this time'
            })
        } catch (error) {
            this.app.log.error(error)

            return response.status(500).json({
                success: false,
                reason: 'An internal server error occurred'
            })
        }
    }
}

module.exports = ExpressManager
