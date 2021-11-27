const express = require('express')
const router = new express.Router()
const News = require('../models/news')
const auth = require('../middelware/auth')
const multer = require('multer')

/////////////////////////////////////////// post news
router.post('/news', auth, async(req, res) => {
    try {
        const news = new News({...req.body,owner:req.reporter._id})
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e)
    }
})
////////////////////////////////////////// Get all news
router.get('/news',auth, async(req, res) => {
    try {
        await req.reporter.populate('news')
        res.status(200).send(req.reporter.news)
    }
    catch(e){
        res.status(500).send(e)
    }
})

////////////////////////////////////////// Get news by id 
router.get('/news/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        if (!news) {
            return res.status(404).send('Cannot find news ')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e)
    }
})
/////////////////////////////////////////// update 
router.patch('/news/:id',auth ,async (req, res) => {
    try {
        const update = Object.keys(req.body)
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        if(!news){
            return res.status(404).send('Cannot find news')
        }
        update.forEach((el) => news[el] = req.body[el])
        await news.save()
        res.send(news)
    }
    catch (e){
        res.status(400).send(' '+e)
    }
})

/////////////////////////////////////////////////////////////// delete news
router.delete('/news/:id' ,auth, async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOneAndDelete({_id,owner:req.reporter._id})
        if(!news){
            return res.status(404).send('Unable to find news')
        }
        res.status(200).send(news)
    }
    catch (e) {
        res.status(500).send(e)
    }
})
///////////////////////////////////////////////////////////////////// get owner's data

router.get('/ReporterNews/:id',auth ,async (req, res) => {
    try {
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        if (!news) {
            return res.status(404).send('Unable to find news')
        }
        await news.populate('owner')
        res.status(200).send(news.owner)
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

router.post('/newsImage/:id',auth, uploads.single('avatar'),async(req, res) => {
    try {
       const _id = req.params.id
       const news = await News.findById(_id)
        if(!news){
           res.status(404).send('cannot upload image ')
        }
        news.photo = req.file.buffer
        await news.save()
        res.send('Image uploaded Successfully')
    }
    catch (e) {
        res.status(500).send(e)
    }
})
 

module.exports = router