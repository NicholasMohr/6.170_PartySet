var socket = io("http://localhost:3001");
socket.on("new party", function(party){
	console.log('new');
});
socket.on('remove party', function(partyId){
	console.log('end');
});
socket.on('join party', function(partyId){
	console.log('join');
});
socket.on('leave party', function(partyId){
	console.log('leave');
});