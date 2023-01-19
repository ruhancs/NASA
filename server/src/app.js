const express = require('express');
const patch = require('path')
const cors = require('cors');
const morgan = require('morgan')

const planetsRouter = require('./routes/planets/planets.router');
const launchesRouter = require('./routes/launches/launches.router');

const api = require('./routes/api')

const app = express();

// permitir acesso de urls diferentes fazer get request utiliza cors
// permissao para o lado client port 3000 acessar o lado server
app.use(cors({
    origin: 'http://localhost:3000'
}));

// controle de logs no servidor
app.use(morgan('combined'))

app.use(express.json());
// para utilizar os arquivos do frontend em react que estao na pasta public
app.use(express.static(patch.join(__dirname,'..','public')))

app.use('/v1',api)

app.use('/planets',planetsRouter);
app.use('/launches',launchesRouter);

// para carregar a pagina root "/" sem precisar selecionar launch
app.get('/*',(req,res)=>{
    res.sendFile(patch.join(__dirname,'..','public','index.html'))
})

module.exports = app;