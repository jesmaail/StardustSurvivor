var Scene = {};
Scene.Boot = function (game){
	//
};

Scene.Boot.prototype = {
	preload: function(){
		this.load.image('logo', './source/media/js/games/asteroid2/assets/img/logo.png');
		this.load.image('load', './source/media/js/games/asteroid2/assets/img/loading.png');
		this.load.image('title', './source/media/js/games/asteroid2/assets/img/title.png');
		this.load.image('start', './source/media/js/games/asteroid2/assets/img/start.png');
		this.load.image('home', './source/media/js/games/asteroid2/assets/img/home.png');				
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