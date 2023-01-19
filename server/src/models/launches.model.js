const axios = require('axios');// para fazer requisiçoes http e https na API spaceX

const launchesDB = require('./launches.mongo');
const planetsDB = require('./planets.mogo');

const launches = new Map()

const DEFAULT_FLIGHT_NUMBER = 100

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches(){
    console.log('Downloading launch data');
    // requisiçao na API
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,// pegar todos os dados
            populate: [// inserir o nome do foguete e os patrocinadores nas respostas
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        custumers: 1
                    }
                },
            ]
        }
    });

    if (response.status !== 200){
        console.log('Error Downloading launch data');
        throw new Error('Launch download fail')
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs ){
        const payloads = launchDoc['payloads'];
        const custumers = payloads.flatMap((payload) => {
            return payload['custumers']
        });
        const launch = {
            flightNumber:launchDoc['flight_number'],
            mission:launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            custumers: custumers
        }
        console.log(`${launch.flightNumber} ${launch.mission}`)

        await saveLaunch(launch);
    }
}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({// verificar se os dados da api estao no DB
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    })
    if (firstLaunch){
        console.log('Launch data already loaded')
        
    }else {
        await populateLaunches()
    }
    
}

async function findLaunch(filter){
    return await launchesDB.findOne(filter)
}

async function existsLaunchWithId(launchId){
    return await findLaunch({flightNumber:launchId}) // verificar se em launches existe o id
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDB
        .findOne()
        .sort('-flightNumber');// pegar o maior flightNumber
    if(!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }
    return latestLaunch.flightNumber;
}

// transforma o iteravel em um array com todos valores
async function getAllLaunches(skip,limit) {
    return await launchesDB
        .find({},{'_id':0,'__v':0})
        .sort({ flightNumber: 1 })// organizar por flightNumber em ordem crescente 
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {
    await launchesDB.findOneAndUpdate({
        flightNumber:launch.flightNumber
    },launch,{
        upsert:true
    })
}

async function scheduleNewLaunch(launch){
    const planet = await planetsDB.findOne({keplerName:launch.target});
    if(!planet){
        throw new Error('No matching planet found')
    }    
    const latestFlightNumber = await getLatestFlightNumber() + 1
    const newLaunch = Object.assign(launch, {
            success:true,
            upcoming:true,
            custumer:['NASA'],
            flightNumber: latestFlightNumber,        
    });
    await saveLaunch(newLaunch) 
}

async function abortLaunchById(launchId){
    const aborted = await launchesDB.updateOne({
        flightNumber:launchId
    },{
        upcoming: false,
        success: false,
    });
    return aborted.modifiedCount === 1
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
}
