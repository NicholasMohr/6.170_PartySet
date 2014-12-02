// Primary Author: Jessica

window.utils = {

    // Asynchronously load templates located in separate .html files
    loadTemplate: function (views, callback) {

        var deferreds = [];
        $.each(views, function (index, view) {
            if (window[view]) {
                deferreds.push($.get('templates/' + view + '.html', function (data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                console.log(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },

    loadPieces: function (fileNames, viewName, callback) {
        var deferreds = [];
        $.each(fileNames, function (index, fileName) {
                deferreds.push($.get('templates/' + fileName + '.html', function (data) {
                    window[viewName].prototype[fileName] = _.template(data);
                }));
        });

        $.when.apply(null, deferreds).done(callback);
    }
};