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
let score = 0
const winningScore = 20
// global arrays. Main data
const grid = []
const wizards = []
const enemies = []
const enemyPosition = []
const spells = []
const stats = {
    enemies: 0,
    spells: 0,
    wizards: 0,
}

// MOUSE
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}
//to find mouse position:
let canvasPosition = canvas.getBoundingClientRect() //method returns a DOMRect object providing information about the size of an element and its position relative to the viewport.
//we are defining limits for top left position for drawing cells, so it cannot go beyond canvas
canvas.addEventListener('mousemove', function (e) { // creating event listener for detecting mouse movement e= event
    mouse.x = e.x - canvasPosition.left //
    mouse.y = e.y - canvasPosition.top
})
canvas.addEventListener('mouseleave', function () { //when leaving canvas space, mouse event listener returns undefined for mouse coordinates x and y
    mouse.x = undefined
    mouse.y = undefined

})
// GAME BOARD
const controls = { //controls bar at the top of the canvas
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
        if (mouse.x && mouse.y && collision(this, mouse)) { //checks if mouse is within the cell boundaries
            c.strokeStyle = 'black' //color of the cell on mouse event listener
            c.strokeRect(this.x, this.y, this.width, this.height) //draws cell boundary upon mouse event listener
        }

    }
}
//we create grid on our board: populate array
function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            grid.push(new Cell(x, y)) //create new cell
        }
    }
}
createGrid() //we order to create that grid system

//we draw the grid through array
function handleGrid() {
    for (let i = 0; i < grid.length; i++) {
        grid[i].draw()
    }
}
// SPELLS
class Spell {
    constructor(x, y){
        this.x = x
        this.y = y
        this.width = 10
        this.height = 10
        this.power = 20
        this.speed = 5
    }
    update(){ //to create movement of our spells: it updates circles
        this.x += this.speed
        // console.log(this.x, this.y)
    }
    draw(){ //draws spells using arc property. Circle in this case
        c.fillStyle = '#80bfff'
        c.beginPath() //pre-build function to start drawing
        c.arc(this.x, this.y, this.width, 0, Math.PI * 2)
        c.fill()
    }
}
function handleSpells(){
    for (let i = 0; i < spells.length; i++){ //for loop that cycles through spell array creating animation
        // console.log(spells[i])
        spells[i].update() //updates or creates movement of the spell
        spells[i].draw() //drawing along the path
        if (spells[i] && spells[i].x > canvas.width - cellSize) { //doesn't let a spell exit canvas space and stops before one grid / 2
            spells.splice(i, 1) //removes that one spell
            i-- //makes that next spell in the array doesn't get removed
        }
        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j] && spells[i] && collision(spells[i], enemies[j])){ //checks for collision between spells and enemies
                enemies[j].health -= spells[i].power //removes health from enemies with the value of spell power
                spells.splice(i, 1) //spell is removed after contact
                i-- //we remove just one spell
            }
        }

    }
    // console.log(spells.length)
}
// WIZARDS
const iceMage = new Image()
iceMage.src = "iceMage.png"

class Wizard {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = cellSize - gap * 2
        this.height = cellSize - gap * 2
        this.casting = false
        this.castingNow = false //we need this value to align spell casting animation with wizard animation
        this.health = 100
        // this.spells = []
        this.timer = 0
        this.frameX = 0
        this.frameY = 0
        this.spriteWidth = 170
        this.spriteHeight = 170
        this.minFrame = 0
        this.maxFrame = 4
    }
    draw() {
        // c.fillStyle = 'grey';
        // c.fillRect(this.x, this.y, this.width, this.height) //hitbox of wizards
        // c.fillStyle = 'gold'
        // c.font = '20px Cinzel Decorative'
        // c.fillText('Hp: ' + Math.floor(this.health), this.x + 15, this.y + 30)
        c.drawImage(iceMage, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 
            this.x, this.y, this.width, this.height) //to specify where on the canvas to display
    }
    update(){
        if (frame % 20 === 0){ //modulus. If frame gets to 20 and remainder is 0, 1 frame is activated. Basically slows down the animation
            if (this.frameX < this.maxFrame) this.frameX++ //adds one frame whenever frame modulus is activated
            else this.frameX = this.minFrame //sets frame back to 0 to cycle again
            if (this.frameX === 4) this.castingNow = true //whenever frame of a wizard gets to the 4th (which is attack animation) a spell will be cast
        }
        //I created this so that wizard doesn't stay in attack mode all the time. They now stay idle when there is no enemy in line
        if(this.casting){
            this.minFrame = 0
            this.maxFrame = 4
        } else {
            this.minFrame = 5
            this.maxFrame = 9
        }

        if (this.casting && this.castingNow == true){ //only casts spell if there is a target in line and only if the animation gets to the last phase which is casting animation
                spells.push(new Spell(this.x + 70, this.y + 50))//creates spell at x=70, y=50 of that cell
                stats.spells +=1 //for stats
                this.castingNow = false
            }

        }
    }

canvas.addEventListener('click', function() {
    //find closest grid position to the left
    const gridX = mouse.x - (mouse.x % cellSize) + gap; 

    // module operator gives a remainder value, if mouse position is 260, cellSize is 100 ; 
    // 260 % 100 = 60, so if mouse position is 260, then gridX = 260 - 60 + 3 = 200 which is the closest horisontal grid position to the left
    const gridY = mouse.y - (mouse.y % cellSize) + gap;
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
    if (playerGold >= wizardCost) { //if we have more or equal gold to the cost of a wizard, we can place one
        wizards.push(new Wizard (gridX, gridY)) // since we defined closest grid positions, we are giving it to the wizard class and pushing it into array
        stats.wizards += 1
        playerGold -= wizardCost 
    }
})
function handleWizards() {
    for (let i = 0; i < wizards.length; i++){
        wizards[i].draw()
        wizards[i].update()
        // console.log(enemyPosition.indexOf(wizards[i].y))
        if (enemyPosition.indexOf(wizards[i].y) !== -1){ //if indexOf returns -1 it means it didnt find any item with this value in this array
            wizards[i].casting = true //this particular wizard will start shooring if enemy is visible on y coordinate *Important
        } else {
            wizards[i].casting = false //stops wizards from casting if no enemy detected on the y coordinate *Important
        }
        for (let j = 0; j < enemies.length; j++){
            if (wizards[i] && collision(wizards[i], enemies[j])){ //this will check every wizards against every enemy
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
const enemyTypes = []
const ninjaMale = new Image() //this creates image from pre-built class Image
ninjaMale.src = 'ninjaM.png'
enemyTypes.push(ninjaMale)

const ninjaFemale = new Image()
ninjaFemale.src = 'ninjaF.png'
enemyTypes.push(ninjaFemale)
class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width
        this.y = verticalPosition
        this.width = cellSize - gap * 2
        this.height = cellSize - gap * 2
        this.speed = Math.random() * 0.2 + 0.4 //defines enemy speed
        this.movement = this.speed
        this.health = 100
        this.maxHealth = this.health //This is needed to create different rewards in Gold for different targets defeated
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)] //we randomize selection of either Male or Female ninjas from enemyTypes array. Math floor is used because array index cannot have decimal points
        this.frameX = 0 //to go through X coordinate at the image sprite sheet
        this.frameY = 0 //only needed if there are multi-lines sprite sheets
        this.minFrame = 0
        this.maxFrame = 9
        this.spriteWidth = 365
        this.spriteHeight = 460
    }
    update(){
        this.x -= this.movement
        if (frame % 10 === 0){
            if (this.frameX < this.maxFrame) this.frameX++ //this cycles through image frames
            else this.frameX = this.minFrame //this starts over when X coordinate was not spotted further    
        }
    }
    draw(){
        // c.fillStyle = 'orange'
        // c.fillRect(this.x, this.y, this.width, this.height)
        // c.fillStyle = 'black'
        // c.font = '20px Cinzel Decorative'
        // c.fillText('Hp: ' + Math.floor(this.health), this.x + 15, this.y + 30)

        /*The following pre-build method can have 3/5/9 arguments. We use 9 for full control
         c.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) 
         :img is the image we want to use
         :s - source is what area we crop from the sprite sheet
         :d - destination is where on the canvas we want to put our image*/
         c.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 
            this.x, this.y, this.width, this.height) 
        //  console.log (c.drawImage)
        
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
        if (enemies[i].health <= 0){
            let bounty = enemies[i].maxHealth/5 //adds gold to player depending on the enemy health / 10
            playerGold += bounty //adds gold from enemy
            score += bounty //adds score points same as gold
            const findThisIndex = enemyPosition.indexOf(enemies[i].y) //detects enemy on y coordinate *Important
            enemyPosition.splice(findThisIndex, 1) //we remove an enemy on y coordinate
            enemies.splice(i, 1) //removes enemy after it was defeated
            i-- //removes just one that enemy
            stats.enemies += 1
        }
    }
    if (frame % enemiesInterval === 0){ //every time frame gets up to its value with a remainder of 0, a new Enemy spawns
        if (score >= winningScore) return
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + gap //this will always correspond with our vertical grid. It creates a position for enemy to spawn randomly between y rows
        enemies.push(new Enemy(verticalPosition)) //enemy spawns at var verticalPosition
        enemyPosition.push(verticalPosition) //creates new enemies
        if (enemiesInterval > 120) enemiesInterval -= 50 //this is where to change enemy spawn speed - difficulty. More than 50 - slower spawn
    }
}

// RESOURCES
// UTILITIES
function HandleGameStatus() {
    c.fillStyle = 'gold'
    c.font = '30px Cinzel Decorative'
    c.fillText('Score: ' + score, 20, 40)
    c.fillText('Gold: ' + playerGold, 20, 80)
    if (gameOver){ //message if gameOver variable becomes true
        c.fillStyle = 'black'
        c.font = '80px Cinzel Decorative'
        c.fillText('GAME OVER', 200, 250)
        statistics()
    }
    if (score >= winningScore && enemies.length === 0){
        c.fillStyle = 'Black'
        c.font = '60px Cinzel Decorative'
        c.fillText('YOU WON!', 200, 250)
        c.font = '30px Cinzel Decorative'
        c.fillText('Your score is ' + score + ' points!', 200, 290)
        statistics()
    }
}

//main function that activates all animations
function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height) 
    c.fillStyle = 'grey'
    c.fillRect(0, 0, controls.width, controls.height)
    handleGrid() //grid now exists
    handleWizards() //we can place wizards on the board now
    handleSpells()
    handleEnemies() //we call enemies function- enemies start to spawn
    HandleGameStatus()
    frame++
    if (!gameOver) requestAnimationFrame(animate) //stops the game if gameOver is true
}
animate() // we call our main animate function
function statistics() { //statistics at the end of the game
    c.fillStyle = 'black'
    c.font = '20px Arial'
    c.fillText("Wizards summoned: " + stats.wizards, 200, 380)
    c.fillText("Enemies eliminated: " + stats.enemies, 200, 400)
    c.fillText("Total amount of spells used: " + stats.spells, 200, 420)
}
// statistics()

//Makes rules for collision to occur
function collision(first, second) {
    if (!(first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)

    ) {
        return true
    }
}

//Fix for the mouse offset when resizing the screen.
window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect()
})
