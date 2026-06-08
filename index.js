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
        const imageUrl = await getAvatarUrl(userId)
        res.redirect(imageUrl)
    } catch (err) {
        res.status(500).json({ error: 'Failed' })
    }
})

app.listen(process.env.PORT || 3000, () => console.log('Running'))
