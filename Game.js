// Created By Joseph Shihab Esmaail
Scene.Game = function(game) { };
Scene.Game.prototype = {	

	create: function() {
		this.background = this.add.sprite(0,0, 'space');
		this.game.physics.enable(this.background, Phaser.Physics.ARCADE);
		this.background.checkWorldBounds = true;
		this.background.outOfBoundsKill = true;
		this.spaceScroll = this.game.add.group();
		this.scrollBuffer = 0;
		this.background.body.velocity.y = 200;
		this.scrolling();	
		
		//Gamepad test
		this.game.input.gamepad.start();
		this.pad1 = this.game.input.gamepad.pad1;
		
		//Audio
		this.music = this.game.add.audio('gameMusic'); 
		this.music.loop = true;
		this.music.play();
		this.fire_sound = this.game.add.audio('fire'); //
		this.death_sound = this.game.add.audio('death'); //
		this.hit_sound = this.game.add.audio('hit'); //
		this.explode_sound = this.game.add.audio('explode'); //
		this.powerup_sound = this.game.add.audio('powerup'); //
		this.shieldActivate = this.game.add.audio('shieldActivate'); //
		this.deflect_sound = this.game.add.audio('deflect');
		
		this.spriteScale = 0.2;
		this.fireTimer = 0;
		this.scoreTimer = 0;
		this.score = -1;
		this.ammunition = 30;		
		this.destroyed = false;
		this.deathBuffer = 0;
		this.end = false;
		
		//Asteroid Spawning
		this.spawnX = 0;
		this.spawnY = 20;		
		this.experimental = this.game.state.states['Preloader'].testMode;
		
		//Powerups!
		this.shieldOnline = false;
		this.shieldTimer = 0;
		this.doubleTimer = 0;
	
		//Physics system
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		//Text displays
		this.ammoCount = this.game.add.text(30, 30, "Ammo: "+ this.ammunition , {font: "15px Arial", fill: '#fff' });
		this.scoreText = this.game.add.text(290, 30, "Score: " + this.score , {font: "15px Arial", fill: '#fff' });	
		this.powerText = this.game.add.text(125, 30, "" , {font: "15px Arial", fill: '#ff0000' });		
		
		//Player Sprite
		this.player = this.game.add.sprite(200, 540, "ship");
		this.player.anchor.set(0.5, 0);
		this.player.scale.x = this.spriteScale;
		this.player.scale.y = this.spriteScale;
		this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
		this.player.body.collideWorldBounds = true;
		
		//Shield Sprite
		this.shield = this.game.add.sprite (this.player.body.x, this.player.body.y - 10, 'shield');
		this.shield.anchor.set(0.5, 0);
		this.shield.scale.x = this.spriteScale;
		this.shield.scale.y = this.spriteScale;
		this.game.physics.enable(this.shield, Phaser.Physics.ARCADE);
		this.shield.exists = false;
		
		//Game Input
		this.game.input.addPointer();
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
		this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);

		this.asteroids = this.game.add.group();
		this.bigAsteroids = this.game.add.group();
		this.bullets = this.game.add.group();
		this.explosions = this.game.add.group();
		this.shieldPowers = this.game.add.group();
		this.doublePowers = this.game.add.group();
		this.ammoPowers = this.game.add.group();		
	},	
	
	update: function(){
		this.scrolling();
		this.ammoCount.setText("Ammo: " + this.ammunition);
		this.scoreText.setText("Score: " + this.score);

		if(this.game.time.now > this.scoreTimer){
			this.scoreTimer = this.game.time.now + 1000;
			this.score += 1;
		}

		this.player.body.velocity.x = 0;
		this.player.body.y = 540;
		
		this.endingHandler();
		this.shieldSystem();
		this.spawnAsteroids();			
		this.collisionDetection();		
	},

	endingHandler: function(){
		if(!this.destroyed){
			if(this.cursors.left.isDown){
				this.player.body.velocity.x = -350;
			}else if(this.cursors.right.isDown){
				this.player.body.velocity.x = 350;
			}		
			if(this.cursors.up.isDown){
				if(this.fireTimer < this.game.time.now){
					this.fire();
				}
			}			
			if(this.game.input.activePointer.isDown){
				this.touchControls();
			}
			this.gamepadControls();
		}else{
			if(this.end == false){
				this.end = true;
				this.deathBuffer = this.game.time.now + 500;
			}
		}
		if(this.end && this.deathBuffer < this.game.time.now){
			this.game.state.start('Death');
		}
	},

	collisionDetection: function(){
		if(this.shield.exists){
			this.game.physics.arcade.collide(this.shield, this.asteroids, this.shieldCollision, null, this);
			this.game.physics.arcade.collide(this.shield, this.bigAsteroids, this.shieldCollision, null, this);
		}else{
			this.game.physics.arcade.collide(this.player, this.asteroids, this.shipCollision, null, this);
			this.game.physics.arcade.collide(this.player, this.bigAsteroids, this.shipCollision, null, this);
		}			
		this.game.physics.arcade.collide(this.bullets, this.asteroids, this.bulletCollision, null, this);
		this.game.physics.arcade.collide(this.bullets, this.bigAsteroids, this.damageBigAsteroid, null, this);
		this.game.physics.arcade.collide(this.player, this.shieldPowers, this.shieldPowerUp, null, this);
		this.game.physics.arcade.collide(this.player, this.doublePowers, this.doubleFireMode, null, this);
		this.game.physics.arcade.collide(this.player, this.ammoPowers, this.gainAmmo, null, this);
		this.game.physics.arcade.collide(this.explosions, this.asteroids, this.bulletCollision, null, this);
		this.game.physics.arcade.collide(this.explosions, this.bigAsteroids, this.bulletCollision, null, this);
	},

	scrolling: function(){
		if(this.spaceScroll.countLiving() < 5 && this.scrollBuffer < this.game.time.now){
			this.space = this.spaceScroll.create(0, 0, 'space');
			this.space.anchor.set(0, 1);
			this.game.physics.enable(this.space, Phaser.Physics.ARCADE);
			this.space.body.velocity.y = 200;
			this.space.checkWorldBounds = true;
			this.space.outOfBoundsKill = true;
			this.scrollBuffer = this.game.time.now + 1500;
		}
	},
	
	touchControls: function(){
		if(this.input.pointer1.y < this.player.y){
		
			if(this.fireTimer < this.game.time.now){
				this.fire();
			}			
		}else if(this.input.pointer1.x < this.player.x){
			this.player.body.velocity.x = -350;
		}else if(this.input.pointer1.x > (this.player.x + this.player.width)){
			this.player.body.velocity.x = 350;
		}
	},
	
	gamepadControls: function(){
		this.rightTrigger = this.pad1.buttonValue(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);
	
		if(this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1){
			this.player.body.velocity.x = -350;
		}else if(this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1){
			this.player.body.velocity.x = 350;
		}
		
		if(this.rightTrigger && this.rightTrigger > 0.5){
			if(this.fireTimer < this.game.time.now){
				this.fire();
			}		
		}
		
		if(this.pad1.isDown(Phaser.Gamepad.XBOX360_A)){
			if(this.fireTimer < this.game.time.now){
				this.fire();
			}
		}
	},
	
	spawnAsteroids: function(){
		this.spawnX += 1;		
		
		if(this.spawnX % this.spawnY == 0){
			this.bigChance = this.game.rnd.integerInRange(0, 500);			
			this.randomStartPoint = (this.game.rnd.integerInRange(-100, 4050) / 10);
			
			if(this.bigChance > 250 && this.bigChance < 300){
				this.spawnBigAsteroid(this.randomStartPoint);
			}else{
				this.speed = this.game.rnd.integerInRange(325, 375);
				this.spawnAsteroid(this.randomStartPoint, -50, 0 , this.speed);
			}			
			
			if(this.spawnX % 25 ==0){
				if(this.spawnY == 3){
					this.spawnY = 20;
				}
				this.spawnY -=1;
			}
		}
	},

	spawnAsteroid: function(x, y, velX, velY){
		this.randomTexture = this.game.rnd.integerInRange(0, 400);

		this.asteroid = this.asteroids.create(x, y, 'asteroid');
		this.asteroid.scale.x = this.spriteScale;
		this.asteroid.scale.y = this.spriteScale;
		this.game.physics.enable(this.asteroid, Phaser.Physics.ARCADE);		
		this.asteroid.body.velocity.x = velX;
		this.asteroid.body.velocity.y = velY;
		this.asteroid.animations.add('A', [0]);
		this.asteroid.animations.add('B', [1]);
		this.asteroid.animations.add('C', [2]);
		this.asteroid.animations.add('D', [3]);
		if(this.randomTexture < 100){
			this.asteroid.animations.play('A');
		}else if(this.randomTexture < 200){
			this.asteroid.animations.play('B');
		}else if(this.randomTexture < 300){
			this.asteroid.animations.play('C');
		}else{
			this.asteroid.animations.play('D');
		}
	},
	
	spawnBigAsteroid: function(x){
		this.randomTexture = this.game.rnd.integerInRange(0, 300);

		this.bigAsteroid = this.bigAsteroids.create(x, -50, 'asteroidBig');
		this.game.physics.enable(this.bigAsteroid, Phaser.Physics.ARCADE);
		this.bigAsteroid.scale.x = this.spriteScale;
		this.bigAsteroid.scale.y = this.spriteScale;
		this.bigAsteroid.body.velocity.y = 250;
		this.bigAsteroid.animations.add('A', [0]);
		this.bigAsteroid.animations.add('B', [1]);
		this.bigAsteroid.animations.add('C', [2]);
		if(this.randomTexture < 100){
			this.bigAsteroid.animations.play('A');
		}else if(this.randomTexture < 200){
			this.bigAsteroid.animations.play('B');
		}else{
			//this.bigAsteroid.animations.play('C');
		}
	},

	asteroidSplit: function(x, y){
		this.ranY = this.game.rnd.integerInRange(250, 350);
		this.ranX1 = this.game.rnd.integerInRange(0, 150);
		this.ranX2 = this.game.rnd.integerInRange(0, -150);
		this.spawnAsteroid(x, y, this.ranX1, this.ranY);
		this.spawnAsteroid(x, y, this.ranX2, this.ranY);		
	},
	
	spawnPowerup: function(x, y){		
		this.chance = this.game.rnd.integerInRange(0, 500);
		if(this.chance < 50){
			this.shieldPower = this.shieldPowers.create(x, y, 'powerups');
			this.shieldPower.animations.add('s', [0]);
			this.shieldPower.animations.play('s', 10, true);
			this.shieldPower.scale.x = this.spriteScale;
			this.shieldPower.scale.y = this.spriteScale;
			this.game.physics.enable(this.shieldPower, Phaser.Physics.ARCADE);
			this.shieldPower.body.velocity.y = 200;
		}else if(this.chance < 150){
			this.doublePower = this.doublePowers.create(x, y, 'powerups');
			this.doublePower.animations.add('d', [1]);
			this.doublePower.animations.play('d', 10, true);
			this.doublePower.scale.x = this.spriteScale;
			this.doublePower.scale.y = this.spriteScale;
			this.game.physics.enable(this.doublePower, Phaser.Physics.ARCADE);
			this.doublePower.body.velocity.y = 200;
		}else if(this.chance > 400){
			this.ammoPower = this.ammoPowers.create(x, y, 'powerups');
			this.ammoPower.animations.add('a', [2]);
			this.ammoPower.animations.play('a', 10, true);
			this.ammoPower.scale.x = this.spriteScale;
			this.ammoPower.scale.y = this.spriteScale;
			this.game.physics.enable(this.ammoPower, Phaser.Physics.ARCADE);
			this.ammoPower.body.velocity.y = 200;
		}
	},	
	
	shieldPowerUp: function(playerObj, powerObj){	
		powerObj.kill();
		this.powerup_sound.play();
		this.shieldOnline = true;
	},

	shieldSystem: function(){
		if(this.shieldTimer > this.game.time.now){			
			this.shield.exists = true;
			this.shield.body.x = this.player.body.x;
			this.shield.body.y = this.player.body.y - 10;
		}else{
			this.shield.exists = false;
		}		
		if(this.shieldOnline){
			this.powerText.setText("Shield-Power Online");
			
			if(this.cursors.down.isDown || this.input.pointer1.y > this.player.y && this.input.pointer1.x > this.player.x && this.input.pointer1.x < this.player.x + this.player.width || this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)){
				this.powerText.setText("");
				this.shieldTimer = this.game.time.now + 3000;
				this.shieldActivate.play();
				this.shieldOnline = false;
			}
		}
	},
	
	gainAmmo: function(playerObj, powerObj){
		powerObj.kill();
		this.powerup_sound.play();
		this.ammunition += 5;
	},
	
	doubleFireMode: function(playerObj, powerObj){
		powerObj.kill();
		this.powerup_sound.play();
		this.doubleTimer = this.game.time.now + 2500;
	},
	
	fire: function(){
		this.fireTimer = this.game.time.now + 550;
		if(this.ammunition > 0){
			if(this.doubleTimer > this.game.time.now){				
				this.createRocket(this.player.body.x, this.player.body.y);
				this.createRocket((this.player.body.x + this.player.body.width - 8), this.player.body.y);				
			}else{
				this.createRocket(this.player.body.x + (this.player.body.width/2), this.player.body.y-30);
			}			
		}				
	},

	createRocket: function(x, y){
		this.bullet = this.bullets.create(x, y, 'bullet');
		this.bullet.scale.x = this.spriteScale;
		this.bullet.scale.y = this.spriteScale;
		this.bullet.anchor.set(0.5, 0);
		this.game.physics.enable(this.bullet, Phaser.Physics.ARCADE);
		this.bullet.body.velocity.y = -600;
		this.fire_sound.play();
		this.ammunition--;
	},
	
	createExplosion: function(x, y){
		this.explosion = this.explosions.create(x, y, 'explosion');
		this.game.physics.enable(this.explosion, Phaser.Physics.ARCADE);
		this.explosion.animations.add('boom', [0,1,2,3,4]);
		this.explosion.animations.play('boom', 10,  false, true);
		this.explode_sound.play();
	},

	shipCollision: function(obj1, obj2){
		obj2.kill();
		obj1.visible = false;
		
		this.destroyed = true;
		this.music.stop();
		this.death_sound.play();

		this.createExplosion(obj1.x, obj1.y);
		this.createExplosion((obj1.x - obj1.width), obj1.y);
		this.shiplosion = this.explosions.create(obj1.x, obj1.y, 'explosion');
		this.game.physics.enable(this.shiplosion, Phaser.Physics.ARCADE);
		this.shiplosion.anchor.set(0.5, 0);
		this.shiplosion.scale.x = 1.5;
		this.shiplosion.scale.y = 1.5;
		this.shiplosion.animations.add('boom', [0,1,2,3,4]);
		this.shiplosion.animations.play('boom', 10,  false, true);
		this.shiplosion.events.onAnimationComplete.add(
			function(){
					this.destroyed = true;
			}, this);
	},	
	
	bulletCollision: function(obj1, obj2){
		obj1.kill();		
		this.spawnPowerup(obj2.body.x, obj2.body.y);
		this.explode_sound.play();
		this.createExplosion(obj2.x, obj2.y);
		obj2.kill();		
	},
	
	damageBigAsteroid: function(obj1, obj2){
		obj1.kill();
		this.hit_sound.play();
		this.asteroidSplit(obj2.x, obj2.y);
		obj2.kill();		
	},
	
	shieldCollision: function(obj1, obj2){
		this.deflect_sound.play();
		obj2.kill();
	}
};