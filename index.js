const express = require('express')
const fetch = require('node-fetch')
const app = express()

app.get('/avatar/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const response = await fetch(
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`
        )
        const data = await response.json()
        const imageUrl = data.data[0].imageUrl
        res.json({ imageUrl })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch avatar' })
    }
})

app.listen(3000, () => console.log('Running on port 3000'))
