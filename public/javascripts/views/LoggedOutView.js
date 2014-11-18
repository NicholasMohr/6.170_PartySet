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
        $.ajax({
            url:"/users",
            type:"POST",
            data: {username: username, password: password, name: name},
            success: function() {
                Backbone.history.navigate("/");
                window.location.reload();
            },
            error: function(xhr, status, err) {
                $("#sign-up-errors").text(err);
            }
        });
    }

});