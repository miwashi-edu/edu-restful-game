const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let player = {};

let floorTiles = [];
let obstacles = [];
let skyTiles = [];
let players = [];
let npcs = [];

async function setupGame() {
    initializeCanvas();
    player = await initializePlayer(player);
    addKeyboardEventListeners();
    setInterval(fetchNPC, 100);
    setInterval(fetchPlayers, 100);
    fetchWorldData();
    startAnimation();
}

function initializeCanvas() {
    fetch('/canvas-settings')
        .then(response => response.json())
        .then(settings => {
            canvas.width = settings.width;
            canvas.height = settings.height;
            console.log(`Canvas initialized with width: ${settings.width}, height: ${settings.height}`);
        })
        .catch(error => console.error('Error fetching canvas settings:', error));
}

function initializePlayer(player) {
    const uuid = getCookie('uuid') || 'missing-uuid';
    return fetch('/get-player', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uuid: uuid })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch player data');
            }
            return response.json();
        })
        .then(data => {
            if (data.uuid !== uuid) {
                setCookie('uuid', data.uuid);  // Update the cookie if the UUID is different
            }
            player.uuid = data.uuid;
            player.name = data.name;
            player.x = data.x;
            player.y = data.y;
            player.color = data.color || '#FF0000';
            player.size = data.size || 50;
            return player;
        })
        .catch(error => {
            console.error('Failed to initialize player:', error);
            return {};
        });
}

function fetchPlayers() {
    const uuid = getCookie('uuid') || 'missing-uuid';
    fetch('/get-players', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uuid: uuid })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(fetchedPlayers => {
            if (fetchedPlayers.length === 0) {
                return;
            }
            players = fetchedPlayers.map(player => ({
                uuid: player.uuid,
                x: player.x,
                y: player.y,
                size: player.size || 50,
                color: hashUUIDtoColor(player.uuid)  // Use the hash function to generate a color based on UUID
            }));
        })
        .catch(error => {
            console.error('Error fetching players:', error);
        });
}

function hashUUIDtoColor(uuid) {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}



function fetchNPC() {
    fetch('/npcs')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(fetchedNPCs => {
            if (fetchedNPCs.length === 0) {
                console.log('No NPCs available.');
                return;
            }
            npcs = fetchedNPCs.map(npc => ({
                x: npc.x,
                y: npc.y,
                size: npc.size || 50,  // Default size
                color: npc.color || '#FFFF00'  // Default color
            }));
        })
        .catch(error => console.error('Error fetching NPCs:', error));
};

function fetchWorldData() {
    fetch('/floor-tiles')
        .then(response => response.json())
        .then(data => {
            floorTiles = data;
        })
        .catch(error => console.error('Error fetching floor objects:', error));

    fetch('/obstacles')
        .then(response => response.json())
        .then(data => {
            obstacles = data;
        })
        .catch(error => console.error('Error fetching middle objects:', error));

    fetch('/sky-tiles')
        .then(response => response.json())
        .then(data => {
            skyTiles = data;
        })
        .catch(error => console.error('Error fetching sky objects:', error));
}

function drawObjects(objects, color, title) {
    ctx.fillStyle = color;
    objects.forEach(obj => {
        if (obj.tile) {
            const img = new Image();
            img.onload = function() {
                ctx.strokeStyle = color;
                ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
                ctx.strokeStyle = 'white';
                ctx.fillStyle = 'white';
                ctx.font = '16px Arial';
                ctx.fillText(title, obj.x + 5, obj.y + 20);
                ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
            };
            img.onerror = function(e) {
                console.error("Error loading image", img.src, e);
            };
            ctx.strokeStyle = color;
            ctx.strokeStyle = 'white';
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            img.src = `./tiles/${obj.tile}.svg`;
            ctx.fillText(title, obj.x + 5, obj.y + 20);
        } else {
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(title, obj.x + 5, obj.y + 20);
        }
    });
}




function addKeyboardEventListeners() {
    document.addEventListener('keydown', (event) => {
        const uuid = getCookie('uuid') || 'missing-uuid';
        let direction;
        let speed;

        switch (event.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            default:
                return;
        }
        if (event.shiftKey) {
            speed = 'slow';
        } else if (event.ctrlKey) {
            speed = 'fast';
        } else {
            speed = 'normal';
        }
        fetch('/validate-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ direction, speed, uuid })
        })
            .then(response => response.json())
            .then(data => {
                player.x = data.x;
                player.y = data.y;
            })
            .catch(error => console.error('Error validating move:', error));
    });
}

function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawNPCs() {
    npcs.forEach(npc => {
        ctx.fillStyle = npc.color;
        ctx.fillRect(npc.x, npc.y, npc.size, npc.size);
    });
}

function drawPlayers(players) {
    players.forEach(player => {
        ctx.fillStyle = player.color || '#8B4513';
        ctx.fillRect(player.x, player.y, player.size, player.size);
    });
}

function startAnimation() {
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawObjects(floorTiles, '#8B4513', 'floor');
        drawPlayer(player);
        drawNPCs();
        drawPlayers(players);
        drawObjects(obstacles, '#808080','obsacle');

        drawObjects(skyTiles, '#ADD8E6', 'sky');
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

window.onload = setupGame;
