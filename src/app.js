const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require('uuidv4') // const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());


// traz infos no console  quando rotas são utilizadas
function logRequest(request, response, next) {
    const { method, url } = request;
    const logLabel = `[${method.toUpperCase()}] ${url}`;
    console.time(logLabel);

    next();
    console.timeEnd(logLabel);
}

app.use(logRequest);
app.use('/repositories/:id/like', validateProjectId);


//valida Id do repositorio
function validateProjectId(request, response, next) {
    //pegar o ide dos parametros que vem na rota
    const { id } = request.params;

    //se Id se for válido então dá msg de erro
    if (!isUuid(id)) {
        return response.status(400).json({ error: 'Invalid Project Id.' });
    }
    return next();
}

const repositories = [];

//List repositories
app.get("/repositories", (request, response) => {

    return response.json(repositories);
});

//Create repositories
app.post("/repositories", (request, response) => {
    const { title, url, techs } = request.body;
    const repository = { id: uuid(), title, url, techs, likes: 0 };
    repositories.push(repository);

    return response.json(repository);
});

//Update repositories
app.put("/repositories/:id", (request, response) => {
    const { id } = request.params;
    const { title, url, techs } = request.body;

    const repositoryIndex = repositories.findIndex(repository => repository.id == id);

    if (repositoryIndex < 0) {
        return response.status(400).json({ error: `Sorry! Repository not found` })
    }

    //Create object and preserv they previus information
    const repository = repositories[repositoryIndex];
    Object.assign(repository, { title, url, techs });

    repositories[repositoryIndex] = repository;
    return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
    const { id } = request.params;
    const repositoryIndex = repositories.findIndex(repository => repository.id == id);

    if (repositoryIndex < 0) {
        return response.status(400).json({ error: `Sorry! Repository not found` })
    }
    repositories.splice(repositoryIndex, 1);
    return response.status(204).send();

});
//Create Like
app.post("/repositories/:id/like", (request, response) => {
    const { id } = request.params;


    const repositoryIndex = repositories.findIndex(repository => repository.id == id);

    if (repositoryIndex < 0) {
        return response.status(400).json({ error: `Sorry! Repository not found` })
    }
    //Like more project like this =) 
    const repository = repositories[repositoryIndex];
    repository.likes++;
    repositories[repositoryIndex] = repository;

    return response.json(repository);

});

module.exports = app;