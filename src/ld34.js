/**
 * ld34.js
 *
 * Marcel Baarsch
 * github.com/dmitrix
 *
 * Entry for Ludum Dare 34.
 */

var game = new Phaser.Game(
  700, 700,
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
var SCALE_RATE = 0.001;  // How fast the player looses mass
var SCALE_MIN = 0.01;    // Burn out Point
var SCALE_MAX = 1;       // Black Hole Point
var MASS_MARGIN_X = 30;  // The closest mass can spawn to the edge
var MASS_MARGIN_Y = 30;  // " (measured in px)

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

var mainText;

var emitter;

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

  /**
   * Create Mass (behind player)
   */
  randomX = Math.floor(Math.random() * game.width);
  randomY = Math.floor(Math.random() * game.height);

  mass = game.add.sprite(randomX, randomY, "mass-blue");
  mass.anchor.setTo(0.5);
  game.physics.enable(mass, Phaser.Physics.ARCADE);
  mass.body.collideWorldBounds = false;
  mass.body.bounce.set(1);
  mass.body.immovable = true;

  mass.scale.setTo(mScale, mScale);

  /**
   * Create Pink Mass
   */
  randomX = Math.floor(Math.random() * game.width);
  randomY = Math.floor(Math.random() * game.height);

  massPink = game.add.sprite(randomX, randomY, "mass-pink");
  massPink.anchor.setTo(0.5);
  game.physics.enable(massPink, Phaser.Physics.ARCADE);
  massPink.body.collideWorldBounds = false;
  massPink.body.bounce.set(1);
  massPink.body.immovable = true;

  massPink.scale.setTo(mpScale, mpScale);

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
    massRespawn();
    //growing();
  }, this);



  //game.add.tween(player.scale).to( { x: 3, y: 3 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

function update(){

  /**
   * Scale Player
   */
  player.scale.setTo(pScale, pScale);

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
      player.body.velocity.x = TOP_SPEED;
  }
  else if (cursors.left.isDown) // Accelerate Left
  {

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
     player.body.velocity.y = TOP_SPEED;
 }
 else if (cursors.up.isDown) // Accelerate Left
 {
     player.body.velocity.y = -TOP_SPEED;
 }
 else
   player.body.velocity.y = 0;


  /**
   * Player Respawn X-Axis
   */
  if (player.x >= game.width + playerR) // Right
    player.x = -playerR ;
  else if (player.x <= - playerR) // Left
    player.x = game.width + playerR;

  /**
   * Player Respawn Y-Axis
   */
  if (player.y >= game.height + playerR) // Right
    player.y = -playerR;
  else if (player.y <= -playerR) // Left
    player.y = game.height + playerR;

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



  /**
   * Player <-> Mass Collision
   */
  if (player.x > mass.x - (mRadius * mScale) && player.x < mass.x + (mRadius * mScale))
  {
    if (player.y > mass.y - (mRadius * mScale) && player.y < mass.y + (mRadius * mScale))
    {
      massRespawn();
      growing();
      score++;
      scoreText.text = '' + score;
    }
  }

  /**
   * Game Over
   */
  if (pScale <= SCALE_MIN)
    gm();

}

var initGM = true;

function gm()
{
  if (initGM)
  {
    player.kill();
    particleBurst(player.x, player.y);
    mainText.visible = true;
    gameOver = true;
  }
 initGM = false;
}

function particleBurst(x, y){
  emitter.x = x;
  emitter.y = y;

  emitter.start(true, 20000, null, 50);
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

}

function growing(){
  pScale += mGrowth;
  console.log("GROWING");
}
