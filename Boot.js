var Scene = {};
Scene.Boot = function (game){
	//
};

Scene.Boot.prototype = {
	preload: function(){		
		this.imgPath = "games/asteroid/assets/img/";

		this.load.image('logo', this.imgPath + 'logo.png');
		this.load.image('load', this.imgPath + 'loading.png');
		this.load.image('title', this.imgPath + 'title.png');
		this.load.image('start', this.imgPath + 'start.png');
		this.load.image('home', this.imgPath + 'home.png');				
	},

	create: function(){
		if(game.device.android){
			game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			game.scale.setShowAll();
			game.scale.pageAlignHorizontally = true;
			game.scale.pageAlignVeritcally = true;
			game.scale.refresh();		
		}
		this.game.state.start('Preloader');
	}
};