//Importing sound effects
const introMusic = new Audio("./music/introSong.mp3");
const shootingSound = new Audio("./music/music_shooting.mp3");
const killEnemySound = new Audio("./music/music_killEnemy.mp3");
const gameOverSound = new Audio("./music/music_gameOver.mp3");
const heavyWeaponSound = new Audio("./music/music_heavyWeapon.mp3");
const specialWeaponSound = new Audio("./music/specialWeapon.wav");

introMusic.play();
// Basic Environment setup
const canvas = document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext("2d");
const lightWeaponDamage = 10;
const heavyWeaponDamage = 20;

let difficulty = 2;
const form = document.querySelector("form");
const scoreBoard = document.querySelector(".scoreBoard");
let playerScore = 0;

// Basic functions

// Event listener for difficulty form
document.querySelector("input").addEventListener("click", (e) => {
    e.preventDefault();

    // making form invisible
    form.style.display = "none";
    //making scoreBoard visible
    scoreBoard.style.display = "block";

    //getting difficulty selected by user
    const userValue = document.getElementById("difficulty").value;


    //Sropping intro music
    introMusic.pause();

    if (userValue === "Easy") {
        setInterval(spawnEnemy, 2000);
        return (difficulty = 4);
    }
    if (userValue === "Medium") {
        setInterval(spawnEnemy, 1750);
        return (difficulty = 5);
    }
    if (userValue === "Hard") {
        setInterval(spawnEnemy, 1500);
        return (difficulty = 6);
    }
    if (userValue === "Insane") {
        setInterval(spawnEnemy, 1200);
        return (difficulty = 7);
    }
});

// Endscreen
const gameoverLoader = () => {
    // creating endscreen div and play again button and high score element
    const gameOverBanner = document.createElement("div");
    const gameOverBtn = document.createElement("button");
    const highScore = document.createElement("div");

    highScore.innerHTML = `High Score: ${localStorage.getItem("highScore") ? localStorage.getItem("highScore") : playerScore}`;


    const OfficialHighScore = localStorage.getItem("highScore") && localStorage.getItem("highScore");
    if (OfficialHighScore < playerScore) {
        localStorage.setItem("highScore", playerScore);

        //updating high score html
        highScore.innerHTML = `High Score: ${playerScore}`;
    }



    // adding text to to playagain button
    gameOverBtn.innerText = "PLAY AGAIN";

    gameOverBanner.appendChild(highScore);

    gameOverBanner.appendChild(gameOverBtn);

    //Making reload on clicking playagain Button
    gameOverBtn.onclick = () => {
        window.location.reload();
    };

    gameOverBanner.classList.add("gameover");

    document.querySelector("body").appendChild(gameOverBanner);
};

//-------------Create Player, Weapon, Enemy Classes---------------

// Setting playre position at center
playerPosition = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

// Main Player class
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        ); //Math.PI = 180 
        context.fillStyle = this.color;

        context.fill();
    }
}

// Shooting weapon class
class Weapon {
    constructor(x, y, radius, color, velocity, damage) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.damage = damage;
    }

    draw() {
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        ); //Math.PI = 180 degree
        context.fillStyle = this.color;
        context.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

// Special weapon class
class SpecialWeapon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = "red";
    }

    draw() {
        context.beginPath();
        context.fillStyle = this.color; // Beacause this was put after first one was coming white
        context.fillRect(this.x, this.y, 200, canvas.height);
        // context.fill(); and we don't need this then because fillrect is doing this
    }

    update() {
        this.draw();
        this.x += 20;
    }
}

// Enemy class

class Enemy {
    constructor(x, y, radius, ecolor, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = ecolor;
        this.velocity = velocity;
    }

    draw() {
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        ); //Math.PI = 180 degree
        context.fillStyle = this.color;
        context.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

// enemy-particle class
const friction = 0.97;
class Particle {
    constructor(x, y, radius, ecolor, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = ecolor;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        context.save();
        context.globalAlpha = this.alpha;

        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        ); //Math.PI = 180 degree
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}


// --------------Main Logic Start---------------------

// Creating Player Object, Weapons array, Enemy array, Etc.
const harsh = new Player(playerPosition.x, playerPosition.y, 30, "Red");
const weapons = []; // weapons array
const specialWeapons = []; // spcecialWeaponsArray
const enemies = []; // enemies array
const particles = [] // particles array

// Enemy spawn at random location function
const spawnEnemy = () => {

    // genrating random size size of enemy
    const enemySize = Math.random() * (40 - 5) + 5;

    // generating random color for enemy
    const enemyColor = `hsl(${Math.floor(Math.random() * 360)}, 100 %, 50 %)`;

    // random position where enemy spawn
    let random;

    // Making enemy location random but only from outside of screen
    if (Math.random() < 0.5) {
        // setting X equal to very left or very right and setting Y at any random vertically
        random = {
            x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
            y: Math.random() * canvas.height
        };
    } else {
        // setting Y equal to very top or to the bottom and setting X at any random position horizontally
        random = {
            x: Math.random() * canvas.width,
            y: Math.random() < 0.5 ? canvas.height + enemySize : 0 - enemySize,
        };
    }

    // FInding angle between center (menas Player position) and enemy position
    const myAngle = Math.atan2(
        canvas.height / 2 - random.y,
        canvas.width / 2 - random.x
    );

    // Setting speed of enemy according to the chosen difficulty
    const velocity = {
        x: Math.cos(myAngle) * difficulty,
        y: Math.sin(myAngle) * difficulty
    };

    // Adding enemy to enemies array
    let newEnemy = new Enemy(random.x, random.y, enemySize, enemyColor, velocity);
    enemies.push(newEnemy);
}

//-------------------------------------------- Creating animation function----------------------------------------------------
let animationId;
function animation() {
    // Making Recursive call
    animationId = requestAnimationFrame(animation);

    // Updating html score board
    scoreBoard.innerHTML = `Score: ${playerScore} `;


    // Clearing canvas on each frame
    context.fillStyle = 'rgba(49,49,49,0.2)'
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Drawing player
    harsh.draw();

    // Genrating particles 
    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1);
        } else {
            particle.update();
        }
    })


    // Genrating specialWeapon
    specialWeapons.forEach((specialWeapon, specialWeaponIndex) => {
        if (specialWeapon.x > canvas.width) {
            specialWeapons.splice(specialWeaponIndex, 1);
        } else {
            specialWeapon.update();
        }

    });

    // Generating shooting weapon bullets
    weapons.forEach((weapon, weaponIndex) => { // working wI ?? 
        weapon.update();


        // Removing weapons as they move out of the screen
        if (
            weapon.x + weapon.radius < 1 ||
            weapon.y + weapon.radius < 1 ||
            weapon.x - weapon.radius > canvas.width ||
            weapon.y - weapon.radius > canvas.height
        ) {
            weapons.splice(weaponIndex, 1);
        }
    });

    // Genrating enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        // Finding distance between Player and enemy
        const distanceBetweenPlayerAndEnemy = Math.hypot(
            harsh.x - enemy.x,
            harsh.y - enemy.y
        );

        // Stopping the game if enemy hits the player
        if (distanceBetweenPlayerAndEnemy - harsh.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId);
            gameOverSound.play();
            return gameoverLoader();
        }

        specialWeapons.forEach((specialWeapon) => {
            // Distance between specialWeapon and Enemy
            const distanceBetweenSpecialWeaponAndEnemy = specialWeapon.x - enemy.x;

            if (distanceBetweenSpecialWeaponAndEnemy <= 200 && distanceBetweenSpecialWeaponAndEnemy >= -200) {
                //increasing playerScore when killing enemy && removing enemy
                playerScore += 10;
                setTimeout(() => {
                    killEnemySound.play();
                    enemies.splice(enemyIndex, 1);
                }, 0)

            }
        })

        weapons.forEach((weapon, weaponIndex) => {

            //Finding distance between weapon and enemy
            const distanceBetweenWeaponAndEnemy = Math.hypot(
                weapon.x - enemy.x,
                weapon.y - enemy.y
            );
            if (distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {

                //Reducing size of enemy on hit if size is greater than 18
                if (enemy.radius > weapon.damage + 8) {
                    gsap.to(enemy, {
                        radius: enemy.radius - weapon.damage,
                    });
                    setTimeout(() => {
                        weapons.splice(weaponIndex, 1);
                    }, 0);
                }
                // Removing the enemies if size is less than 18
                else {
                    for (let i = 0; i < enemy.radius; i++) {
                        particles.push(new Particle(weapon.x, weapon.y, Math.random() * 2, enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 7),
                                y: (Math.random() - 0.5) * (Math.random() * 7),
                            })
                        );
                    }

                    //increasing playerScore when killing enemy && removing enemy and weapon both
                    playerScore += 10;

                    // Rendering plaer score board html element
                    scoreBoard.innerHTML = `Score: ${playerScore} `;

                    setTimeout(() => {
                        killEnemySound.play();
                        enemies.splice(enemyIndex, 1);
                        weapons.splice(weaponIndex, 1);
                    }, 0);
                }
            }
        })
    });
}

// ------------------------Adding event listener ---------------------------

// event  listener for Light weapon aka left click
canvas.addEventListener("click", (e) => {

    shootingSound.play();
    //finding angle between player position(center) and click co-ordinates
    const myAngle = Math.atan2(
        e.clientY - canvas.height / 2,
        e.clientX - canvas.width / 2
    );

    // Making const speed for light weapon 
    const velocity = {
        x: Math.cos(myAngle) * 7,
        y: Math.sin(myAngle) * 7,
    };

    // Adding light weapon in weapons array
    let weaponProjectile = new Weapon(canvas.width / 2, canvas.height / 2, 7, "white", velocity, lightWeaponDamage);
    weapons.push(weaponProjectile);
    // console.log('Light Weapon');
});

// event  listener for Heavy weapon aka right click
canvas.addEventListener("contextmenu", (e) => {

    e.preventDefault();

    if (playerScore <= 0) return;

    heavyWeaponSound.play();

    // Decreasing player score in html score board
    playerScore -= 2;
    // Updating html score board
    scoreBoard.innerHTML = `Score: ${playerScore} `;
    //finding angle between player position(center) and click co-ordinates
    const myAngle = Math.atan2(
        e.clientY - canvas.height / 2,
        e.clientX - canvas.width / 2
    );

    // Making const speed for light weapon 
    const velocity = {
        x: Math.cos(myAngle) * 4,
        y: Math.sin(myAngle) * 4,
    };

    // Adding light weapon in weapons array
    let weaponProjectile = new Weapon(canvas.width / 2, canvas.height / 2, 15, "white", velocity, heavyWeaponDamage);
    weapons.push(weaponProjectile);
    // console.log('Heelo');
});

window.addEventListener("keypress", (e) => {
    if (e.key === " ") {
        if (playerScore <= 30) return;

        specialWeaponSound.play();
        // Decreasing player score in html score board
        playerScore -= 30;
        // Updating html score board
        scoreBoard.innerHTML = `Score: ${playerScore} `;

        let specialWeapon = new SpecialWeapon(0, 0);
        specialWeapons.push(specialWeapon);
    }
});

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

addEventListener("resize", () => {
    window.location.reload();
})

animation();