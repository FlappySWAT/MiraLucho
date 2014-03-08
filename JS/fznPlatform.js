var fzn = fzn || {};

window.requestAnimFrame = (function(callback) {
	//return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	return function(callback) {
	  window.setTimeout(callback, 1000/30);
	};
})();
fzn.Game = function(canvasID){
	this.cnv = (typeof canvasID == "string") ? document.getElementById(canvasID) : canvasID;
	this.resize();
	this.canvas = (typeof this.cnv.getContext != "undefined" ) ? this.cnv.getContext('2d'): false;
	this.loadQueue = 0;
	this.start = true;
	this.images = {};
	this.audios = {};
	this.libs = {};
	this.windows = [];
	this.windowVariation = 3;
	this.turn = 0;
	this.score = 0;
	this.level = 0;
	this.gameOver = true;
	this.wait = 30;
	this.increment = 1.1;
	this.font = {
		family: "Gamegirl",
		color: "black",
		align: "left",
		size: "10px"
	}
	this.ram = {};
	this.levelMeter = {};
	this.speed = 1;
	this.loader = new fzn.Loader(this,{
		color: "black",
		size:[this.cnv.width,10],
		pos: [0,"center"]
	});
	this.init();
};
fzn.Game.prototype = {
	init: function(){
		var self = this;
		if(!this.canvas){
			console.log("Canvas not supported or error loading")
			return false;
		}
		window.onresize = function(){self.resize();};
		this.canvas.fillStyle = this.font.color;
		this.canvas.font = this.font.size + " '" + this.font.family + "', sans-serif";
		this.canvas.textAlign = this.font.align;
		this.catchClick();
	},
	load: function(){
		var img,snd,self=this;
		this.loader.total = this.loadQueue;
		this.loading();
		for(img in this.images){
			this.images[img] = new Image()
			this.images[img].addEventListener("load", function() {
				self.loadQueue--;
			}, false);
			this.images[img].src = img;
		}
		for(snd in this.audios){
			this.audios[snd] = new Audio();
			this.audios[snd].addEventListener("loadeddata", function() {
				self.loadQueue--;
			}, false);
			this.audios[snd].src = snd;
		}
	},
	loading: function(){
		var self = this;
		if(this.loadQueue != 0){
			this.loader.go();
			window.requestAnimFrame(function() {
			  self.loading();
			});
		}else{
			if(this.wait > 0){
				this.loader.go();
				window.requestAnimFrame(function() {
				  self.loading();
				});
				this.wait--;
			}else{
				self.onLoad(self);
				window.requestAnimFrame(function() {
				  self.go();
				});
			}
		}
	},
	go: function(){
		var self = this,
			key,len, menu;
		if(!this.start){
			return false;
		}
		this.clear();
		this.turn = (this.turn < 2520) ? this.turn + 1 : 0;
		
		if((this.turn % this.speed) == 0 && !this.gameOver){
			this.loadWindow("commonWindow");
		}
		this.draw("background");
		this.draw("window");
		this.draw("overlay");
		if(!this.gameOver){
			this.updateRam();
			this.updateLevelMeter();
			this.updateScore();
		}
		this.draw("menu");
		window.requestAnimFrame(function() {
          self.go();
        });
	},
	draw: function(type){
		var item,
			target = this[type.toLowerCase()+"s"] || false;
		if(target){
			for(item in target){
					if(type.toLowerCase() == "sprite"){
						if(target[item].alive){
							target[item].go();
						}else{
							this.remove(type,target[item].id,target[item].type);
						}
					}else{
						if(target[item] && typeof target[item].go == "function"){
							target[item].go();
						}
					}
			}
		}
	},
	pause: function(){
		if(this.start){
			this.start = false;
		}else{
			this.start = true;
			this.go();
		}
	},
	clear: function(){
		this.canvas.clearRect(0,0,this.cnv.width,this.cnv.height);
	},
	define: function(type,params){
		var i,len,target,
			type = type || false;
		if(!type){
			return false;
		}
		this.libs = this.libs || {};
		target = type.toLowerCase();
		this.libs[target] = this.libs[target] || new fzn.Catalog(this,type.toLowerCase());
		if(params instanceof Array){
			for(i=0,len=params.length;i<len;i++){
				this.libs[target].store(params[i]);
				if((type == "sound" || type == "music") && typeof params[i].source === "string"){
					this.loadSound(params[i].source);
				}else if(typeof params[i].source === "string"){
					this.loadImage(params[i].source);
				}
				
			}
		}else{
			this.libs[target].store(params);
			if((type == "sound" || type == "music") && typeof params.source === "string"){
				this.loadSound(params.source);
			}else if(typeof params.source === "string"){
				this.loadImage(params.source);
			}
		}
	},
	loadWindow: function(window,params){
		var params = params || {},
			window = this.libs.window.generate(this.libs.window.getRandom(this.windowVariation),false,params),
			rPos = [],
			target,textArr,rndmText;
		window.index = this.windows.length;
		rPos[0] = Math.round((this.cnv.width - window.size[0]) * Math.random());
		rPos[1] = Math.round((this.cnv.height - window.size[1]) * Math.random());
		window.pos = rPos;
		if(window.items.text.length == 0){
			target = (window.name.indexOf("little") == 0) ? "small" : (window.name.indexOf("medium") == 0) ? "med" : (window.name.indexOf("mega") == 0) ? "big" : "Hello World!";
			textArr = gameLang[game.lang].game.windows[target];
			rndmText = Math.floor(textArr.length*Math.random());
			window.items.text = [textArr[rndmText]];
		}
		this.windows.push(window);
		this.ram.count++;
		return window;
	},
	removeWindow: function(window){
		var index = window.index;
		this.windows[index] = false;
	},
	loadImage: function(source){
		var src = source || false,
			self = this,
			image = this.images[src];
		if(src && typeof image == "undefined"){
			this.images[src] = null;
			this.loadQueue++;
		}
	},
	loadSound: function(source){
		var src = source || false,
			self = this,
			sound = this.audios[src];
		if(src && typeof sound == "undefined"){
			this.audios[src] = null;
			this.loadQueue++;
		}
	},
	catchClick: function(){
		var self = this;
		this.cnv.addEventListener("mousedown", function(event){
			var pos = [event.offsetX,event.offsetY];
			self.onClick(pos); 
		}, false);
	},
	onClick: function(pos){
		var catched = false,
			menus = [],
			key,len,window,menu;
		for(menu in this.menus){
			if(this.menus[menu].click){
				menus.push(this.menus[menu]);
			}
		}
		for(len = menus.length; len > 0; len--){
			menu = menus[len-1];
			if(menu.click){
				catched = menu.checkClicked(pos);
				break;
			}
		}
		
		for(len = this.windows.length; len > 0; len--){
			window = this.windows[len-1];
			if(window.click){
				catched = window.checkClicked(pos);
			}
			if(catched){
				this.bringToTop(window);
				break;
			}
		}
	},
	onLoad: function(){
		
	},
	bringToTop: function(window){
		this.removeWindow(window);
		window.index = this.windows.length;
		this.windows.push(window)
	},
	updateRam: function(){
		var percent = this.ram.count / this.ram.limit,
			nHeight = 0 - Math.round(this.ram.height * percent),
			ram = (typeof this.overlays != "undefined") ? this.overlays.theRam : false;
		if(nHeight != this.ram.size && ram && typeof ram.anim == "object"){
			this.ram.size = nHeight;
			ram.anim.stop();
			ram.anim.start("size",[ram.size[0],nHeight]);
			if(this.ram.count >= this.ram.limit){
				this.onGameOver();
			}
		}
		
	},
	updateLevelMeter: function(){
		var percent = (this.score - this.levelMeter.count) / this.levelMeter.limit,
			nWidth = Math.round(this.levelMeter.width * percent),
			lvl = (typeof this.overlays != "undefined") ? this.overlays.theLevelMeter : false;
		if(nWidth != this.levelMeter.size && lvl && typeof lvl.anim == "object"){
				this.levelMeter.size = nWidth;
				lvl.anim.stop();
				lvl.anim.start("size",[nWidth,lvl.size[1]]);
				if(this.score - this.levelMeter.count >= this.levelMeter.limit){
					this.levelMeter.count += this.levelMeter.limit;
					this.levelMeter.limit = Math.round(this.levelMeter.limit * this.increment);
					this.speed = Math.round(this.speed / this.increment);
					this.level++;
					this.windowVariation = (this.level+1)*3;
				}
		}
		
	},
	updateScore: function(){
		this.canvas.textAlign = "right";
		this.canvas.fillText(gameLang[this.lang].game.status.score, 80, 10);
		this.canvas.fillText(gameLang[this.lang].game.status.level, 80, 20);
		this.canvas.textAlign = "left";
		this.canvas.fillText(this.score, 85, 10);
		this.canvas.fillText(this.level, 85, 20);
	},
	onGameOver: function(){
		this.gameOver = true;
		this.add("menu","BSOD","BSOD");
		this.menus.BSOD.vatiableText=[gameLang[this.lang].menus.BSoD.message[7] + game.score + gameLang[this.lang].menus.BSoD.message[8],gameLang[this.lang].menus.BSoD.message[9] + game.level];
	},
	reset:function(){
		this.level = 0;
		this.score = 0;
		this.speed = 75;
		this.windowVariation = 1;
		this.ram = { 
			count: 0,
			limit: 13,
			height: 0,
			size: 0,
			padding: 50
		};
		this.levelMeter = { 
			count: 0,
			limit: 100,
			width: 0,
			size: 0,
			padding: 20
		};
		this.windows = [];
		this.ram.height = 154;
		this.levelMeter.width = 150;
		
		this.add("overlay","levelBarBack","theLevelMeterBack",{pos:[(this.cnv.width - (this.levelMeter.width + this.levelMeter.padding + 12)),this.levelMeter.padding-18]});
		this.add("overlay","ramBarBack","theRamBack",{pos:[(this.ram.padding/2)-5,this.cnv.height - (this.ram.padding+159)]});
		
		this.add("overlay","ramBar","theRam",{pos:[(this.ram.padding/2),this.cnv.height - this.ram.padding],size:[30,1]});
		this.add("overlay","levelBar","theLevelMeter",{pos:[(this.cnv.width - (this.levelMeter.width + this.levelMeter.padding)),this.levelMeter.padding],size:[1,15]});
		this.add("background","mainBack","wallpaper");
		
		//this.gameOver = false;
	},
	add: function(type,name,id,params){
		var catalog,item,target,lib;
		target = type.toLowerCase();
		lib = this.libs[target] || false;
		if(lib){
			item = lib.generate(name,id,params);
			if(item){
				target = type.toLowerCase()+"s";
				this[target] = this[target] || {};
				this[target][item.id] = item;
				if(type.toLowerCase() == "sprite"){
					item.floor = this.floor;
					this.spriteTypes[item.type] = this.spriteTypes[item.type] || {};
					this.spriteTypes[item.type][item.id] = true;
					if(item.type == "user"){
						this.user = item;
						this.attachEvents();
					}
				}
			}
		}
		return item;
	},
	remove: function(type,id){
		var item,i,len,
			type = type.toLowerCase(),
			target = this[type+"s"] || false;
		if(target){
			if(typeof target[id] != "undefined"){
				delete target[id];
			}
		}
	},
	resize: function(){
		this.cnv.width = document.body.clientWidth;
		this.cnv.height = document.body.clientHeight;
	}
}
fzn.Catalog = function(game,type){
	this.type = type || "generic";
	this.items = {};
	this.length = 0;
	this.instances = 0;
	this.game = game;
}
fzn.Catalog.prototype = {
	store: function(params){
		var par = params || false;
		
		if(par && typeof par.name != "undefined"){
			this.items[par.name] = par;
			this.length++;
		}
	},
	getRandom: function(limit){
		var item,
			l = (limit > this.length || typeof limit == "undefined") ? this.length : limit;
			counter = 0,
			index = Math.floor(Math.random() * l);
		for(item in this.items){
			if(counter == index){
				return item
			}
			counter++
		}
	},
	generate: function(name,id,params){
		var n = name || false,
			p = {},
			itm = this.items[n],
			def;
		if(!n || typeof this.items[n] == "undefined"){
			return false;
		}
		this.instances++;
		params = params || {};
		for(def in itm){
			p[def] = itm[def];
		}
		for(def in params){
			p[def] = params[def];
		}
		p.id = p.id || id || this.type+"_"+name+"_"+this.instances;
		switch(this.type){
			case "sprite":
				return new fzn.Sprite(this.game,p);
			break;
			case "background":
				return new fzn.Background(this.game,p);
			break;
			case "overlay":
				return new fzn.Background(this.game,p);
			break;
			case "button":
				var parent = p.menu || this.game.level || false;
				return new fzn.Button(parent,p);
			break;
			case "window":
				return new fzn.Menu(this.game,p);
			break;
			case "menu":
				return new fzn.Menu(this.game,p);
			break;
			case "sound":
				p.audio = game.audios[p.source];
				return p;
			break;
			default:
				return p;
		}
	},
	remove: function(){
		
	}
}
