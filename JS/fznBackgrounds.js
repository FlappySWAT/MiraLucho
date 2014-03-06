var fzn = fzn || {};
fzn.Background = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.menu = params.menu || false;
		this.data = params.data || {};
		this.parent = params.menu || game.level || false;
		this.size = params.size || [this.game.cnv.width,this.game.cnv.height];
		this.pos = params.pos || [0,0];
		this.color = params.color || "transparent";
		this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
		this.source = params.source || false;
		this.repeat = params.repeat || false;
		this.fixed = params.fixed || false;
		this.id = params.id;
		this.animation = params.animation || false;
		this.init();
	}else{
		return false;
	}
}
fzn.Background.prototype = {
	init: function(){
		var w,h;
		if(this.pos == "center"){
			this.pos = [];
			this.pos[0] = (this.game.cnv.width / 2) - (this.size[0] / 2);
			this.pos[1] = (this.game.cnv.height / 2) - (this.size[1] / 2);
		}else{
			w = (typeof this.parent.size != "undefined") ? this.parent.size[0] : this.game.cnv.width;
			h = (typeof this.parent.size != "undefined") ? this.parent.size[1] : this.game.cnv.height;
			this.pos[0] = (this.pos[0] == "center") ? (w / 2) - (this.size[0] / 2) : this.pos[0];
			this.pos[1] = (this.pos[1] == "center") ? (h / 2) - (this.size[1] / 2) : this.pos[1];
		}
		this.anim = new fzn.Animation(this,this.animation);
		this.game.loadImage(this.source);
	},
	go: function(){
		this.anim.go();
		this.redraw();
	},
	redraw: function(){
		var state = [0,0],
			pos = [this.pos[0],this.pos[1]],
			x = (this.menu) ? pos[0] + this.menu.realPos[0] : pos[0],
			y = (this.menu) ? pos[1] + this.menu.realPos[1] : pos[1],
			sX = this.size[0],
			sY = this.size[1];
		if(this.parent){
			if(this.fixed === false){
				y = pos[1] - this.parent.pos[1];
				x = pos[0] - this.parent.pos[0]; 
				sX = this.parent.pos[0];
				sY = this.parent.pos[1];
			}else{
				x = pos[0] - (this.parent.pos[0]*this.fixed); 
				y = pos[1] - (this.parent.pos[1]*this.fixed);
				sX = this.parent.pos[0]*this.fixed;
				sY = this.parent.pos[1]*this.fixed;
			}
		}
		this.game.canvas.save();
		this.game.canvas.globalAlpha = (this.menu) ?  this.menu.opacity * this.opacity : this.opacity;
		if(this.color != "transparent"){
			this.game.canvas.fillStyle = this.color;
			this.game.canvas.fillRect(
				x,
				y,
				this.size[0],
				this.size[1]
			);
		}
		if(this.source){
			if(this.repeat == "repeat" || this.repeat == "repeat-x" || this.repeat == "repeat-y"){
				this.game.canvas.translate(x,y);
				//sY = (!this.fixed && (this.repeat == "repeat-x" || this.repeat == "repeat")) ? 0 : sY;
				//sX = (!this.fixed && (this.repeat == "repeat-y" || this.repeat == "repeat")) ? 0 : sX;
				var ptrn = this.game.canvas.createPattern(this.game.images[this.source],this.repeat);
				this.game.canvas.fillStyle = ptrn;
				this.game.canvas.fillRect(
					0,
					0,
					sX,
					sY
				);
			}else{
				this.game.canvas.drawImage(
					this.game.images[this.source],
					state[0],
					state[1],
					this.size[0],
					this.size[1],
					x,
					y,
					this.size[0],
					this.size[1]
				);
			}
		}
		if(this.text){
			this.game.canvas.fillStyle = this.font.color;
			this.game.canvas.font = this.font.size + " '" + this.font.family + "', sans-serif";
			y += (parseInt(this.font.size)/2)+(this.size[1]/2);
			switch(this.font.align){
				case "left":
					x += 0;
				break
				case "right":
					x += this.size[0];
				break
				case "center":
					x += this.size[0]/2;
				break
			}
			this.game.canvas.textAlign = this.font.align;
			
			if(this.font.stroke){
				this.game.canvas.lineWidth = 3;
				this.game.canvas.strokeStyle = this.stroke;
				this.game.canvas.strokeText(this.text,x,y);
			}
			
			this.game.canvas.fillText(this.text, x, y);
		}
		this.game.canvas.restore();
	}
}
