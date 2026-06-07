const express = require('express')
const fetch = require('node-fetch')
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

app.listen(process.env.PORT || 3000, () => console.log('Running'))


