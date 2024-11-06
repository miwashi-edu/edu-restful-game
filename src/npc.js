const cron = require('node-cron');
const {CANVAS_WIDTH, CANVAS_HEIGHT, validateAndUpdatePosition} = require('./world');

const npcs = [];
let worldTime = 0;

const directions = ['w', 'e', 'n', 's'];
const NPC_SPEED = 2;

function getRandomDirection() {
    return directions[Math.floor(Math.random() * directions.length)];
}

function getNewPosition(x, y, direction) {
    switch (direction) {
        case 'w': return { newX: x - NPC_SPEED, newY: y };
        case 'e': return { newX: x + NPC_SPEED, newY: y };
        case 'n': return { newX: x, newY: y - NPC_SPEED };
        case 's': return { newX: x, newY: y + NPC_SPEED };
        default: return { newX: x, newY: y };
    }
}

function updateNPC(npc) {
    let currentDirection = npc.direction || getRandomDirection();
    let {newX, newY} = getNewPosition(npc.x, npc.y, currentDirection);
    let result = validateAndUpdatePosition(npc, newX, newY);

    if (result.allowed) {
        npc.x = result.x;
        npc.y = result.y;
    } else {
        let newDirection = getRandomDirection();
        while (newDirection === currentDirection) {
            newDirection = getRandomDirection();
        }
        npc.direction = newDirection;
        let newPosition = getNewPosition(npc.x, npc.y, newDirection);
        result = validateAndUpdatePosition(npc, newPosition.newX, newPosition.newY);
        if (result.allowed) {
            npc.x = result.x;
            npc.y = result.y;
        }
    }
}

function updateNPCs() {
    worldTime++;
    npcs.forEach(npc => {
        updateNPC(npc);
    });
}


function initNPC() {
    const newNPC = {
        x: Math.floor(Math.random() * CANVAS_WIDTH / 2),
        y: Math.floor(Math.random() * CANVAS_HEIGHT / 2),
        size: 50,
        color: '#FFFF00',
        direction: 'n'
    };
    while(!validateAndUpdatePosition(newNPC, newNPC.x, newNPC.y).allowed){
        newNPC.x = Math.floor(Math.random() * CANVAS_WIDTH / 2);
        newNPC.y = Math.floor(Math.random() * CANVAS_HEIGHT / 2);
    }
    npcs.push(newNPC);
    setInterval(() => {
        updateNPCs();
    }, 100);
}

module.exports = {npcs, initNPC};