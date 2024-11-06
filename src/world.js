const { v4 } = require('uuid');

const GRID_SIZE = process.env.GRID_SIZE || 50;
const GRID_COLS = process.env.GRID_COLS || 16;
const GRID_ROWS = process.env.GRID_ROWS || 12;
const CANVAS_WIDTH = GRID_SIZE * GRID_COLS;
const CANVAS_HEIGHT = GRID_SIZE * GRID_ROWS;

let obstacles = generateLevelObjects('middle', 15);
const groundTiles = generateLevelObjects('floor', 20);
const skyTiles = generateLevelObjects('sky', 10);

const players = {};
function getPlayer(uuid){
    if(uuid) {
        const player = players[uuid];
        if (player) {
            return player;
        }
    }
    const newPlayer = {
        uuid: v4(),
        x: 100,
        y: 100,
        name: 'Nisse',
        size: GRID_SIZE
    };
    players[newPlayer.uuid] = newPlayer;
    return newPlayer;
}

function generateLevelObjects(type, numObjects) {
    const objects = [];
    for (let i = 0; i < numObjects; i++) {
        objects.push({
            x: Math.floor(Math.random() * GRID_COLS) * GRID_SIZE,
            y: Math.floor(Math.random() * GRID_ROWS) * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE,
            type: type
        });
    }
    return objects;
}

function validateAndMovePlayer(player, direction, speed) {
    let moveDistance;
    switch (speed) {
        case 'slow':
            moveDistance = 1;
            break;
        case 'fast':
            moveDistance = GRID_SIZE;
            break;
        default:
            moveDistance = GRID_SIZE / 4;
    }
    let newX = player.x;
    let newY = player.y;

    switch (direction) {
        case 'up':
            newY -= moveDistance;
            break;
        case 'down':
            newY += moveDistance;
            break;
        case 'left':
            newX -= moveDistance;
            break;
        case 'right':
            newX += moveDistance;
            break;
    }
    return validateAndUpdatePosition(player, newX, newY);
}

function validateAndUpdatePosition(player, newX, newY) {
    if (isValidMove(player, newX, newY)) {
        const collisions = obstacles.filter(obj => checkCollision(player,newX, newY, obj));
        if (collisions.length == 0) {
            player.x = newX;
            player.y = newY;
            return { allowed: true, x: player.x, y: player.y };
        }
    }
    return { allowed: false, x: player.x, y: player.y };
}

function checkCollision(player, x, y, obj) {
    return (
        x < obj.x + obj.width &&
        x + player.size > obj.x &&
        y < obj.y + obj.height &&
        y + player.size > obj.y
    );
}


function isValidMove(player, x, y) {
    return (
        x >= 0 &&  x + player.size <= CANVAS_WIDTH && y >= 0 && y + player.size <= CANVAS_HEIGHT
    );
}

module.exports = {
    getPlayer
    , obstacles
    , groundTiles
    , skyTiles
    ,validateAndMovePlayer
    ,validateAndUpdatePosition
    ,CANVAS_WIDTH
    ,CANVAS_HEIGHT
}