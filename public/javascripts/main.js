// Primary Author: Jessica

var AppRouter = Backbone.Router.extend({

    routes: {
        "" : "home",
        '*notFound': 'notFound'
    },

    initialize: function () {
        //this.headerView = new LoggedOutHeaderView();
        //$('.header').html(this.headerView.el);
        /*$.ajax({
            url: "session/user",
            type: "GET",
            dataType: "json",
            success: function (user) {
                this.headerView = new LoggedInHeaderView();
                $('.header').html(this.headerView.el);
            }, error: function () {
                this.headerView = new LoggedOutHeaderView();
                $('.header').html(this.headerView.el);
            }
        });*/
    },

    home: function () {
        //var allCourses = [{number:"6.170", _id:"r34632fd"}, {number:"6.034", _id:"e534266j63"}, {number:"6.046", _id:"e5342grej63"}, {number:"6.172", _id:"e534264263"}]
        //var courses = [{number:"6.170", _id:"r34632fd"}, {number:"6.034", _id:"e534266j63"}]
        //var user = {_id:"f4362652grw", courses:courses, "username":"jessmand@mit.edu", name:"Jessica"};
        /*this.headerView = new LoggedInHeaderView({user:user});
        $('.header').html(this.headerView.el);
        $('#content').html(new LoggedInView({user:user, courses:allCourses}).el);*/
        $.ajax({
            url:"/users/loggedin",
            type: "GET",
            success: function(user) {
                $.ajax({
                    url:"/courses",
                    type:"GET"
                }).done(function(allCourses) {
                    $('.header').html(new LoggedInHeaderView({user:user.content}).el);
                    $('#content').html(new LoggedInView({user:user.content, courses:allCourses}).el);
                });

            },
            error: function() {
                $('.header').html(new LoggedOutHeaderView().el);
                $('#content').html(new LoggedOutView().el);
            }
        });

    },

    notFound: function() {
        $.ajax({
            url:"/users/loggedin",
            type: "GET",
            success: function(user) {
                $('.header').html(new LoggedInHeaderView({user:user}).el);
            },
            error: function() {
                $('.header').html(new LoggedOutHeaderView().el);
            }
        });
        $('#content').html("<h1>Page not found</h1>");
    }


});

utils.loadTemplate(['LoggedOutView', 'LoggedOutHeaderView', 'LoggedInView', 'LoggedInHeaderView'], function() {
    utils.loadPiece("PartyLine", "LoggedInView", function() {
        app = new AppRouter();
        Backbone.history.start();
    });
});


