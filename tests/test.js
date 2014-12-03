//Primary author: Nick
//To test, copy paste into terminal when at localhost

//sessions
/*
only run this one your first time testing
$.ajax({
    url: '/sessions/',
    type: 'POST',
    async: false,
    data: { 
'username': 'testuser1@mit.edu','name': 'testuser1',
            'password': 'testuser1' 
    }
});
*/
$.ajax({
    url: '/sessions/logout',
    type: 'POST',
    async: false
});

$.ajax({
    url: '/sessions/login',
    type: 'POST',
    async: false,
    data: { 
'username': 'testuser1@mit.edu',
            'password': 'testuser1' 
    }
});

//courses

//get a course
var course;
$.ajax({
            url: '/courses',
            type: 'GET',
            async: false,

            success: function(response) {
            	course = response[0];
            }
});

//add that course
$.ajax({
    method:"PUT",
    async: false,
    url:"/users/courses/"+course._id
});


var party;
$.ajax({
    method:"POST",
    url:"/parties",
    async: false,
	data: {
        expireAt:(Date.now() + 2000),
        course:course._id,
        location:"here",
        details:"now",
        lat: 0,
        lng: 0
    },
    success: function(response){
    	party = response.content;
    }
});

//leave that party
$.ajax({
    method:"DELETE",
    async: false,
    url:"/parties/"+party._id + "/users"
});

//join that party
$.ajax({
    method:"PUT",
    async: false,
    url:"/parties/"+party._id + "/users"
});

$.ajax({
    method:"GET",
    async: false,
    url:"/parties/"+party._id,
    success: function(response){
    	console.log(response.course == course._id)
    	console.log(response.location == "here")
    	console.log(response.details == "now")
    	console.log(response.lat == 0)
    	console.log(response.lng == 0)
//check equality to original info
    }
});


var parties;
$.ajax({
            url: '/courses/' + course._id,
            type: 'GET',
            async: false,

            success: function(response) {
            	console.log(response.length == 1)
            }
});


//close that party
$.ajax({
    method:"DELETE",
    async: false,
    url:"/parties/"+party._id
});
//remove course
$.ajax({
    method:"DELETE",
    async: false,
    url:"/users/courses/"+course._id
});