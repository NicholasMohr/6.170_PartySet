window.LoggedInView = Backbone.View.extend({

    initialize: function (options) {
        this.user = options.user;
        this.render();

    },

    render: function () {
        $(this.el).html(this.template({user:this.user}));
        $('[data-toggle="tooltip"]', $(this.el)).tooltip();
        this.addingParty = false;

        $(".class-tab:first", $(this.el)).tab("show");
        $(".tab-pane:first", $(this.el)).addClass("active");

        var mapContainer = $("#map", $(this.el))[0];
        this.map = L.map(mapContainer, {
            minZoom: 1,
            maxZoom: 5,
            center: [-140, 250],
            crs: L.CRS.Simple,
            zoom:3
        });

        // dimensions of the image
        var w = 9306,
            h = 3778,
            url = '/images/map.png';

        // calculate the edges of the image, in coordinate space
        var southWest = this.map.unproject([0, h], this.map.getMaxZoom()-1);
        var northEast = this.map.unproject([w, 0], this.map.getMaxZoom()-1);
        var bounds = new L.LatLngBounds(southWest, northEast);

        // add the image overlay,
        // so that it covers the entire map
        L.imageOverlay(url, bounds).addTo(this.map);

        // tell leaflet that the map is exactly as big as the image
        this.map.setMaxBounds(bounds);

        return this;
    },

    events: {
        "click #new-party":"newParty"
    },

    newParty: function() {
        var mapContainer = $("#map", $(this.el));
        if (!this.addingParty) {
            this.addingParty = true;
            $("#new-party", $(this.el)).tooltip("hide");
            $("#new-party", $(this.el)).attr("data-original-title", "Cancel");
            $("#new-party span", $(this.el)).css({'-webkit-transform' : 'rotate(135deg)',
                '-moz-transform' : 'rotate(135deg)',
                '-ms-transform' : 'rotate(135deg)',
                'transform' : 'rotate(135deg)'});
            mapContainer.addClass("adding-party");
            var self = this;
            this.map.on('click', function (e) {
                var coords = e.latlng;
                mapContainer.removeClass("adding-party");
                $(this).unbind("click");
                $("#new-party").attr("data-original-title", "New Party");
                $("#new-party span", $(self.el)).css({'-webkit-transform' : '',
                    '-moz-transform' : '',
                    '-ms-transform' : '',
                    'transform' : ''});
                $("#new-party-modal", $(self.el)).modal("show");
                $("#add-party-button", $(self.el)).on("click", function () {
                    var icon = L.MakiMarkers.icon({color: "#b0b", size: "m"});
                    L.marker(coords, {clickable: true, icon: icon}).addTo(self.map)
                    $("#new-party-modal", $(self.el)).modal("hide");
                    $(this).unbind("click");
                });
            });
        } else {
            this.addingParty = false;
            $("#new-party", $(this.el)).tooltip("hide");
            $("#new-party").attr("data-original-title", "New Party");
            mapContainer.removeClass("adding-party");
            $(this.map).unbind("click");
            $("#new-party span", $(this.el)).css({'-webkit-transform' : '',
                '-moz-transform' : '',
                '-ms-transform' : '',
                'transform' : ''});
        }
    }




});