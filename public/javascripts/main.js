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
        var courses = new CourseCollection([{number:"6.170", _id:"r34632fd"}, {number:"6.034", _id:"e534266j63"}]);
        var user = new User({_id:"f4362652grw", courses:courses, "username":"Jessica"});
        this.headerView = new LoggedInHeaderView({user:user});
        $('.header').html(this.headerView.el);
        $('#content').html(new LoggedInView({user:user}).el);
        /*$.ajax({
            url:"session/user",
            type: "GET",
            dataType: "json",
            success: function(user) {
                $('.header').html(new LoggedInHeaderView({user:user}).el);
                $('#content').html(new LoggedInView({user:user}).el);
            },
            error: function() {
                $('.header').html(new LoggedOutHeaderView().el);
                $('#content').html(new LoggedOutView().el);
            }
        });*/

    },

    notFound: function() {
        $.ajax({
            url: "session/user",
            type: "GET",
            dataType: "json",
            success: function (user) {
                $('.header').html(new LoggedInHeaderView({user:user}).el);
                $('.header').html(this.headerView.el);
            }, error: function (xhr, status, err) {
                $('.header').html(new LoggedOutHeaderView().el);
                $('.header').html(this.headerView.el);
            }
        });
        $('#content').html("<h1>Page not found</h1>");
    }


});

utils.loadTemplate(['LoggedOutView', 'LoggedOutHeaderView', 'LoggedInView', 'LoggedInHeaderView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});
