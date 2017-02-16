Scene.Preloader = function (game) {
	this.background = null; // define background
	this.preloadBar = null; // define loader bar
};

Scene.Preloader.prototype = {
	preload: function () {
		this.imgPath = "./source/media/js/games/";

		this.background = this.add.sprite(0, 0, 'home');
		this.game.physics.enable(this.background, Phaser.Physics.ARCADE);
		this.background.checkWorldBounds = true;
		this.background.outOfBoundsKill = true;

		this.title = this.add.sprite(200, 100, 'title');
		this.title.anchor.set(0.5, 0)
		this.loading = this.add.sprite(200, 440, 'load');
		this.loading.anchor.set(0.5, 0);

		//this.logo = this.add.sprite(380, 620, 'logo');
		this.logo = this.add.button(380, 620, 'logo', this.decigames);
		this.logo.scale.x = 0.25;
		this.logo.scale.y = 0.25;
		this.logo.anchor.set(1,1);

		this.load.image('ship', this.imgPath +'asteroid2/assets/img/ship.png');
		this.load.image('bullet', this.imgPath +'asteroid2/assets/img/rocket.png');
		this.load.spritesheet('asteroid', this.imgPath +'asteroid2/assets/img/asteroid.png', 150, 150, 4);
		this.load.spritesheet('asteroidBig', this.imgPath +'asteroid2/assets/img/asteroidBig.png', 289, 289, 3);
		this.load.spritesheet('explosion', this.imgPath +'asteroid2/assets/img/explosion.png',40, 40, 5);
		this.load.spritesheet('powerups', this.imgPath +'asteroid2/assets/img/powerups.png', 144, 144, 3);
		this.load.image('shield', this.imgPath +'asteroid2/assets/img/shield.png');
		this.load.image('space', this.imgPath +'asteroid2/assets/img/space.png');
		this.load.image('dead', this.imgPath +'asteroid2/assets/img/dead.png');
		this.load.image('restart', this.imgPath +'asteroid2/assets/img/restart.png');
		this.load.image('fb', this.imgPath +'asteroid2/assets/img/fb.png');
		this.load.image('twitter', this.imgPath +'asteroid2/assets/img/twitter.png');
		
		this.load.audio('menuMusic', this.imgPath +'asteroid2/assets/audio/startMusic.mp3')
		this.load.audio('gameMusic', this.imgPath +'asteroid2/assets/audio/gameMusic.mp3');		
		this.load.audio('fire', this.imgPath +'asteroid2/assets/audio/fire.mp3');
		this.load.audio('death', this.imgPath +'asteroid2/assets/audio/playerDeath.mp3');		
		this.load.audio('hit', this.imgPath +'asteroid2/assets/audio/hit.mp3');		
		this.load.audio('explode', this.imgPath +'asteroid2/assets/audio/explode.mp3');	
		this.load.audio('powerup', this.imgPath +'asteroid2/assets/audio/powerup.mp3');		
		this.load.audio('shieldActivate', this.imgPath +'asteroid2/assets/audio/shieldActivate.mp3');
		this.load.audio('deflect', this.imgPath +'asteroid2/assets/audio/deflect.mp3');
		this.load.audio('endMusic', this.imgPath +'asteroid2/assets/audio/endScreen.mp3');
		
		this.game.input.addPointer();
		this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
	},

	create: function () {
		this.spaceScroll = this.game.add.group();
		this.scrollBuffer = 0;
		this.background.body.velocity.y = 200;
		this.scrolling();		

		this.loading.visible = false;
		this.start = this.add.sprite(200, 440, 'start');
		this.start.anchor.set(0.5, 0);

		this.muteBuffer = 0;
		this.startMusic = this.game.add.audio('menuMusic'); 
		this.startMusic.loop = true;
		this.startMusic.play();
		
		this.testMode = false;
		
		this.game.input.gamepad.start();
		this.pad1 = this.game.input.gamepad.pad1;
	},
	
	update: function(){
		this.title.bringToTop();
		this.logo.bringToTop();
		this.scrolling();
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP) || this.game.input.pointer1.isDown || this.pad1.isDown(Phaser.Gamepad.XBOX360_START)){
			this.startMusic.stop();
			this.game.state.start('Game');
		}
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.M) && this.muteBuffer < this.game.time.now){			
			if(this.startMusic.mute){
				this.startMusic.mute = false;

			}else{
				this.startMusic.mute = true;
			}
			this.muteBuffer = this.game.time.now + 500;			
		}
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

	decigames: function(){
		this.url = "http://www.decigames.co.uk";
		window.open(this.url, '_blank');
	}
};