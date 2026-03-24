const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const distElement = document.getElementById('distance');

canvas.width = 800;
canvas.height = 600;

// Configurações do Jogo
let score = 0;
let distance = 0;
let gameSpeed = 5;
let isGameOver = false;

const lanes = [200, 400, 600]; // Posições X das 3 pistas
let currentLane = 1; // Começa no meio

// Atributos do Abacaxi
const player = {
    x: lanes[currentLane],
    y: 500,
    width: 50,
    height: 60,
    targetX: lanes[currentLane],
    jumpY: 0,
    isJumping: false
};

// Obstáculos e Itens
let obstacles = [];
let stars = [];

// Eventos de Teclado
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentLane > 0) currentLane--;
    if (e.key === 'ArrowRight' && currentLane < 2) currentLane++;
    if ((e.key === 'ArrowUp' || e.key === ' ') && !player.isJumping) {
        player.isJumping = true;
        player.jumpY = 15;
    }
    player.targetX = lanes[currentLane];
});

function createObstacle() {
    if (Math.random() < 0.02) {
        obstacles.push({
            lane: Math.floor(Math.random() * 3),
            z: 0, // "z" aqui representa a distância no horizonte
            size: 20
        });
    }
    if (Math.random() < 0.03) {
        stars.push({
            lane: Math.floor(Math.random() * 3),
            z: 0,
            size: 15
        });
    }
}

function update() {
    if (isGameOver) return;

    distance += Math.floor(gameSpeed / 2);
    gameSpeed += 0.001; // Aumento gradual de velocidade

    // Suavizar movimento lateral
    player.x += (player.targetX - player.x) * 0.2;

    // Lógica de Pulo
    if (player.isJumping) {
        player.y -= player.jumpY;
        player.jumpY -= 0.8; // Gravidade
        if (player.y >= 500) {
            player.y = 500;
            player.isJumping = false;
        }
    }

    // Atualizar Obstáculos (vindo do horizonte)
    obstacles.forEach((obs, index) => {
        obs.z += gameSpeed;
        // Transformação simples de perspectiva
        let xPos = lanes[obs.lane] + (obs.lane - 1) * (obs.z * 0.5); 
        
        // Colisão básica
        if (obs.z > 450 && obs.z < 520 && obs.lane === currentLane && !player.isJumping) {
            gameOver();
        }
        if (obs.z > 600) obstacles.splice(index, 1);
    });

    // Atualizar Estrelas
    stars.forEach((star, index) => {
        star.z += gameSpeed;
        if (star.z > 450 && star.z < 520 && star.lane === currentLane) {
            score += 10;
            stars.splice(index, 1);
        }
        if (star.z > 600) stars.splice(index, 1);
    });

    scoreElement.innerText = `Pontos: ${score}`;
    distElement.innerText = `Distância: ${distance}m`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Desenhar Estrada Arco-íris (Perspectiva)
    ctx.beginPath();
    ctx.moveTo(350, 200); // Topo (Horizonte)
    ctx.lineTo(450, 200);
    ctx.lineTo(800, 600); // Base
    ctx.lineTo(0, 600);
    ctx.closePath();
    
    let gradient = ctx.createLinearGradient(0, 200, 0, 600);
    gradient.addColorStop(0, 'violet');
    gradient.addColorStop(0.2, 'indigo');
    gradient.addColorStop(0.4, 'blue');
    gradient.addColorStop(0.6, 'green');
    gradient.addColorStop(0.8, 'yellow');
    gradient.addColorStop(1, 'red');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 2. Desenhar Itens (Estrelas)
    stars.forEach(star => {
        ctx.fillStyle = "yellow";
        let scale = star.z / 500;
        ctx.beginPath();
        ctx.arc(lanes[star.lane], 200 + star.z, 10 * scale + 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // 3. Desenhar Obstáculos (Nuvens)
    ctx.fillStyle = "white";
    obstacles.forEach(obs => {
        let scale = obs.z / 500;
        ctx.beginPath();
        ctx.ellipse(lanes[obs.lane], 200 + obs.z, 40 * scale + 10, 20 * scale + 5, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // 4. Desenhar Abacaxi (O Herói)
    ctx.fillStyle = "#FFD700"; // Corpo dourado
    ctx.fillRect(player.x - 25, player.y - 50, 50, 60);
    // Folhas do abacaxi
    ctx.fillStyle = "#228B22";
    ctx.fillRect(player.x - 15, player.y - 75, 10, 25);
    ctx.fillRect(player.x + 5, player.y - 75, 10, 25);
    // Olhos
    ctx.fillStyle = "black";
    ctx.circle = ctx.beginPath();
    ctx.arc(player.x - 10, player.y - 30, 3, 0, Math.PI*2);
    ctx.arc(player.x + 10, player.y - 30, 3, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(() => {
        update();
        draw();
        createObstacle();
    });
}

function gameOver() {
    isGameOver = true;
    alert(`Game Over! Você percorreu ${distance} metros.`);
    location.reload();
}

draw();
