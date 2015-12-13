/**
 * ld34.js
 *
 * Marcel Baarsch
 * github.com/dmitrix
 *
 * Entry for Ludum Dare 34.
 */

var game = new Phaser.Game(
  window.innerWidth-50, window.innerHeight-50,
  Phaser.AUTO,
  "ld34",
  {
    preload: preload,
    create: create,
    update: update,
  }
);

/**
 * STATIC_VARIABLES
 */
var SLIPPERYNESS = 10;   // smaller number 'slips' more
var TOP_SPEED = 400;     // The fastest the player can move
var SCALE_RATE = 0.002;  // How fast the player looses mass
var SCALE_MIN = 0.01;    // Burn out Point
var SCALE_MAX = (window.innerWidth-50) / (75/2);       // Black Hole Point
var MASS_MARGIN_X = 30;  // The closest mass can spawn to the edge
var MASS_MARGIN_Y = 30;  // " (measured in px)

console.log('SCALE_MAX:' + SCALE_MAX);

/**
 * dynamicVariables
 */
var mass;                // Random Spawn, Consumed by player
var mScale = 0.8;        // Mass size
var mGrowth = 0.08;       // Amount of mass player gains when consumed
var mRadius = 75/2;      // multiply by mScale to get true radius

var massPink;
var mpScale = 1;
var mpGrowth = 0.2;
var mpRadius = 74/2;

var player;              // User Controlled
var playerR = 350;       // multiply by pScale to get true radius
var pScale = 0.25;        // Starting scale (1 = Full Width of Screen)

var randomX;             // For random x coord gen
var randomY;             // For random y coord gen

var gameOver = false;

var spaceBar;
var score = 0;
var scoreText;

var introText0;
var introText1;
var introText2;
var introText3;
var introText4;

var mainText;

var emitter;
var orangeEmitter;

var gameStarted = false;

/**
 * Mass Color Key
 *
 * blue:  small-growth
 * green: big-growth
 * pink:  shrink
 */

function preload(){
  /* Load Player */
  game.load.image("player", "res/bigplayer.png");

  /* Load Masses */
  game.load.image("mass-blue", "res/mass-blue.png");
  //game.load.image("mass-green", "res/mass-green.png");
  game.load.image("mass-pink", "res/mass-pink.png");

  /* Load Particles */
  game.load.image("particle-orange", "res/particle-orange.png");
  game.load.image("particle-blue", "res/particle-blue.png");
  game.load.image("particle-pink", "res/particle-pink.png");

  /* Load Black Hole */
  game.load.image("blackhole", "res/blackhole.png");


}

function create(){

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;

  game.stage.backgroundColor = '#1a0d22';

  /**
   * Particle Fun
   */
  emitter = game.add.emitter(0,0,100);
  emitter.makeParticles('particle-orange');
  emitter.gravity = 0;

  blueEmitter = game.add.emitter(0,0,100);
  blueEmitter.makeParticles('particle-blue');
  blueEmitter.gravity = 0;

  pinkEmitter = game.add.emitter(0,0,100);
  pinkEmitter.makeParticles('particle-pink');
  pinkEmitter.gravity = 0;

  /**
   * Create Player
   */
  player = game.add.sprite(game.world.centerX, game.world.centerY, "player");
  player.anchor.setTo(0.5, 0.5);
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.collideWorldBounds = false;
  player.body.bounce.set(1);
  player.body.immovable = true;

  player.setScaleMinMax(SCALE_MIN, SCALE_MIN, SCALE_MAX, SCALE_MAX);

  orangeEmitter = game.add.emitter(0,0,100);
  orangeEmitter.makeParticles('particle-orange');
  orangeEmitter.gravity = 0;

  orangeEmitter.x = player.x;
  orangeEmitter.y = player.y;
  orangeEmitter.setXSpeed(-100, 100);
  orangeEmitter.setYSpeed(-100, 100);

  orangeEmitter.start(false, 2000, 250);

  /**
   * Create Mass (behind player)
   */
  //randomX = Math.floor(Math.random() * game.width);
  //randomY = Math.floor(Math.random() * game.height);

  mass = game.add.sprite(game.width / 2, game.height / 2 + 250, "mass-blue");
  mass.anchor.setTo(0.5);
  game.physics.enable(mass, Phaser.Physics.ARCADE);
  mass.body.collideWorldBounds = false;
  mass.body.bounce.set(1);
  mass.body.immovable = true;

  mass.scale.setTo(mScale, mScale);

  //mass.body.velocity.x = Math.floor(Math.random() * 50)+50;
  //mass.body.velocity.y = Math.floor(Math.random() * 50)+50;

  /**
   * Create Pink Mass
   */
  //randomX = Math.floor(Math.random() * game.width);
  //randomY = Math.floor(Math.random() * game.height);

  massPink = game.add.sprite(game.width / 2, game.height / 2 + 150, "mass-pink");
  massPink.anchor.setTo(0.5);
  game.physics.enable(massPink, Phaser.Physics.ARCADE);
  massPink.body.collideWorldBounds = false;
  massPink.body.bounce.set(1);
  massPink.body.immovable = true;

  massPink.scale.setTo(mpScale, mpScale);



  introText0 = game.add.text(game.width / 2, game.height/ 2 -150, 'Welcome!');
  introText0.anchor.set(0.5);
  introText0.align = 'center';
  introText0.font = 'Arial';
  introText0.fontWeight = 'bold';
  introText0.fontSize = 62;
  introText0.fill = "#ffffff";

  introText1 = game.add.text(game.width / 2 + 220, game.height/ 2, 'You are this star');
  introText1.anchor.set(0.5);
  introText1.align = 'center';
  introText1.font = 'Arial';
  introText1.fontWeight = 'bold';
  introText1.fontSize = 32;
  introText1.fill = "#ffffff";
  introText1.visible = false;

  introText2 = game.add.text(game.width / 2-125, game.height/ 2 + 150, 'Consume');
  introText2.anchor.set(0.5);
  introText2.align = 'center';
  introText2.font = 'Arial';
  introText2.fontWeight = 'bold';
  introText2.fontSize = 32;
  introText2.fill = "#ffffff";
  introText2.visible = false;

  introText3 = game.add.text(game.width / 2+125, game.height/ 2 + 250, 'Masses');
  introText3.anchor.set(0.5);
  introText3.align = 'center';
  introText3.font = 'Arial';
  introText3.fontWeight = 'bold';
  introText3.fontSize = 32;
  introText3.fill = "#ffffff";
  introText3.visible = false;

  introText4 = game.add.text(game.width / 2, game.height/ 2 + 350, 'To Grow');
  introText4.anchor.set(0.5);
  introText4.align = 'center';
  introText4.font = 'Arial';
  introText4.fontWeight = 'bold';
  introText4.fontSize = 32;
  introText4.fill = "#ffffff";
  introText4.visible = false;

  introText5 = game.add.text(game.width/2, game.height / 2-300, 'Don\'t get too big or small!');
  introText5.anchor.set(0.5);
  introText5.align = 'center';
  introText5.font = 'Arial';
  introText5.fontWeight = 'bold';
  introText5.fontSize = 52;
  introText5.fill = "#ffffff";
  introText5.visible = false;



  /**
   * Score Text
   */
  scoreText = game.add.text(game.width-10, 10, '' + score);
  scoreText.anchor.set(1,0);
  scoreText.align = 'right';
  scoreText.font = 'Arial';
  scoreText.fontWeight = 'bold';
  scoreText.fontSize = 32;
  scoreText.fill = "#ffffff";

  /**
   * Main Text
   */
  mainText = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER');
  mainText.anchor.set(0.5,0.5);
  mainText.align = 'center';
  mainText.font = 'Arial';
  mainText.fontWeight = 'bold';
  mainText.fontSize = 52;
  mainText.fill = '#ffffff';
  mainText.visible = false;



  /**
   * Arrow Key Controls
   */
  cursors = this.input.keyboard.createCursorKeys();

  /**
   * Hacks for cheating and testing
   */

  spaceBar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  spaceBar.onDown.add(function(key)
  {
    if (!gameStarted)
    {

    spaceCount++;

    if (spaceCount > 5)
    {
      gameStarted = true;
      introText0.visible = false;
      introText1.visible = false;
      introText2.visible = false;
      introText3.visible = false;
      introText4.visible = false;
      introText5.visible = false;
      massPink.body.velocity.x = 50;
      massPink.body.velocity.y = 50;
      mass.body.velocity.x = -50;
      mass.body.velocity.y = -50
    }



    switch(spaceCount)
    {
      case 1:
        introText1.visible = true;
        break;
      case 2:
        introText2.visible = true;
        break;
      case 3:
        introText3.visible = true;
        break;
      case 4:
        introText4.visible = true;
        break;
      case 5:
        introText5.visible = true;
        //game.add.tween(introText5).to( { y: game.height - 40 }, 2400, Phaser.Easing.Bounce.Out, true);
        break;
    }


  }
  }, this);



  //game.add.tween(player.scale).to( { x: 3, y: 3 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

var spaceCount = 0;

function update(){

  /**
   * Scale Player
   */
  player.scale.setTo(pScale, pScale);

  if (!gameOver && gameStarted){

  if (pScale > SCALE_MIN)
    pScale-=SCALE_RATE;

  /**
   * Player Motion X-Axis
   */
  if (player.body.velocity.x > 0 && !cursors.right.isDown && !cursors.left.isDown) // -Accelerate Right
    player.body.velocity.x -= SLIPPERYNESS;
  else if (player.body.velocity.x < 0 && !cursors.left.isDown && !cursors.right.isDown) // -Accelerate left
    player.body.velocity.x += SLIPPERYNESS;
  else if (cursors.right.isDown) // Accelerate Right
  {
      if (player.body.velocity.x < TOP_SPEED)
        player.body.velocity.x += 50;
      else
        player.body.velocity.x = TOP_SPEED;
  }
  else if (cursors.left.isDown) // Accelerate Left
  {

      if (player.body.velocity.x > -TOP_SPEED)
        player.body.velocity.x -= 50;
      else
        player.body.velocity.x = -TOP_SPEED;
  }
  else
    player.body.velocity.x = 0;


  /**
   * Player Motion Y-Axis
   */
  if (player.body.velocity.y > 0 && !cursors.down.isDown && !cursors.up.isDown) // -Accelerate Down
   player.body.velocity.y -= SLIPPERYNESS;
 else if (player.body.velocity.y < 0 && !cursors.up.isDown && !cursors.down.isDown) // -Accelerate left
   player.body.velocity.y += SLIPPERYNESS;
 else if (cursors.down.isDown) // Accelerate Right
 {
     if (player.body.velocity.y < TOP_SPEED)
       player.body.velocity.y += 50;
     else
       player.body.velocity.y = TOP_SPEED;
 }
 else if (cursors.up.isDown) // Accelerate Left
 {
     if (player.body.velocity.y > -TOP_SPEED)
       player.body.velocity.y -= 50;
     else
       player.body.velocity.y = -TOP_SPEED;
 }
 else
   player.body.velocity.y = 0;


  /**
   * Player ~~Respawn~~ (boundry) X-Axis
   */
  if (player.x >= game.width) // Right
    player.x = game.width;
  else if (player.x <= 0) // Left
    player.x = 0;

  /**
   * Player ~~Respawn~~ (boundry) Y-Axis
   */
  if (player.y >= game.height) // Bottom
    player.y = game.height;
  else if (player.y <= 0) // Top
    player.y = 0;

  /**
   * Respawn Mass
   */
  if (mass.x > game.width + (mRadius * mScale))
    massRespawn();
  else if (mass.x < 0 - (mRadius * mScale))
    massRespawn();

  if (mass.y > game.height + (mRadius * mScale))
    massRespawn();
  else if (mass.y < 0 - (mRadius * mScale))
    massRespawn();

  /**
   * Respawn Pink Mass
   */
  if (massPink.x > game.width + (mRadius * mScale))
    mpRespawn();
  else if (massPink.x < 0 - (mRadius * mScale))
    mpRespawn();

  if (massPink.y > game.height + (mRadius * mScale))
    mpRespawn();
  else if (massPink.y < 0 - (mRadius * mScale))
    mpRespawn();

  console.log('pScale: ' + pScale);


  /**
   * player <-> mass Collision
   */
  if (mass.x > player.x - (playerR * pScale) && mass.x < player.x + (playerR * pScale))
  {
    if (mass.y > player.y - (playerR * pScale) && mass.y < player.y + (playerR * pScale))
    {
      massRespawn();
      growing(mGrowth);
      score++;
      scoreText.text = '' + score;
    }
  }

  /**
   * player <-> pinkMass Collision
   */
   if (massPink.x > player.x - (playerR * pScale) && massPink.x < player.x + (playerR * pScale))
   {
     if (massPink.y > player.y - (playerR * pScale) && massPink.y < player.y + (playerR * pScale))
     {
       mpRespawn();
       growing(mpGrowth);
       score++;
       scoreText.text = '' + score;
     }
   }

   /**
    * Player emitter
    */
   orangeEmitter.x = player.x;
   orangeEmitter.y = player.y;

 }
 else
 {


 }

  /**
   * Game Over
   */
  if (pScale <= SCALE_MIN)
    gm(false);

  if (pScale >= SCALE_MAX)
    gm(true);

}

var initGM = true;

function gm(blackhole)
{

  if (!blackhole)
  {
    if (initGM)
    {
      pScale = 0.1;
      player.kill();
      particleBurst(player.x, player.y);
      mainText.visible = true;
      gameOver = true;
      orangeEmitter.kill();
      orangeEmitter.destroy();
    }
  }
  else
  {
    if (initGM)
    {
      pScale = 0.1;
      player.kill();
      mainText.visible = true;
      gameOver = true;
      massPink.kill();
      mass.kill();
    }
  }
 initGM = false;

}

function particleBurst(x, y){
  emitter.x = x;
  emitter.y = y;

  emitter.start(true, 0, null, 50);
}



var randomVelocityX;
var randomVelocityY=0;
var invertVelocityX = false;
var invertVelocityY = false;

function massRespawn(){
  blueEmitter.x = mass.x;
  blueEmitter.y = mass.y;
  blueEmitter.start(true, 2000, null, 30);

  randomX = Math.floor(Math.random() * game.width);
  randomY = Math.floor(Math.random() * game.height);

  if (!invertVelocityX)
    randomVelocityX = Math.floor(Math.random() * 100)+40;
  else
    randomVelocityX = -Math.floor(Math.random() * 100);

  if (!invertVelocityY)
    randomVelocityY = Math.floor(Math.random() * 100);
  else
    randomVelocityY = -Math.floor(Math.random() * 100);


  mass.x = randomX;
  mass.y = randomY;
  mass.body.velocity.x = randomVelocityX;
  mass.body.velocity.y = randomVelocityY;

  invertVelocityX = !invertVelocityX;
  invertVeloictyY = !invertVelocityY;
}

function mpRespawn()
{

  pinkEmitter.x = massPink.x;
  pinkEmitter.y = massPink.y;
  pinkEmitter.start(true, 2000, null, 30);


  randomX = Math.floor(Math.random() * game.width);
  randomY = Math.floor(Math.random() * game.height);

  if (!invertVelocityX)
    randomVelocityX = Math.floor(Math.random() * 100)+40;
  else
    randomVelocityX = -Math.floor(Math.random() * 100);

  if (!invertVelocityY)
    randomVelocityY = Math.floor(Math.random() * 100);
  else
    randomVelocityY = -Math.floor(Math.random() * 100);


  massPink.x = randomX;
  massPink.y = randomY;
  massPink.body.velocity.x = randomVelocityX;
  massPink.body.velocity.y = randomVelocityY;

  invertVelocityX = !invertVelocityX;
  invertVeloictyY = !invertVelocityY;
}

function growing(growthAmount){
  pScale += growthAmount;

}

function resizeGame() {
  var height = window.innerHeight;
  var width = window.innerWidth;

  game.width = width;
  game.height = height;
  game.stage.width = width;
  game.stage.height = height;

  if (game.renderType === Phaser.WEBGL)
  {
      game.renderer.resize(width, height);
  }
}
