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
        var email = $("#sign-up-email", $(this.el)).val();
        var password = $("#sign-up-password", $(this.el)).val();
        $.ajax({
            url:"sessions/signUp",
            type:"POST",
            data: {email: email, password: password},
            success: function() {
                app.navigate("/", {trigger: true})
            },
            error: function(xhr, status, err) {
                $("#sign-up-errors").text(err);
            }
        })
    }

});