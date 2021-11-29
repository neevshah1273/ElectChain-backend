module.exports = (req, res, next) => {
    const app_token = req.body.token
    if(!app_token) return res.status(401).send("Access Denied")
    try {
        try {
            const user = (JSON.parse(atob(app_token.split('.')[1])))
            req.user = user
        } catch (err) {
            console.log(err)
            return res.status(400).send("Something went wrong")
        }
        next()
    } catch (err) {
        return res.status(403).send('Invalid Token')
    }
}