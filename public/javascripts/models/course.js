window.Course = Backbone.Model.extend({

    urlRoot: "/courses",

    idAttribute: "_id",

    defaults: {
        _id: null
    }
});

window.CourseCollection = Backbone.Collection.extend({

    model: Course,

    url: "/courses"

});