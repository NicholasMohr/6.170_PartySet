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
        var email = $("#sign-in-email", $(this.el)).val();
        var password = $("#sign-in-password", $(this.el)).val();
        $.ajax({
            url:"sessions/signIn",
            type:"POST",
            data: {email: email, password: password},
            success: function() {
                app.navigate("/", {trigger: true})
            },
            error: function(xhr, status, err) {
                $("#sign-in-errors").text(err);
            }
        })
    }

});