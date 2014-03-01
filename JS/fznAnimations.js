var fzn = fzn || {};

fzn.Animation = function (item,anim,params){
	// Data Vars
	params = params || {};
	this.item = item;
	this.game = item.game;
	this.size = params.size || this.item.size || [50,50];
	this.endPosition = item.pos || [0,0];
	this.endSize = item.size || [0,0];
	this.pos = params.apos || [0,0];
	this.velDown = params.velDown || 0;
	this.gravity = params.gravity || 1;
	this.maxVel = params.maxVel || 11;
	this.anim = anim || false;
	this.animationEnd = true;
	this.endOpacity = (typeof params.opacity != "undefined") ? params.opacity : (typeof this.item.opacity != "undefined") ? this.item.opacity : 1;
	this.opacity = (typeof params.aOpacity != "undefined") ? params.aOpacity : 0;
	this.loop = params.loop || false;
	this.id = params.id;
	this.callback = (typeof params.callback == "function") ? callback : this.callback;
	this.init();
}
fzn.Animation.prototype = {
	init: function(){
		this.pos = this.checkCenter(this.pos);
		if(this.anim){
			this.start();
		}
	},
	start:function(theAnim,params,callback){
		var params = params || false,
			parent = this.item.parent || this.item.menu || this.item.level || this.item.game,
			temp;
		this.anim = theAnim || this.anim || false;
		if(!this.anim || !this.animationEnd){
			return false;
		}
		this.callback = (typeof callback == "function") ? callback : this.callback;
		this.endOpacity = (typeof this.endOpacity != "undefined") ? this.endOpacity : 1;
		this.endSize = this.item.size || [10,10];
		this.endPosition = this.item.pos || [0,0];
		switch(this.anim){
			case "bounce":
				temp = (typeof parent.pos != "undefined") ? parent.pos[1] : 0;
				this.pos = [this.endPosition[0],temp-this.size[1]];
				this.item.pos = this.pos;
			break;
			case "fallIn":
				this.pos = [this.endPosition[0],this.endPosition[1]-this.size[1]];
				this.anim = "fall";
				this.item.pos = this.pos;
			break;
			case "fallOut":
				this.endPosition = [this.item.pos[0], this.item.pos[1] + this.item.game.cnv.height];
				this.pos = [this.item.pos[0], this.item.pos[1]];
				this.anim = "fall";
				this.item.pos = this.pos;
			break;
			case "fadeIn":
				this.opacity = 0;
			break;
			case "fadeOut":
				this.opacity = this.endOpacity;
			break;
			case "move":
				if(params && params instanceof Array){
					this.pos = [this.item.pos[0], this.item.pos[1]];
					this.endPosition = this.checkCenter(params);
				}else{
					return false;
				}
			break;
			case "size":
				if(params && params instanceof Array){
					this.size = [this.item.size[0], this.item.size[1]];
					this.endSize = params;
				}else{
					return false;
				}
			break;
			default:
				this.pos = [this.endPosition[0],this.endPosition[1]];
		}
		this.animationEnd = false;
	},
	stop: function(){
		this.opacity = this.endOpacity;
		this.pos = [this.endPosition[0],this.endPosition[1]];
		this.item.opacity = this.opacity;
		this.animationEnd = true;
		this.onEnd();
	},
	checkCenter: function(pos){
		var w,h,
			parent = this.item.parent || this.item.menu || this.item.level || this.item.game;
		if(pos == "center"){
			pos = [];
			pos[0] = (this.item.game.cnv.width / 2) - (this.item.size[0] / 2);
			pos[1] = (this.item.game.cnv.height / 2) - (this.item.size[1] / 2);
		}else{
			w = (typeof parent.size != "undefined") ? parent.size[0] : parent.cnv.width;
			h = (typeof parent.size != "undefined") ? parent.size[1] : parent.cnv.height;
			pos[0] = (pos[0] == "center") ? (w / 2) - (this.item.size[0] / 2) : pos[0];
			pos[1] = (pos[1] == "center") ? (h / 2) - (this.item.size[1] / 2) : pos[1];
		}
		return pos;
	},
	callback: function(self,anim){
	
	},
	go: function(){
		var item,target;
		target = this.anims[this.anim];
		if(typeof target == "function" && !this.animationEnd){
			target.call(this);
		}
	},
	anims: {
		fall: function(){
			if(this.pos[1] < this.endPosition[1]){
				this.velDown += this.gravity;
				this.velDown = (this.velDown > this.maxVel) ? this.maxVel : this.velDown;
				this.pos[1] += this.velDown;
				this.pos[1] = (this.pos[1] > this.endPosition[1]) ? this.endPosition[1] : this.pos[1];
				this.item.pos = this.pos
			}else{
				this.item.pos = this.endPosition;
				this.onEnd();
			}
		},
		bounce: function(){
			this.velDown += this.gravity;
			this.pos[1] += this.velDown;
			if(this.pos[1] > this.endPosition[1]){
				this.pos[1] = this.endPosition[1]
				this.item.pos = this.pos;
				if(this.velDown < 1){
					this.item.pos = this.endPosition;
					this.onEnd();
				}else{
					this.velDown = -(this.velDown/2);
				}
			}	
		},
		jump: function(){
			this.velDown += this.gravity;
			this.pos[1] += this.velDown;
			if(this.pos[1] >= this.endPosition[1]){
				this.velDown = 0-this.maxVel;
			}
			this.item.pos = this.pos;
		},
		fadeIn: function(){
			this.opacity += 0.1;
			if(this.opacity > this.endOpacity){
				this.opacity = this.endOpacity;
				this.onEnd();
			}
			this.item.opacity = this.opacity;
		},
		fadeOut: function(){
			this.opacity -= 0.2;
			if(this.opacity < 0){
				this.opacity = 0;
				this.onEnd();
			}
			this.item.opacity = this.opacity;
		},
		move: function(){
			var step = 7,
				rX = false,
				rY = false;
			this.pos[0] += (this.endPosition[0] - this.pos[0]) / step;
			this.pos[1] += (this.endPosition[1] - this.pos[1]) / step;
			
			if(Math.abs(this.endPosition[0] - this.pos[0]) < 1){
				this.pos[0] = this.endPosition[0];
				rX = true;
			}
			if(Math.abs(this.endPosition[1] - this.pos[1]) < 1){
				this.pos[1] = this.endPosition[1];
				rY = true;
			}
			this.item.pos = this.pos;
			if(rX && rY){
				this.onEnd();
			}
			
		},
		size: function(){
			var step = 7,
				rX = false,
				rY = false;
			this.size[0] += (this.endSize[0] - this.size[0]) / step;
			this.size[1] += (this.endSize[1] - this.size[1]) / step;
			
			if(Math.abs(this.endSize[0] - this.size[0]) < 1){
				this.size[0] = this.endSize[0];
				rX = true;
			}
			if(Math.abs(this.endSize[1] - this.size[1]) < 1){
				this.size[1] = this.endSize[1];
				rY = true;
			}
			this.item.size = this.size;
			if(rX && rY){
				this.onEnd();
			}
			
		}
	},
	onEnd: function(){
		var cB = this.callback;
		this.animationEnd = true;
		
		this.callback = function(){};
		cB(this.item,this);
	}
}
