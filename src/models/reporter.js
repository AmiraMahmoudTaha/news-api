const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const reporterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type: String,
        required:true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength:5
    },
    age:{
        type:Number,
        default: 25,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive number')
            }
        }
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isMobilePhone(value, 'ar-EG')) {
                throw new Error('please enter valid phone number');
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required:true
            }
        }
    ],
    picture: {
        type:Buffer
    }
},
    {
        timestamps:true
    }
)

/////////////////////////////////////////////////////// Hash Password
reporterSchema.pre('save', async function (next) {
    const reporter = this
    console.log(reporter)
    if (reporter.isModified('password')) {
        reporter.password = await bcrypt.hash(reporter.password, 8)  
    }
 next()
})


///////////////////////////////////////// login (findByCredentials)


reporterSchema.statics.findByCredentials = async (email, password) => {
    const reporter = await Reporter.findOne({ email: email })
    if (!reporter) {
        throw new Error('Please Sign up')
    }
    console.log(reporter)
    const isMatch = await bcrypt.compare(password, reporter.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return reporter 
}

///////////////////////////////////////////////////////////////// generateToken
reporterSchema.methods.generateToken = async function () {
    const reporter = this
    const token = jwt.sign({ _id: reporter._id.toString() },'news-api')
    reporter.tokens = reporter.tokens.concat({token})
    await reporter.save()
    return token
}
//////////////////////////////////////////////////////// Hide data

reporterSchema.methods.toJSON = function () {
    const reporter = this
    
    const reporterObject = reporter.toObject()
    delete reporterObject.password
    delete reporterObject.tokens

    return reporterObject
}
//////////////////////////////////////////////////////// Relation with news

reporterSchema.virtual('news', {
    ref: 'News',
    localField: '_id',
    foreignField:'owner'
})



const Reporter = mongoose.model('Reporter',reporterSchema)
module.exports = Reporter