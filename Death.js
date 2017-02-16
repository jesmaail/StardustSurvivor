Scene.Death = function (game){
	//
};

Scene.Death.prototype = {
	create: function(){
		this.background = this.add.sprite(0, 0, 'home');
		this.music = this.game.add.audio('endMusic'); 
		this.music.loop = false;
		this.music.play();
		
		this.dead = this.add.sprite(200, 15, 'dead');
		this.dead.anchor.set(0.5, 0)
		this.restart = this.add.sprite(200, 430, 'restart');
		this.restart.anchor.set(0.5, 0);

		this.logo = this.add.button(380, 620, 'logo', this.decigames);
		this.logo.scale.x = 0.25;
		this.logo.scale.y = 0.25;
		this.logo.anchor.set(1,1);

		this.score = this.game.state.states['Game'].score;
		this.text = "YOU SURVIVED " + this.score + " SECONDS!";
		this.txtScore = this.game.add.text(200, 295, this.text, {font:"bold 23px Courier New", fill:'#ff7800'});
		this.txtScore.anchor.set(0.5, 0);

		this.txtShare = this.game.add.text(50, 365, "Challenge your\n\Friends to beat\n\  your score!",{font:"bold 18px Courier New", fill:'#8e8e8e'});
		this.txtShare.anchor.set(0, 0.5);

		this.fb = this.add.button(230, 365, 'fb', this.facebook);
		this.fb.anchor.set(0, 0.5);

		this.twit = this.add.button(290, 365, 'twitter', this.twitter);
		this.twit.anchor.set(0, 0.5);

		
		this.game.input.addPointer();
		this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
		this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
		this.game.input.gamepad.start();
		this.pad1 = this.game.input.gamepad.pad1;
	},
	
	update: function(){	


		if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP) || this.game.input.pointer1.isDown || this.pad1.isDown(Phaser.Gamepad.XBOX360_START) || this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_UP)){
			this.music.stop();
			this.game.state.start('Game');
		}
	},

	facebook: function(){
		this.url = "http://www.facebook.com/sharer/sharer.php?u=http://decigames.co.uk/sfasteroid";
		window.open(this.url, '_blank');
	},

	twitter: function(){
		this.url = "https://twitter.com/intent/tweet?text=I%20survived%20"+ this.score +"%20seconds%20in%20the%20Asteroid%20Field,%20Can%20you%20do%20better?%0Ahttp://decigames.co.uk/sfasteroid/%20%23DeciGames";
		window.open(this.url, '_blank');
	},

	decigames: function(){
		this.url = "http://www.decigames.co.uk";
		window.open(this.url, '_blank');
	}


};