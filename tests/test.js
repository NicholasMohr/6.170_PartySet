//Primary author: Nick
//sessions
$.ajax({
    url: '/sessions/',
    type: 'POST',
    async: false,
    data: { 
'username': 'testuser1@mit.edu','name': 'testuser1',
            'password': 'testuser1' 
    }
});

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
    data: {
        expireAt:Date.now + 2000,
        course:course._id,
        location:"here",
        details:"now",
        lat: 0,
        lng: 0
    }
    async: false,
    success: function(response){
    	party = response;
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
    	//check equality to original info
    }
});


var parties;
$.ajax({
            url: '/courses/' + course._id,
            type: 'GET',
            async: false,

            success: function(response) {
            	parties 
            }
});
//check that there's just one party


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
    url:"/users/"+course._id
});