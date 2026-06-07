const express = require('express')
const fetch = require('node-fetch')
const { createCanvas, loadImage } = require('@napi-rs/canvas')
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

app.get('/bothAvatars/:donatorId/:raiserId', async (req, res) => {
    try {
        const donatorUrl = await getAvatarUrl(req.params.donatorId)
        const raiserUrl = await getAvatarUrl(req.params.raiserId)
        res.json({ donatorUrl, raiserUrl })
    } catch (err) {
        res.status(500).json({ error: 'Failed' })
    }
})

app.get('/donationcard/:donatorId/:raiserId/:amount/:donatorName/:raiserName', async (req, res) => {
    try {
        const { donatorId, raiserId, amount, donatorName, raiserName } = req.params

        const donatorAvatarUrl = await getAvatarUrl(donatorId)
        const raiserAvatarUrl = await getAvatarUrl(raiserId)

        const width = 600
        const height = 180
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        // Dark background
        ctx.fillStyle = '#1a0000'
        ctx.fillRect(0, 0, width, height)

        // Red gradient banner
        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        gradient.addColorStop(0, '#1a0000')
        gradient.addColorStop(0.3, '#8b0000')
        gradient.addColorStop(0.5, '#cc0000')
        gradient.addColorStop(0.7, '#8b0000')
        gradient.addColorStop(1, '#1a0000')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 20, width, 140)

        // Load avatars
        const donatorImg = await loadImage(donatorAvatarUrl)
        const raiserImg = await loadImage(raiserAvatarUrl)

        const radius = 50
        const centerY = height / 2

        // Donator circle
        ctx.save()
        ctx.beginPath()
        ctx.arc(110, centerY, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(donatorImg, 60, centerY - radius, 100, 100)
        ctx.restore()

        // Donator border
        ctx.beginPath()
        ctx.arc(110, centerY, radius + 3, 0, Math.PI * 2)
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 4
        ctx.stroke()

        // Raiser circle
        ctx.save()
        ctx.beginPath()
        ctx.arc(490, centerY, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(raiserImg, 440, centerY - radius, 100, 100)
        ctx.restore()

        // Raiser border
        ctx.beginPath()
        ctx.arc(490, centerY, radius + 3, 0, Math.PI * 2)
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 4
        ctx.stroke()

        // Amount text
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 34px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(amount + ' Robux', width / 2, centerY - 10)

        // donated to text
        ctx.fillStyle = '#dddddd'
        ctx.font = '20px Arial'
        ctx.fillText('donated to', width / 2, centerY + 20)

        // Donator name
        ctx.fillStyle = '#ffffff'
        ctx.font = '14px Arial'
        ctx.fillText('@' + donatorName, 110, centerY + radius + 20)

        // Raiser name
        ctx.fillText('@' + raiserName, 490, centerY + radius + 20)

        const buffer = canvas.toBuffer('image/png')
        res.setHeader('Content-Type', 'image/png')
        res.send(buffer)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to generate card' })
    }
})

app.listen(process.env.PORT || 3000, () => console.log('Running'))
