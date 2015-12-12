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
var mGrowth = 0.05;       // Amount of mass player gains when consumed
var mRadius = 75/2;      // multiply by mScale to get true radius

var player;              // User Controlled
var playerR = 350;       // multiply by pScale to get true radius
var pScale = 0.25;        // Starting scale (1 = Full Width of Screen)

var randomX;             // For random x coord gen
var randomY;             // For random y coord gen

var spaceBar;

function preload(){
  game.load.image("player", "res/bigplayer.png");
  game.load.image("mass", "res/consumableMass.png");
}

function create(){
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;

  game.stage.backgroundColor = '#1a0d22';

  /**
   * Create Mass (behind player)
   */
  randomX = Math.floor(Math.random() * game.width);
  randomY = Math.floor(Math.random() * game.height);

  mass = game.add.sprite(randomX, randomY, "mass");
  mass.anchor.setTo(0.5);
  game.physics.enable(mass, Phaser.Physics.ARCADE);
  mass.body.collideWorldBounds = true;
  mass.body.bounce.set(1);
  mass.body.immovable = true;

  mass.scale.setTo(mScale, mScale);

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
   * Player <-> Mass Collision
   */
  if (player.x > mass.x - (mRadius * mScale) && player.x < mass.x + (mRadius * mScale))
  {
    if (player.y > mass.y - (mRadius * mScale) && player.y < mass.y + (mRadius * mScale))
    {
      massRespawn();
      growing();
    }
  }

}

function massRespawn(){
  randomX = Math.floor(Math.random() * game.width);
  randomY = Math.floor(Math.random() * game.height);

  mass.x = randomX;
  mass.y = randomY;
}

function growing(){
  pScale += mGrowth;
  console.log("GROWING");
}
