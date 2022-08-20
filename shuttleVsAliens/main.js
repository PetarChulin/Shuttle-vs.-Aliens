let start = document.querySelector('.game-start');
let area = document.querySelector('.game-area');
let info = document.querySelector('.game-info');
let gameOver = document.querySelector('.game-over');
let gameScore = document.querySelector('.game-score');
let gamePoints = document.querySelector('.points');
let controls = document.querySelector('.controls');

start.addEventListener('click', onGameStart);
gameOver.addEventListener('click', onGameStart);


let shuttle;
let ufo;
let gray;

let keys = {};
let player = {
    x: 15,
    y: 300,
    width: 0,
    height: 0,
    lastFired: 0
};
let game = {
    speed: 1,
    fireInterval: 500,
    starsInterval: 6000,
    ufosInterval: 1500,
    grayInterval: 10000,
    planetInterval: 20000,
    solarInterval: 30000
};
let scene = {
    score: 500,
    lastUfoSpawn: 0,
    lastStarSpawn: 0,
    lastGraySpawn: 0,
    lastPlanetSpawn: 0,
    lastSolarSpawn: 0,
    activeGame: true,
    ufoKillScore: 100,
    ufoKillsCount: 0,
    grayKillsCount: 0,
    grayBlood: 5
};

function onGameStart() {
    scene.activeGame = true;
    area.classList = 'game-area';
    shuttle = document.createElement('div');
    start.classList = 'hide';
    gameOver.classList = 'hide';
    controls.classList = 'hide';
    setTimeout(function () {info.classList = 'hide'}, 3000);
    scene.score = 500;
    scene.ufoKillsCount = 0;
    scene.grayKillsCount = 0;
    shuttle.classList = 'shuttle';
    shuttle.style.top = player.y + 'px';
    shuttle.style.left = player.x + 'px';
    area.appendChild(shuttle);

    player.width = shuttle.offsetWidth + 7;
    player.height = shuttle.offsetHeight + 7;

    window.requestAnimationFrame(action);
   
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function onKeyDown(e) {
    keys[e.code] = true;
}
function onKeyUp(e) {
    keys[e.code] = false;
}
function action(timestamp) { 

    scene.score >= 2000 ? (game.speed = 4 , area.classList = 'game-area2') : game.speed = 2;  

    keys.ArrowUp && player.y > 0 ? player.y -= game.speed * 10 : null;
    keys.ArrowDown && player.y + player.height < area.offsetHeight ? player.y += game.speed * 10 : null;
    keys.ArrowLeft && player.x > 0 ? player.x -= game.speed * 10 : null;
    keys.ArrowRight && player.x + player.width < area.offsetWidth ? player.x += game.speed * 10 : null;

    keys.Space && timestamp - player.lastFired > game.fireInterval 
        ? (shuttle.classList.add('shuttle-fire'), shot(player), player.lastFired = timestamp)
        : shuttle.classList.remove('shuttle-fire');

    // bangs
    let bangs = document.querySelectorAll('.bang'); 
    bangs.forEach(bang => {
        bang.x += game.speed * 10;
        bang.style.left = player.x + shuttle.offsetWidth + bang.x + 'px';
        bang.style.right = player.x + shuttle.offsetWidth + bang.x + 'px';

        bang.x + bang.offsetWidth / 2 > (area.offsetWidth - 2) - player.x ? area.removeChild(bang) : null;
    });

    // ufos
    if (timestamp - scene.lastUfoSpawn > game.ufosInterval + 40000 * Math.random()) {
        ufo = document.createElement('div');
        ufo.classList.add('ufo');
        ufo.x = area.offsetWidth - 80; 
        ufo.style.left = ufo.x + 'px';
        ufo.style.top = (area.offsetHeight - 80) * Math.random() + 'px';

        area.appendChild(ufo);
        scene.lastUfoSpawn = timestamp;
    }

    let ufos = document.querySelectorAll('.ufo');
    ufos.forEach(ufo => {
        ufo.x -= game.speed;
        ufo.style.left = ufo.x + 'px';

        ufo.x + (ufo.offsetWidth / 10) <= 0 ? (area.removeChild(ufo), gameOverAction()) : null;
    });

    ufos.forEach(ufo => {
        collision(shuttle, ufo) ? scene.score -= 10 : null;
        scene.score < 0 ? (gameOverAction()) : null;

        bangs.forEach(bang => {
            collision(bang, ufo) ? (area.removeChild(ufo), area.removeChild(bang), scene.ufoKillsCount++,
                scene.score += scene.ufoKillScore) : null;
        });

    });

    // stars
    if (timestamp - scene.lastStarSpawn > game.starsInterval + 80000 * Math.random()) {
        let star = document.createElement('div');
        star.classList.add('star');
        star.x = area.offsetWidth - 60;
        star.style.left = star.x + 'px';
        star.style.top = (area.offsetHeight - 60) * Math.random() + 'px';

        area.appendChild(star);
        scene.lastStarSpawn = timestamp;

    }
    let stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.x -= game.speed;
        star.style.left = star.x + 'px';
        collision(shuttle, star) ? (scene.score += 50, star.parentElement.removeChild(star)) : null;

        star.x + star.offsetWidth <= 0 ? star.parentElement.removeChild(star) : null;
    });
    // planets
    if (timestamp - scene.lastPlanetSpawn > game.planetInterval + 80000 * Math.random()) {
        let planet = document.createElement('div');
        planet.classList.add('planet');
        planet.x = area.offsetWidth - 64;
        planet.style.left = planet.x + 'px';
        planet.style.top = (area.offsetHeight - 64) * Math.random() + 'px';

        area.appendChild(planet);
        scene.lastPlanetSpawn = timestamp;

    }
    let planets = document.querySelectorAll('.planet');
    planets.forEach(planet => {
        planet.x -= game.speed;
        planet.style.left = planet.x + 'px';
        collision(shuttle, planet) ? gameOverAction() : null;

        planet.x + planet.offsetWidth / 10 <= 0 ? planet.parentElement.removeChild(planet) : null;
    });
    //solar
    if (timestamp - scene.lastSolarSpawn > game.solarInterval + 80000 * Math.random()) {
        let solar = document.createElement('div');
        solar.classList.add('solar');
        solar.x = area.offsetWidth - 64;
        solar.style.left = solar.x + 'px';
        solar.style.top = (area.offsetHeight - 64) * Math.random() + 'px';

        area.appendChild(solar);
        scene.lastSolarSpawn = timestamp;

    }
    let solars = document.querySelectorAll('.solar');
    solars.forEach(solar => {
        solar.x -= game.speed;
        solar.style.left = solar.x + 'px';
        collision(shuttle, solar) ? gameOverAction() : null;

        solar.x + solar.offsetWidth / 10 <= 0 ? solar.parentElement.removeChild(solar) : null;
    });

    // gray
    if (timestamp - scene.lastGraySpawn > game.grayInterval + 80000 * Math.random()) {
        gray = document.createElement('div')
        gray.classList.add('gray');
        scene.grayBlood == 0 ? scene.grayBlood = 5 : null;
        gray.x = area.offsetWidth - 200;
        gray.style.left = gray.x + 'px';
        gray.style.top = (area.offsetHeight - 200) * Math.random() + 'px';
        gray.textContent = 'hit me 5 times';

        setTimeout(function () {
            gray.textContent = '';
        }, 5000);

        setTimeout(function () {
            gray.remove();
        }, 10000);
        area.appendChild(gray);
        scene.lastGraySpawn = timestamp;
    }

    let grays = document.querySelectorAll('.gray');

    grays.forEach(gray => {
        gray.x -= game.speed / 2;
        gray.style.left = gray.x + 'px';
        collision(gray, shuttle) ? gameOverAction() : null;

        bangs.forEach(bang => {
            collision(bang, gray) ? (area.removeChild(bang), scene.grayBlood--, gray.innerHTML = `hits remaining` + `<br>` + scene.grayBlood,
                scene.score += 100) : null;
            scene.grayBlood <= 0 ? (gray.parentElement.removeChild(gray), scene.grayKillsCount++) : null;
        });
    });

    shuttle.style.top = player.y + 'px';
    shuttle.style.left = player.x + 'px';

    
    gamePoints.textContent = scene.score;

   scene.activeGame ? window.requestAnimationFrame(action) : null;

}

function shot(player) {
    let bang = document.createElement('div');
    bang.classList.add('bang');
    bang.style.top = (player.y + player.height / 3) + 'px';
    bang.x = 7;
    bang.style.left = bang.x + 'px';
    area.appendChild(bang);
}


function collision(first, second) { 
    let firstRect = first.getBoundingClientRect();
    let secondRect = second.getBoundingClientRect();

    return !(firstRect.top > secondRect.bottom 
        || firstRect.bottom < secondRect.top 
        || firstRect.right < secondRect.left
        || firstRect.left > secondRect.right);
}
function gameOverAction() {
    scene.score = 0;
    game.speed = 0;
    scene.grayBlood = 5;
    scene.activeGame = false;
    gameOver.classList.remove('hide');
    gameOver.className = 'game-over';
    gameOver.innerHTML = `Game Over ;( Ufos killed: ${scene.ufoKillsCount}` + `<br>` + `Grays killed: ${scene.grayKillsCount}`;

    setTimeout(function () { gameOver.textContent = 'Play again ?', gameOver.style = 'background-color: rgb(255, 165, 0)' }, 4000);

    player.x = 15;
    player.y = 300;

    area.removeChild(shuttle);
    let ufos = document.querySelectorAll('.ufo');
    remove(ufos);
    let grays = document.querySelectorAll('.gray');
    remove(grays);
    let planets = document.querySelectorAll('.planet');
    remove(planets);
    let solars = document.querySelectorAll('.solar');
    remove(solars);
    let stars = document.querySelectorAll('.star');
    remove(stars);

    function remove(elements) {
        elements.forEach(element => {
            element.remove()
        });
    }
}

