const canvas = document.getElementById('canvas1')
const c = canvas.getContext('2d')
canvas.width = 900
canvas.height = 600

// GLOBAL VARIABLES
const cellSize = 100
const gap = 3
let playerGold = 300
let enemiesInterval = 600 // interval for spawning enemies
let frame = 0
let gameOver = false

const grid = []
const wizards = []
const enemies = []
const enemyPosition = []
const spells = []

// MOUSE
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect()
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPosition.left
    mouse.y = e.y - canvasPosition.top
})
canvas.addEventListener('mouseleave', function () {
    mouse.x = undefined
    mouse.y = undefined

})
// GAME BOARD
const controls = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = cellSize
        this.height = cellSize
    }
    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)) {
            c.strokeStyle = 'black'
            c.strokeRect(this.x, this.y, this.width, this.height)
        }

    }
}
function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            grid.push(new Cell(x, y))
        }
    }
}
createGrid()

function handleGrid() {
    for (let i = 0; i < grid.length; i++) {
        grid[i].draw()
    }
}
// SPELLS
class Spells {
    constructor(x, y){
        this.x = x
        this.y = y
        this.width = 10
        this.height = 10
        this.power = 20
        this.speed = 5
    }
    update(){
        this.x += this.speed
    }
    draw(){ //draws spell using arc property (circle in this case)
        c.fillStyle = 'black'
        c.beginPath()
        c.arc(this.x, this.y, this.width, 0, Math.PI * 2)
        c.fill()
    }
}
function handleSpells(){
    for (let i = 0; i < spells.length; i++){ //for loop that cycles through spell array creating animation
        spells[i].update() //updates or creates movement of the spell
        spells[i].draw() //drawing along the path

        if (spells[i] && spells[i].x > canvas.width - cellSize / 2) //doesn't let a spell exit canvas space and stops before one grid / 2
            spells.splice(i, 1) //removes that one spell
            i-- //makes that next spell in the array doesn't get removed
    }
}
// WIZARDS
class Wizard {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = cellSize
        this.height = cellSize
        this.casting = false
        this.health = 100
        this.spells = []
        this.timer = 0
    }
    draw() {
        c.fillStyle = 'blue';
        c.fillRect(this.x, this.y, this.width, this.height)
        c.fillStyle = 'gold'
        c.font = '20px Cinzel Decorative'
        c.fillText('Hp: ' + Math.floor(this.health), this.x + 15, this.y + 30)
    }
}
canvas.addEventListener('click', function() {
    //find closest grid position to the left
    const gridX = mouse.x - (mouse.x % cellSize); 

    // module operator gives a remainder value, if mouse position is 260, cellSize is 100 ; 
    // 100 % 100 = 60, so if mouse position is 260, then gridX = 260 - 60 = 200 which is the closest horisontal grid position to the left
    const gridY = mouse.y - (mouse.y % cellSize);
    //to prevent user from clicking on the top blue bar:
    if (gridY < cellSize) return; //because max cellSize is 100, on y if it's less then 100 then it's off the grid

    //this prevents from adding a wizard to a cell that's already taken by a wizard
    //it loops through the array of wizards and checks current gridX and gridY againts what we have saved in array for each wizard
    for (let i = 0; i < wizards.length; i++){
        if (wizards[i].x === gridX && wizards[i].y === gridY) 
        return;
    }

    //wizard cost is here so we could change this value easily in the future when we cant to create wizards with different costs
    let wizardCost = 100
    if (playerGold >= wizardCost) {
        wizards.push(new Wizard (gridX, gridY)) // since we defined closest grid positions, we are giving it to the wizard class and pushing it into array
        playerGold -= wizardCost
    }
})
function handleWizards() {
    for (let i = 0; i < wizards.length; i++){
        wizards[i].draw()
        for (let j = 0; j < enemies.length; j++){
            if (collision(wizards[i], enemies[j])){ //this will check every wizards against every enemy
                enemies[j].movement = 0 //stops enemy at wizard collision
                wizards[i].health -= 0.2 //drops wizard health. The larger the number the faster wizards drop their health
            }
            if (wizards[i] && wizards[i].health <= 0) { //if wizard's health drops or equal to 0
                wizards.splice(i, 1) //One wizard is removed from wizards array
                i-- //so that next element in the array doesn't get sipped after wizard is removed
                enemies[j].movement = enemies[j].speed //enemy continues to move after wizard was destroyed
            }
        }
    }
}
// ENEMIES
class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width
        this.y = verticalPosition
        this.width = cellSize
        this.height = cellSize
        this.speed = Math.random() * 1 + 2 //defines enemy speed
        this.movement = this.speed
        this.health = 100
        this.maxHealth = this.health //This is needed to create different rewards in Gold for different targets defeated
    }
    update(){
        this.x -= this.movement
    }
    draw(){
        c.fillStyle = 'red'
        c.fillRect(this.x, this.y, this.width, this.height)
        c.fillStyle = 'black'
        c.font = '20px Cinzel Decorative'
        c.fillText('Hp: ' + Math.floor(this.health), this.x + 15, this.y + 30)
    }
}
// to move enemies on the grid
function handleEnemies(){
    for (let i = 0; i < enemies.length; i++){
        enemies[i].update() //"update" function is used to create new enemies in the array
        enemies[i].draw() //"draw" function is used on enemy array
        if (enemies[i].x < 0) { //if enemy reaches end of the grid the game is over
            gameOver = true
        }
    }
    if (frame % enemiesInterval === 0){ //every time frame gets up to 100, the new Enemy class spawns
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize //this will always correspond with our vertical grid
        enemies.push(new Enemy(verticalPosition)) //enemy spawns at var verticalPosition
        enemyPosition.push(verticalPosition) //creates new enemies
        if (enemiesInterval > 120) enemiesInterval -= 50 //this is where to change enemy spawn speed - difficulty. Less than 50 - slower spawn
    }
}

// RESOURCES
// UTILITIES
function HandleGameStatus() {
    c.fillStyle = 'gold'
    c.font = '30px Cinzel Decorative'
    c.fillText('Gold: ' + playerGold, 20, 50)
    if (gameOver){ //message if gameOver variable becomes true
        c.fillStyle = 'black'
        c.font = '80px Cinzel Decorative'
        c.fillText('GAME OVER', canvas.width / 3, canvas.height / 2)
    }
}


function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = 'grey'
    c.fillRect(0, 0, controls.width, controls.height)
    handleGrid() //grid now exists
    handleWizards() //we can place wizards on the board now
    handleEnemies() //we call enemies function- enemies start to spawn
    HandleGameStatus()
    frame++
    if (!gameOver) requestAnimationFrame(animate) //stops the game if gameOver is true
}
animate()

function collision(first, second) {
    if (!(first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)

    ) {
        return true
    }
}