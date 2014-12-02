// Primary Author: Jessica

window.LoggedOutView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template());
        return this;
    },

    events:  {
        "click #sign-up-button" : "signUp"
    },

    signUp: function(e) {
        e.preventDefault();
        var username = $("#sign-up-email", $(this.el)).val();
        var password = $("#sign-up-password", $(this.el)).val();
        var name = $("#sign-up-name", $(this.el)).val();
        var self = this;
        if (username == "") {
            $("#sign-up-errors", $(this.el)).text("Please enter your email address.");
        } else if (username.substr(-8) != "@mit.edu") {
            $("#sign-up-errors", $(this.el)).text("Please use your MIT email address (ending in @mit.edu).");
        } else if (name == "") {
            $("#sign-up-errors", $(this.el)).text("Please enter your name.");
        } else if (password.length<7) {
            $("#sign-up-errors", $(this.el)).text("Your password should be at least 7 characters long.");
        } else {
            $.ajax({
                url: "/sessions",
                type: "POST",
                data: {username: username, password: password, name: name},
                success: function () {
                    Backbone.history.navigate("/");
                    window.location.reload();
                },
                error: function (xhr, status, err) {
                    $("#sign-up-errors", $(self.el)).text(err);
                }
            });
        }
    }

});