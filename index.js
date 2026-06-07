const express = require('express')
const fetch = require('node-fetch')
const Jimp = require('jimp')
const app = express()

async function getAvatarUrl(userId) {
    const response = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`
    )
    const data = await response.json()
    return data.data[0].imageUrl
}

app.get('/avatar/:userId', async (req, res) => {
    try {
        const imageUrl = await getAvatarUrl(req.params.userId)
        res.json({ imageUrl })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch avatar' })
    }
})

app.get('/donationcard/:donatorId/:raiserId/:amount/:donatorName/:raiserName', async (req, res) => {
    try {
        const { donatorId, raiserId, amount, donatorName, raiserName } = req.params

        const donatorAvatarUrl = await getAvatarUrl(donatorId)
        const raiserAvatarUrl = await getAvatarUrl(raiserId)

        const width = 600
        const height = 200

        const card = new Jimp(width, height, 0x1a0000ff)

        const donatorImg = await Jimp.read(donatorAvatarUrl)
        const raiserImg = await Jimp.read(raiserAvatarUrl)

        donatorImg.resize(100, 100).circle()
        raiserImg.resize(100, 100).circle()

        card.composite(donatorImg, 60, 50)
        card.composite(raiserImg, 440, 50)

        const buffer = await card.getBufferAsync(Jimp.MIME_PNG)
        res.setHeader('Content-Type', 'image/png')
        res.send(buffer)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to generate card' })
    }
})

app.listen(3000, () => console.log('Running on port 3000'))


