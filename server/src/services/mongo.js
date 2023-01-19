const mongoose = require('mongoose');
const dotenv = require('dotenv');

const MONGO_URL = process.env.DATABASE;

mongoose.connection.once('open',()=>{
    console.log('mongo db connection ready')
})

mongoose.connection.on('err',(err)=>{
    console.error(err)
})

async function mongoConnect(){
    mongoose.set('strictQuery', true)
    await mongoose.connect(MONGO_URL)

}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}