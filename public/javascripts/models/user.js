window.User = Backbone.Model.extend({

    urlRoot: "/users",

    idAttribute: "_id",

    defaults: {
        _id: null,
        courses:new CourseCollection()
    }
});

window.UserCollection = Backbone.Collection.extend({

    model: User,

    url: "/users"

});