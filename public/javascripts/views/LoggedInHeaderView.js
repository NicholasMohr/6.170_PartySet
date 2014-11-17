window.LoggedInHeaderView = Backbone.View.extend({

    initialize: function (options) {
        this.user = options.user;
        this.render();

    },

    render: function () {
        $(this.el).html(this.template({user:this.user}));
        return this;
    },

    events: {
        "click #sign-out":"signOut",
        "click #username":"showPreferences"
    },

    signOut: function(e) {
        $.ajax({
            url:"/users/logout",
            type:"POST"
        }).done(function(data) {
            Backbone.history.navigate("/");
            window.location.reload();
        })
    },

    showPreferences:function() {

    }

});