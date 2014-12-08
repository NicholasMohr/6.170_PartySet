// Primary Author: Jessica

window.LoggedOutView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template());
        this.initializeCarousel();
        return this;
    },

    events:  {
        "click #sign-up-button" : "signUp"
    },

    initializeCarousel: function() {
        var caption = $("#screenshot-caption", $(this.el));
        var captionList = ["Add the MIT courses you're currently taking",
                           "Host a new party or join one already happening",
                           "Browse through existing parties to meet new people, help, and get help"
        ];
        caption.text(captionList[0]);
        $(".screenshot", $(this.el)).hide();
        var n=-1;
        $(".screenshot:nth-child(1)", $(this.el)).show().css("display", "block");
        var self = this;
        setInterval(function() {
            n+=1;
            $(".screenshot:nth-child("+((n%3)+1)+"), #screenshot-caption", $(self.el)).hide("slide", { direction: "left" }, 500, function() {
                caption.text(captionList[(n+1)%3]);
                $(".screenshot:nth-child("+(((n+1)%3)+1)+"), #screenshot-caption", $(self.el)).show("slide", { direction: "right" }, 500);

            });

        }, 5000);
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