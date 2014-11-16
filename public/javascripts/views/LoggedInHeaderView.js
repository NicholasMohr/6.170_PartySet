window.LoggedInHeaderView = Backbone.View.extend({

    initialize: function (options) {
        this.render();
        this.user = options.user;
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
            url:"sessions/signOut",
            type:"POST",
            complete: function() {
                app.navigate("/", {trigger: true})
            }
        })
    },

    showPreferences:function() {

    }

});