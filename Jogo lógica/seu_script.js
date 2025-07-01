const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d');
let enemyMoveDelay = 30; // Número de quadros entre cada movimento do inimigo
let enemyMoveCounter = 10; 

const boxSize = 10;
const canvasSize = 700;
const chaseDistance = 200;
const gridSize = canvasSize / boxSize;
const centerX = Math.floor(gridSize / 2) * boxSize;
const centerY = Math.floor(gridSize / 2) * boxSize;
canvas.width = canvasSize;
canvas.height = canvasSize;

let snake = [{ x: 0, y: 0 }];
let direction = { x: 0, y: 0 }; // Inicialmente, a bolinha verde está parada
let food = {};
let enemies = [
    { x: centerX, y: centerY, color: 'red', lastDirection: null },          // Inimigo 1 no centro
    { x: centerX + boxSize, y: centerY, color: 'blue', lastDirection: null }, // Inimigo 2 à direita do centro
    { x: centerX - boxSize, y: centerY, color: 'orange', lastDirection: null } // Inimigo 3 à esquerda do centro
];
let score = 0;
let lives = 3;  
let gamePaused = false;
let currentMazeIndex = 0;
let maze = [];
let obstacles = [];

const predefinedMazes = [
    [
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
        [0,1,1,1,0,1,1,0,1,1,1,0,0,0,0,0,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
        [0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
        [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0,1,1,0,1,0,0,1,1,0,1,1,1,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1], 
        [1,0,0,0,0,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,0,0,1,1,1,0,1,1,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1], 
        [1,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,1,1,1], 
        [1,0,0,0,0,1,1,0,1,1,0,0,0,0,1,1,1,0,1,1,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,0,0,1,1,0,1,1,1,1,0,1,1,0,1,1,0,0,0,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1], 
        [1,1,1,1,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,1,0,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,0,0,0,1,1], 
        [1,0,0,0,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1], 
        [1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1], 
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0,0,1,1,0,0,0,0,1], 
        [1,1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,1,1,0,0,0,0,0,1,1,1,0,1,1,1,0,1,0,0,1,0,0,1,0,1], 
        [1,1,0,0,0,1,0,1,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1], 
        [1,0,0,1,0,1,0,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,0,0,0,1,1,0,1], 
        [1,1,0,1,0,1,0,0,0,1,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,0,0,0,0,0,0,0,1,0,1,1,0,1,1,1,1,0,1], 
        [1,1,0,1,0,1,0,1,1,1,0,0,0,1,0,1,0,1,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,0,0,0,1,1,0,0,0,0,1,0,1], 
        [1,1,0,1,0,0,0,1,1,1,1,1,0,1,0,0,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1], 
        [1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,0,1,0,0,0,1,1,0,0,0,1,1,1,1,0,0,0,1,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,0,1], 
        [1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,0,1,1,1,1,0,1,1,0,1,1,1,1,0,0,0,0,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,1,1,1,1,1], 
        [1,1,0,0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,1,0,1,0,0,0,1,1,0,1,1,0,0,0,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,1,1], 
        [1,0,0,1,1,1,0,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,1,1,0,1,1,0,1,1,1,1,0,1,1,0,0,0,0,1,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,1,1], 
        [1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,0,0,0,0,0,0,1,1,0,1,1,0,1,0,1,1,1,1,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,1,1,0,1,0,0,0,0,0,0,0,1], 
        [1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,0,1,1,1,0,0,0,0,1,0,0,1,0,1,1,1,1,0,0,1,0,1,1,1,1,1,1,1,0,1,1,0,1,1,1,0,0,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1], 
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,0,1,0,0,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1,0,0,0,1,1,1,0,1,1,1,1,1,0,1,1,1], 
        [1,0,0,0,0,1,1,1,0,1,1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,0,0,0,0,1,1,0,1,1,0,0,0,1,0,1,1,1,0,1,1,1,0,1,0,0,0,1,0,1,1,1], 
        [1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,1,0,0,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,0,1,0,0,0,0,1,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1], 
        [1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,0,0,0,0,0,0,1,0,1,0,1,1,1,0,1,1,1], 
        [1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,0,0,0,0,0,1,1,0,1,1,0,1,0,0,0,0,0,0,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1,0,1,1,1,1,1,0,1,0,1,0,0,0,1,0,0,0,0,0,1,1,1], 
        [1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,0,0,0,1,1,0,1,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1], 
        [1,1,0,1,1,1,1,1,1,1,0,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,1,0,1,0,0,0,1,1,1,0,1,1,1], 
        [1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,0,0,0,1,0,1,1,1,0,1,1,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,1,1,1], 
        [1,1,0,1,0,0,0,1,1,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,1,1,1,1,0,1,0,0,0,0,0,0,0,1,1,1,1,1], 
        [1,1,0,1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,0,1,0,0,0,0,0,0,0,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,1,1], 
        [1,1,0,0,0,0,0,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,1,1,1,0,0,0,1,1,0,1,1,1,1,0,0,0,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0,0,1,1,1], 
        [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1], 
        [1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], 
        [1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,1,1], 
        [1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,0,0,1,0,1,1,0,0,0,0,0,0,1,1,1,0,1,1,0,0,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,1,1], 
        [1,1,1,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,0,1,1,1,0,0,0,0,1,0,0,0,1,0,1,0,1,1,1,0,1,1,0,0,0,0,1,1,1],
        [1,1,0,0,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,0,1,0,1,1,1,1,0,0,0,0,1,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,1,1,1,0,1,0,1,0,1,1,1,0,0,0,0,1,1,0,1,1,1],
        [1,1,1,0,0,1,1,0,1,1,1,0,0,0,0,1,0,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,0,0,0,0,0,0,0,1,0,1,0,0,1,1,0,0,1,1],
        [1,1,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,1,1,1,1,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,0,0,0,1,1,1,0,1,0,1,0,1,0,0,0,1,1,0,1,1,0,1,1,1],
        [1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,1,1,1,1,0,0,0,1],
        [1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,0,1,0,0,0,0,1,1,0,1,1,1],
        [1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,1,0,1,1,0,1,1,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1,0,1,0,1,0,1,1,0,0,0,0,1,1,1], 
        [1,0,0,0,0,1,1,1,0,1,1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,1,0,1,1,0,0,0,0,1,1,0,1,1,1,1,0,1,0,0,0,0,0,0,1,1,1,1,1,1], 
        [1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,1,0,0,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,0,0,1,1,0,1,0,0,1,1,0,0,0,1,1,0,1,1,1,0,1,1,0,0,1,1,1,1,1], 
        [1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,0,0,0,1,1,1,0,0,1,1,0,1,1,1,0,0,0,0,0,0,0,0,1,1], 
        [1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,0,0,0,0,0,1,1,0,1,1,0,1,0,0,0,0,0,0,1,1,0,1,0,1,1,1,0,1,1,1,0,0,1,0,1,1,1,0,0,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1], 
        [1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,0,0,0,1,1,0,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1], 
        [1,1,0,1,1,1,1,1,1,1,0,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,0,0,0,1,1,1,1,1,0,1,1,1,0,1,1,0,0,0,0,0,1,1], 
        [1,1,0,0,0,0,0,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,0,0,0,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1], 
        [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,0,1,1,1,1], 
        [1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,0,0,1,1,1,1,1,0,1,1,0,1,1,1,0,0,1,1,0,1,1,1,0,0,0,0,0,0,0,1,1,1], 
        [1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1], 
        [1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,0,0,1,0,1,1,0,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,0,0,1,0,0,1,1], 
        [1,1,1,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,0,0,0,1,1,0,1,1,0,1,1,1,1,1,0,0,0,1,1,1,0,0,0,0,1,1,1,0,1,1],
        [1,1,0,0,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,0,1,0,1,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1,1,1,0,0,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1],
        [1,1,1,0,0,1,1,0,1,1,1,0,0,0,0,1,0,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,0,0,1,1,0,1,1,1,0,0,0,0,1,1,1,0,1,1],
        [1,1,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,1,1,1,1,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,0,0,1,1,0,1,1,0,1,0,0,0,1,1,1,0,1,1,1,0,1,1,0,0,1,1,0,1,1],
        [1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0,0,0,1,1],
        [1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1],
        [1,1,0,1,0,0,0,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,1,1,1,1,1,1,0,0,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,1], 
        [1,0,0,0,0,1,1,1,0,1,1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,1,0,1,1,0,0,0,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1], 
        [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1], 
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0], 
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,0,0,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]
    ],
];

const questions = [
    { text: 'Se P = F e Q = V, qual o valor de P V Q?', answer: 'V' },
    { text: 'Se P = V e Q = F, qual é o valor de P ∧ Q?', answer: 'F' },
    { text: 'Qual é o valor de P -> Q se P = V e Q = F?', answer: 'F' },
    { text: 'Qual o resultado de 10 % 3 em JavaScript?', answer: '1' },
    { text: 'Qual o valor de "5" + 5 em JavaScript?', answer: '55' },
    { text: 'Se x = 2, y = 3, qual o valor de x ** y?', answer: '8' },
    { text: 'Qual é o resultado de 0 == false em JavaScript?', answer: 'V' },
    { text: 'Qual é o resultado de 0 === false em JavaScript?', answer: 'F' },
    { text: 'Qual o valor de Math.floor(4.7)?', answer: '4' },
    { text: 'Se P = V e Q = V, qual o valor de P ∧ Q?', answer: 'V' },
    { text: 'Se P = F e Q = V, qual o valor de P V Q?', answer: 'V' },
    { text: 'Se P = V e Q = F, qual é o valor de P ∧ Q?', answer: 'F' },
    { text: 'Qual é o valor de P -> Q se P = V e Q = F?', answer: 'F' },
    { text: 'Qual o valor de ¬(P V Q) se P = V e Q = V?', answer: 'F' },
    { text: 'Se A = V, B = F e C = V, qual o valor de A ∧ (B V C)?', answer: 'V' },
    { text: 'Se P = V e Q = F, qual é o valor de ¬P V Q?', answer: 'F' },
    { text: 'Qual é o valor de P ∧ (Q -> P) se P = V e Q = F?', answer: 'V' },
    { text: 'Se P = F e Q = V, qual o valor de ¬P V ¬Q?', answer: 'V' },
    { text: 'Qual é o valor de (P -> Q) ∧ (¬Q -> ¬P) se P = V e Q = V?', answer: 'V' },
    { text: 'Se P = F, qual é o valor de P V (P ∧ Q)?', answer: 'F' },
    { text: 'Qual é o valor de ¬(P ∧ Q) se P = V e Q = V?', answer: 'F' },
    { text: 'Se P = V, Q = V e R = F, qual o valor de (P V R) ∧ Q?', answer: 'V' },
    { text: 'Qual o valor de ¬P ∧ Q se P = V e Q = V?', answer: 'F' },
    { text: 'Se P = F e Q = F, qual é o valor de ¬P V Q?', answer: 'V' }
];


// Adiciona evento de teclado
document.addEventListener('keydown', changeDirection);

function gameLoop() {
    if (gamePaused) return;
    clearCanvas();
    drawMaze();
    drawObstacles();
    drawFood();
    drawSnake();
    drawEnemies();  // Desenha todos os inimigos
    drawScore();
    checkEnemyCollision();
    moveEnemies();  // Move todos os inimigos aleatoriamente
    requestAnimationFrame(gameLoop); // Loop contínuo do jogo
}

function selectMaze() {
    maze = predefinedMazes[currentMazeIndex];
    placeObstacles();
}

// Função para colocar 3 obstáculos com perguntas em posições aleatórias
function placeObstacles() {
    obstacles = [];
    let availablePositions = [];
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 0) {
                availablePositions.push({ x: j * boxSize, y: i * boxSize });
            }
        }
    }

    // Embaralha as posições e seleciona as três primeiras
    shuffleArray(availablePositions);
    for (let i = 0; i < 5; i++) {
        const questionIndex = Math.floor(Math.random() * questions.length);
        obstacles.push({
            x: availablePositions[i].x,
            y: availablePositions[i].y,
            question: questions[questionIndex],
            active: true
        });
    }
}

// Função para embaralhar um array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function drawMaze() {
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 1) {
                ctx.fillStyle = '#555'; 
                ctx.fillRect(j * boxSize, i * boxSize, boxSize, boxSize);
            }
        }
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.active) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(obstacle.x, obstacle.y, boxSize, boxSize);
            ctx.strokeStyle = 'orange';
            ctx.strokeRect(obstacle.x, obstacle.y, boxSize, boxSize);
        }
    });
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach(part => {
        ctx.fillStyle = 'lime'; 
        ctx.fillRect(part.x, part.y, boxSize, boxSize);
        ctx.strokeStyle = 'darkgreen'; 
        ctx.strokeRect(part.x, part.y, boxSize, boxSize);
    });
}

function drawFood() {
    // Verifica se todos os obstáculos foram respondidos corretamente
    const allQuestionsAnswered = obstacles.every(obstacle => !obstacle.active);

    // Desenha o retângulo apenas se todas as perguntas foram respondidas
    if (allQuestionsAnswered) {
        // Configura a cor e brilho do retângulo branco
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'; // Cor de brilho
        ctx.shadowBlur = 10; // Nível de brilho ao redor
        ctx.fillRect(food.x, food.y, boxSize, boxSize * 3);

        // Desativa o efeito de brilho após desenhar
        ctx.shadowBlur = 0;
    }
}


function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, boxSize, boxSize);
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = "20px Arial";
    ctx.fillText("Vidas: " + lives, canvasSize - 100, 30);
    ctx.fillText("Pontuação: " + score, 10, canvasSize - 10);
}

function placeFood() {
    // Define a posição da comida no canto inferior direito, ocupando dois blocos de altura
    food = {
        x: (gridSize - 1) * boxSize,
        y: (gridSize - 3) * boxSize // Começa um bloco acima do canto inferior
    };
}


function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (isGameOver()) {
        lives--;
        if (lives <= 0) {
            alert(`Game Over! Sua pontuação foi: ${score}`);
            resetGame();
            return;
        }
        // Redefine a posição da cobra no canto superior esquerdo ao colidir
        snake = [{ x: 0, y: 0 }];
        direction = { x: 0, y: 0 }; // Pausa a direção até o próximo movimento
        placeFood(); 
    } else {
        snake.unshift(head);
        checkObstacleCollision(head);

        // Verifica se a cobra chegou ao retângulo branco de vitória
        const allQuestionsAnswered = obstacles.every(obstacle => !obstacle.active);
        if (allQuestionsAnswered && head.x === food.x && head.y === food.y) {
            // Mensagem de vitória e final do jogo
            alert(`Parabéns! Você venceu o jogo!`);
            resetGame();
            return;
        }

        // Checa se a cobra comeu a comida (caso contrário, remove a cauda)
        if (!(allQuestionsAnswered && head.x === food.x && head.y === food.y)) {
            snake.pop();
        }
    }
}


function isValidMove(enemy, direction) {
    const nextX = enemy.x + direction.x;
    const nextY = enemy.y + direction.y;
    return (
        nextX >= 0 && nextX < canvas.width &&
        nextY >= 0 && nextY < canvas.height &&
        maze[Math.floor(nextY / boxSize)][Math.floor(nextX / boxSize)] === 0
    );
}



function moveEnemies() {
    enemies.forEach(enemy => {
        if (enemyMoveCounter < enemyMoveDelay) {
            enemyMoveCounter++;
            return; // Não move o inimigo até o contador atingir o atraso
        }

        enemyMoveCounter = 0; // Reseta o contador após cada movimento

        const head = snake[0]; // Cabeça da cobra (posição atual)
        const distanceToSnake = Math.hypot(head.x - enemy.x, head.y - enemy.y); // Distância euclidiana

        let directions = [
            { x: 0, y: -boxSize, name: 'up', opposite: 'down' },    // Cima
            { x: 0, y: boxSize, name: 'down', opposite: 'up' },     // Baixo
            { x: -boxSize, y: 0, name: 'left', opposite: 'right' }, // Esquerda
            { x: boxSize, y: 0, name: 'right', opposite: 'left' }   // Direita
        ];

        let chosenDirection;

        // Se o inimigo estiver dentro do alcance de perseguição, ele tentará se mover em direção à cobra
        if (distanceToSnake <= chaseDistance) {
            // Ordena as direções pela proximidade da cobra
            directions.sort((a, b) => {
                const distanceA = Math.hypot((enemy.x + a.x) - head.x, (enemy.y + a.y) - head.y);
                const distanceB = Math.hypot((enemy.x + b.x) - head.x, (enemy.y + b.y) - head.y);
                return distanceA - distanceB;
            });
            
            // Tenta mover na direção mais próxima que não é oposta à última direção
            chosenDirection = directions.find(direction => 
                direction.name !== enemy.lastDirection &&
                isValidMove(enemy, direction)
            );
            
            // Se todas as direções exceto a oposta estão bloqueadas, permite voltar atrás
            if (!chosenDirection) {
                chosenDirection = directions.find(direction => isValidMove(enemy, direction));
            }
        } else {
            // Movimento aleatório se o inimigo estiver fora do alcance de perseguição
            let possibleDirections = directions.filter(direction => direction.name !== enemy.lastDirection);
            let validDirections = possibleDirections.filter(direction => isValidMove(enemy, direction));

            // Permite voltar atrás se todas as direções estiverem bloqueadas
            if (validDirections.length === 0) {
                validDirections = directions.filter(direction => isValidMove(enemy, direction));
            }

            chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
        }

        // Move o inimigo na direção escolhida
        if (chosenDirection) {
            enemy.x += chosenDirection.x;
            enemy.y += chosenDirection.y;
            enemy.lastDirection = chosenDirection.opposite; // Define a última direção oposta para evitar voltar atrás
        }
    });
}




function checkEnemyCollision() {
    const head = snake[0]; // A cabeça da cobra

    // Verifica a colisão com cada inimigo
    enemies.forEach(enemy => {
        if (head.x === enemy.x && head.y === enemy.y) {
            lives--; // Perde uma vida ao colidir com um inimigo
            if (lives <= 0) {
                alert(`Game Over! Você foi capturado! Sua pontuação foi: ${score}`);
                resetGame();
            } else {
                alert("Você perdeu uma vida! Continue jogando.");
                // Reposiciona a cobra e os inimigos para reiniciar o jogo sem game over imediato
                resetSnakeAndEnemies();
            }
        }
    });
}

function resetSnakeAndEnemies() {
    snake = [{ x: 0, y: 0 }]; // Reseta a cobra no canto superior esquerdo
    direction = { x: 0, y: 0 }; // Pausa a direção da cobra
    enemies.forEach(enemy => {
        enemy.x = canvas.width / 2;
        enemy.y = canvas.height / 2; // Reposiciona os inimigos no centro do mapa
    });
}


function checkObstacleCollision(head) {
    obstacles.forEach(obstacle => {
        if (obstacle.active && head.x === obstacle.x && head.y === obstacle.y) {
            gamePaused = true;
            askQuestion(obstacle);
        }
    });
}

function askQuestion(obstacle) {
    const userAnswer = prompt(obstacle.question.text);
    if (userAnswer && userAnswer.trim().toLowerCase() === obstacle.question.answer.toLowerCase()) {
        obstacle.active = false; // Remove o obstáculo se a resposta estiver correta
        score++; // Incrementa a pontuação
    } else {
        lives--;
        if (lives <= 0) {
            resetGame();
            return;
        }
    }
    gamePaused = false;
}

function isGameOver() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    if (maze[Math.floor(head.y / boxSize)][Math.floor(head.x / boxSize)] === 1) {
        return true;
    }
    return false;
}

function changeDirection(event) {
    let newDirection = null;
    if (event.key === 'ArrowUp') {
        newDirection = { x: 0, y: -boxSize };
    } else if (event.key === 'ArrowDown') {
        newDirection = { x: 0, y: boxSize };
    } else if (event.key === 'ArrowLeft') {
        newDirection = { x: -boxSize, y: 0 };
    } else if (event.key === 'ArrowRight') {
        newDirection = { x: boxSize, y: 0 };
    }
    
    if (newDirection) {
        direction = newDirection;
        moveSnake(); // Move a cobra apenas quando o jogador pressiona uma tecla
    }
}

function resetGame() {
    score = 0;
    lives = 3;  
    currentMazeIndex = 0;
    gamePaused = false;
    selectMaze();
    snake = [{ x: 0, y: 0 }]; // Define a posição inicial da cobra
    direction = { x: 0, y: 0 }; // Pausa a direção inicial
    enemy = { x: boxSize * (gridSize - 3), y: boxSize * (gridSize - 3) }; // Redefine a posição inicial do inimigo
    placeFood(); // Posiciona a comida
    gameLoop(); 
}

function startGame() {
    resetGame();
}

startGame();
