var Wombat = function()
 {
	var thisWombat = 
	{
		level: new Level()
		,image: "/html/wombat_right.png"
		,clock: 0
		,maxJumpHeight: 55
		,moveSpeed: 4
		,items: []
		,size: {width:75, height:75}
		,state:
		{
			napping: false
			,moving: false
			,jumping: false
			,speed: 0
			,facingDirection: 'left'
			,location: {x: 0, y: 95 } //TODO: Set an origin so this isn't so stupid.
			,lastMoved: new Date()
		},
		jumpStuff:
		{
			vNought: (10 / 3),
			yCoords: [],
			jumping: false
		},
		move: function(direction, speed)
		{
			thisWombat.state.napping = false;
			thisWombat.state.moving = true;
			thisWombat.state.facingDirection = direction;
			thisWombat.speed = speed;
			thisWombat.state.lastMoved = new Date();
		},
		jump: function()
		{
			thisWombat.jumpStuff.yCoords = thisWombat.PopulateJumpCoords();
			thisWombat.jumpStuff.jumping = true;
		},
		PopulateJumpCoords: function(duration)
		{
			var startingY = thisWombat.state.location.y;
			var v0 = thisWombat.jumpStuff.vNought;
			var coords = [];
			var gravity = (1/18);
			for (var t = 0; t <= 60; t++)
			{
				var yValue = startingY - (v0 * t) + (gravity * (t * t));
				
				coords.push(yValue);
			}
			return coords;
		},
		Collide: function()
		{
			var items = thisWombat.level.items;
			for(var i = 0; i < items.length; i++)
			{
				var item = items[i];
				if(!
					(
						thisWombat.state.location.x >= item.location.x + item.size.width
						||
						thisWombat.state.location.x + thisWombat.size.width <= item.location.x
					)
				&&
					(
						thisWombat.state.location.y - thisWombat.size.height <= item.location.y + item.size.height
					)
				)
				{
					console.log("HAH");
				}
			}

		}
	}
	return thisWombat;
}

var Level = function()
{
	var level = {
		objects:
		[
			{
				shape:'square'
				,location: {x:410, y:135}
				,size: {height: 25, width:25}
			}
		],
		items:
		[
			{
				id: "banana1"
				,name: "Bananas"
				,location: {x:246, y:50}
				,size: {width:22, height: 23}
			}
		]
	}
	return level;
}
var wombatImage = new Image();
var backgroundImage = new Image();
backgroundImage.src = "/html/bg.png";
function RenderFrame(wombat)
{
	wombat.clock += 1;
	var canvas = $("canvas").get(0);
	var context = canvas.getContext('2d');
	canvas.width = canvas.width;
	var imgSrc = "/html/wombat_";
	imgSrc += wombat.state.facingDirection;
	imgSrc += (wombat.state.napping || new Date() - wombat.state.lastMoved > 5000) ? "_napping" : "";
	imgSrc += ".png";
	wombat.image = imgSrc;
	wombatImage.src = wombat.image;
	if(wombat.state.moving)
	{
		if(wombat.state.facingDirection == "left")
		{
			if(!(wombat.state.location.x < 4))
			wombat.state.location.x -= wombat.moveSpeed;
		}
		else
		{
			if(!(wombat.state.location.x > (canvas.width - wombatImage.width) - 4))
			wombat.state.location.x += wombat.moveSpeed;
		}
	}
	context.drawImage(backgroundImage, 0, 0);

	var wombatY = wombat.state.location.y;
	wombat.Collide();
	if(wombat.jumpStuff.jumping)
	{
		
		if(wombat.jumpStuff.yCoords.length > 0)
		{
			wombatY = wombat.jumpStuff.yCoords[0];
			wombat.jumpStuff.yCoords.splice(0, 1);
		}else
			wombat.jumpStuff.jumping = false;
	}



	context.drawImage(wombatImage, wombat.state.location.x, wombatY);
}


var wombat = new Wombat();
var GameRenderer = setInterval(function()
{
	RenderFrame(wombat);

}, 16);
$(document).ready(function()
{
	var preloads = ["wombat_left.png", "wombat_right.png", "wombat_right_napping.png", "wombat_left_napping.png"];
	for(var i = 0; i < preloads.length; i++)
	{
		var img = new Image();
		img.src = "/html/" + preloads[i];
		$("body").append($(img).css("display", "none"));
	}

})


var keyDown = { left: false, right: false }
$(document).keydown(function(e)
{
	switch(e.which)
	{
		case 65: //left (a)
		e.preventDefault();
			wombat.move("left");
			keyDown.left = true;
			break;
		case 68: //right (d)
		e.preventDefault();
			wombat.move("right");
			keyDown.right = true;
			break;
		case 32: //space
		e.preventDefault();
			if(!wombat.jumpStuff.jumping)
				wombat.jump();
			break;
		default:
			wombat.state.napping = true;  //Every other button is nap.
			break;
	}

}).keyup(function(e)
{
	switch(e.which)
	{
		case 65: //left (a)
			if(keyDown.right)
				wombat.state.facingDirection = "right";
			else
				wombat.state.moving = false;
			keyDown.left = false;
			break;
		case 68: //right (d)
			if(keyDown.left)
				wombat.state.facingDirection = "left";
			else
				wombat.state.moving = false;
			keyDown.right = false;
			break;
		case 32: //space
			//wombat.jump();
			break;
		default:
			wombat.state.moving = false;
			break;
	}
})