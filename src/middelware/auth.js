const jwt = require('jsonwebtoken')
const Reporter = require('../models/reporter')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token, 'news-api')
        const reporter = await Reporter.findOne({_id:decode._id,'tokens.token':token})

        if (!reporter) {
            throw new Error
        }
        req.reporter = reporter
        req.token = token
        
        next()
    }
    catch (e) {
        res.status(401).send({error:'Please authencticate'})
    }
    
}

module.exports = auth