const Router = require('express').Router();
const {npcs} = require('./npc');

const {
    players,
    obstacles,
    groundTiles,
    skyTiles,
    getPlayer,
    validateAndMovePlayer,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
} = require('./world');

Router.get('/canvas-settings', (req, res) => {
    const canvasSettings = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
    res.json(canvasSettings);
});

Router.post('/get-player', (req, res) => {
    const { uuid } = req.body;
    res.json(getPlayer(uuid));
});

Router.post('/get-players', (req, res) => {
    const { uuid } = req.body;
    const filteredPlayers = {};

    for (const [key, value] of Object.entries(players)) {
        if (key !== uuid) {
            filteredPlayers[key] = value;
        }
    }
    res.json(Object.values(filteredPlayers));
});

Router.get('/npcs', (req, res) => {
    res.json(npcs);
});

Router.post('/validate-move', (req, res) => {
    const { direction, speed, uuid } = req.body;
    const player = getPlayer(uuid);
    const result = validateAndMovePlayer(player, direction, speed);
    res.json(result);
});

Router.get('/floor-tiles', (req, res) => {
    res.json(groundTiles);
});

Router.get('/obstacles', (req, res) => {
    res.json(obstacles);
});

Router.get('/sky-tiles', (req, res) => {
    res.json(skyTiles);
});

module.exports = Router;