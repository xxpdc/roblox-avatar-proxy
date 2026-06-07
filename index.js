const express = require('express')
const fetch = require('node-fetch')
const { createCanvas, loadImage } = require('canvas')
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

        const donatorImage = await loadImage(donatorAvatarUrl)
        const raiserImage = await loadImage(raiserAvatarUrl)

        const width = 600
        const height = 200
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        // Dark red background
        ctx.fillStyle = '#1a0000'
        ctx.fillRect(0, 0, width, height)

        // Red gradient center banner
        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        gradient.addColorStop(0, '#1a0000')
        gradient.addColorStop(0.3, '#8b0000')
        gradient.addColorStop(0.5, '#cc0000')
        gradient.addColorStop(0.7, '#8b0000')
        gradient.addColorStop(1, '#1a0000')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 30, width, 140)

        // Donator avatar circle (left)
        const leftX = 110
        const centerY = height / 2
        const radius = 55

        ctx.save()
        ctx.beginPath()
        ctx.arc(leftX, centerY, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(donatorImage, leftX - radius, centerY - radius, radius * 2, radius * 2)
        ctx.restore()

        // Donator avatar border
        ctx.beginPath()
        ctx.arc(leftX, centerY, radius + 3, 0, Math.PI * 2)
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 4
        ctx.stroke()

        // Raiser avatar circle (right)
        const rightX = width - 110

        ctx.save()
        ctx.beginPath()
        ctx.arc(rightX, centerY, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(raiserImage, rightX - radius, centerY - radius, radius * 2, radius * 2)
        ctx.restore()

        // Raiser avatar border
        ctx.beginPath()
        ctx.arc(rightX, centerY, radius + 3, 0, Math.PI * 2)
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 4
        ctx.stroke()

        // Amount text
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(amount + ' Robux', width / 2, height / 2 - 10)

        // "donated to" text
        ctx.fillStyle = '#dddddd'
        ctx.font = '22px Arial'
        ctx.fillText('donated to', width / 2, height / 2 + 20)

        // Donator name
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px Arial'
        ctx.fillText('@' .. donatorName, leftX, centerY + radius + 20)

        // Raiser name
        ctx.fillText('@' .. raiserName, rightX, centerY + radius + 20)

        res.setHeader('Content-Type', 'image/png')
        canvas.createPNGStream().pipe(res)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to generate card' })
    }
})

app.listen(3000, () => console.log('Running on port 3000'))
