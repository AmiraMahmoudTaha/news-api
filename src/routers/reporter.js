const express = require('express')
const router = new express.Router()
const Reporter = require('../models/reporter')
const auth = require('../middelware/auth')
const multer = require('multer')

/////////////////////////////////////////// post reporters (SignUp)

router.post('/reporters',async (req, res) => {
    try {
        const reporter = new Reporter(req.body)
        const token = await reporter.generateToken()
        await reporter.save()
        res.status(200).send({ reporter, token })
    }
    catch(e){
        res.status(400).send(e)
    } 
})
///////////////////////////////////////////// login

router.post('/reporters/login', async (req, res) => {
    try {
        const reporter = await Reporter.findByCredentials(req.body.email, req.body.password)
        const token = await reporter.generateToken()
        res.status(200).send({ reporter, token })
    }
    catch(e){
        res.status(400).send(e)
    }
    
})

////////////////////////////////////////// Get all reporters
router.get('/reporters',auth,(req,res)=>{
    Reporter.find({}).then((reporters) => {
        res.status(200).send(reporters)
    })
    .catch((e)=>{
        res.status(500).send(e)
    })
})
////////////////////////////////////////////profile

router.get('/profile', auth, async (req, res) => {
    res.send(req.reporter)
})

////////////////////////////////////////// Get reporter by id 
router.get('/reporters/:id', auth,(req, res) => {
    const _id = req.params.id
    Reporter.findById(_id).then((reporter) => {
        if(!reporter){
           return res.status(404).send('Unable to find reporter')
        }
        res.status(200).send(reporter)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})
///////////////////////////////////////////// update 
// router.patch('/reporters/:id', async (req, res) => {
//     try {
//         const _id = req.params.id
//         const reporter = await Reporter.findByIdAndUpdate(_id,req.body,{
//             new: true,
//             runValidators:true
//         })
//         if (!reporter) {
//             return res.status(404).send('No reporter is found')
//         }
//         res.status(200).send(reporter)
//     }
//     catch (e){
//         res.status(400).send(e)
//     }
// })
// router.patch('/reporters/:id', async (req, res) => {
//     try {
//         const updates = Object.keys(req.body)
//         const allowedUpdates = ["name", "password"]
//         var isValid = updates.every((update)=> allowedUpdates.includes(update))
//         if(!isValid){
//             return res.status(400).send('Cannot update')
//         }
//         const _id = req.params.id
//         const reporter = await Reporter.findByIdAndUpdate(_id,req.body,{
//             new: true,
//             runValidators:true
//         })
//         if (!reporter) {
//             return res.status(404).send('reporter is not found')
//         }
//         res.status(200).send(reporter)
//     }
//     catch (e){
//         res.status(400).send(e)
//     }
// })
router.patch('/reporters/:id', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body)
        const allowedUpdates = ["name", "password"]
        var isValid = updates.every((update)=> allowedUpdates.includes(update))
        if(!isValid){
            return res.status(400).send('Cannot update')
        }
        const _id = req.params.id
        const reporter = await Reporter.findById(_id)
        if(!reporter){
            return res.status(404).send('reporter is not found')
        }
        updates.forEach((update)=>reporter[update]=req.body[update])
        await reporter.save()
        res.status(200).send(reporter)
    }
    catch (e){
        res.status(400).send('e'+e)
    }
})

/////////////////////////////////////////////////////////////// delete reporter
router.delete('/reporters/:id' ,auth, async(req,res)=>{
    try{
        const _id = req.params.id
        const reporter = await Reporter.findByIdAndDelete(_id)
        if(!reporter){
            return res.status(404).send('Unable to find reporter')
        }
        res.status(200).send(reporter)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

////////////////////////////////////////////////////////////////// logout
router.delete('/logout', auth, async (req, res) => {
    try {
        req.reporter.tokens = req.reporter.tokens.filter((el) => {
             return el.token !== req.token
        })
        await req.reporter.save()
        res.send('Logout Success')
         
    }
    catch(e) {
        res.status(500).send(e)
    }
})
//////////////////////////////////////////////////////////////////// logout-ALL
router.delete('/logoutAll', auth,async (req, res) => {
    try {
        req.reporter.tokens=[]
        await req.reporter.save()
        res.send('Logout all was done successfully')
    }
    catch (e) {
        res.status(500).send(e)
    }
})
 
///////////////////////////////////////////////////////////////////// upload image

const uploads = multer({
    limits: {
        fileSize:1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            cb(new Error('you must upload images only'))
        }
        cb(null,true)
        
    }
})

router.post('/reporterImage',auth, uploads.single('avatar'),async(req, res) => {
    try {
        req.reporter.picture = req.file.buffer
        await req.reporter.save()
        res.send('Image uploaded Successfully')
    }
    catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router