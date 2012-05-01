$(document).ready(function(){
	// canvas setting
	var can = $('#canvas');
	can.attr({
		'width': $(window).attr('innerWidth') - 30,
		'height': $(window).attr('innerHeight') - 30
	});
	// canvas context setting
	var ctx = can[0].getContext('2d');
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#9eala3';
	var rect = can[0].getBoundingClientRect();
	// draw flag setting
	var down = false;
	var remoteDown = false;
	// connect socket
	var socket = new io.connect('http://localhost:3003');
	socket.on('connect', function(data){
		console.log('connected session: %s', socket.id);
	});
	// receive message
	socket.on('message', function(data){
		data = $.parseJSON(data);
		if (data.action === 'down') remoteDown = true;
		else if (!remoteDown) return;
		draw(ctx, data);
		if (data.action === 'up') remoteDown = false;
	});
	// mousedown event
	can.mousedown(function(e){
		var data = createData('down', e, ctx, rect);
		draw(ctx, data);
		sendSocket(socket, data);
		down = true;
	});
	// mousemove event
	can.mousemove(function(e){
		if (!down) return;
		var data = createData('move', e, ctx, rect);
		draw(ctx, data);
		sendSocket(socket, data);
	});
	// mouseup event
	can.mouseup(function(e){
		if (!down) return;
		var data = createData('up', e, ctx, rect);
		draw(ctx, data);
		sendSocket(socket, data);
		down = false;
	});
});

/**
 * create draw data
 * 
 * @param string action draw action
 * @param object e canvas event
 * @param object ctx canvas context
 * @param object rect canvas absolute coordinates
 * @returns object draw data
 */
function createData(action, e, ctx, rect) {
	return {
		'action': action,
		'x': e.clientX - rect.left,
		'y': e.clientY - rect.top,
		'color': ctx.strokeStyle,
		'width': ctx.lineWidth
	};
}

/**
 * draw canvas
 * 
 * @param object ctx canvas context
 * @param object data drawing data
 */
function draw(ctx, data) {
	switch (data.action) {
		case 'down':
			ctx.strokeStyle = data.color;
			ctx.beginPath();
			ctx.moveTo(data.x, data.y);
			break;
		case 'move':
			ctx.lineTo(data.x, data.y);
			ctx.stroke();
			break;
		case 'up':
			ctx.lineTo(data.x, data.y);
			ctx.stroke();
			ctx.closePath();
			break;
	}
}

/**
 * send message to socket server
 * @param object socket
 * @param object message
 */
function sendMessage(socket, message) {
	socket.send(JSON.stringify(message));
}