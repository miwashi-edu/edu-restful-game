const Router = require('express').Router();
const {npcs} = require('./npc');

const {
    validateAndMovePlayer,
    obstacles,
    groundTiles,
    skyTiles,
    getPlayer,
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