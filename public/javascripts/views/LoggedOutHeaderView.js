window.LoggedOutHeaderView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template());
        $('#login-navbar', $(this.el)).popover({
            html : true,
            title: function() {
                return "Sign in"
            },
            content: function() {
                return $("#login-popover-content").html();
            },
            placement: "left",
            trigger: "click"
        });
        return this;
    },

    events: {
        "click #sign-in-button":"signIn"
    },

    signIn: function(e) {
        e.preventDefault();
        var username = $("#sign-in-email", $(this.el)).val();
        var password = $("#sign-in-password", $(this.el)).val();
        $.ajax({
            url:"/login",
            type:"POST",
            data: {username: username, password: password},
            success: function() {
                Backbone.history.navigate("/");
                window.location.reload();
            },
            error: function(xhr, status, err) {
                $("#sign-in-errors").text(err);
            }
        })
    }

});