const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mogo');


// verificar se 'koi_disposition' e confirmado
function isHabitablePlanet(planet){
    return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    //carrega linha por linha nao espera carregar todo arquivo para usar
    // le os arquivos em bits e bytes
    return new Promise ((resolve,reject) => {
        fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
            .pipe(parse({//transformar os dados de bits para uma lista de jsons
                comment:'#',
                columns: true,
            }))
            .on('data',async (data) => {//data sao os dados do arquivo csv
                if(isHabitablePlanet(data)){//verificar se o planeta e habitavel e inserir na lista
                    savePlanet(data)
                }
            })
            .on('error', (err) => {
                console.log(err)
                reject(err)
            })
            .on('end',async ()=>{
                const countPlanetsFound =(await getAllPlanets()).length
                console.log(`${countPlanetsFound} habitable planets found`)
                resolve();
            });
    })

}

async function getAllPlanets(){
    return await planets.find({},{
        '_id':0,'__v':0
    })
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name
        },{
            keplerName: planet.kepler_name
        },{
            upsert: true
        });// upsert:true se nao encontrar keplerName, sera criado o keplerName se ja existe sera atualizado
    } catch(err) {
        console.error(`Could not save planet ${err}`)
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
}
