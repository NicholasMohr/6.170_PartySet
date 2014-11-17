window.LoggedInView = Backbone.View.extend({

    initialize: function (options) {
        this.user = options.user;
        this.courses = options.courses;
        this.render();

    },

    render: function () {
        $(this.el).html(this.template({user:this.user, courses:this.courses}));
        $('[data-toggle="tooltip"]', $(this.el)).tooltip();
        this.addingParty = false;

        $(".class-tab:first", $(this.el)).tab("show");
        $(".class-tab-panel:first", $(this.el)).addClass("active");
        var self = this;
        $( "#new-party-duration", $(this.el) ).slider({
            value:2,
            min:.5,
            max: 12,
            step:.5,
            slide: function( event, ui ) {
                var val = ui.value;
                var text = $("#new-party-duration-text", $(self.el));
                if (val % 1.0 == 0) {
                    text.text(val+" hours");
                } else {
                    text.text((val-.5)+" hours 30 minutes");
                }
            }
        });

        _.each(self.user.courses, function(course) {
            self.refreshTab(course._id);
        });

        $('#add-new-course', $(this.el)).selectize({
            create: true,
            sortField: 'text'
        });

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

        $.ajax({
            method:"GET",
            url:"/parties",
            success: function(parties) {
                _.each(parties, function(party) {
                    var icon = L.MakiMarkers.icon({color: "#b0b", size: "m"});
                    var latLng = L.latLng(party.coordinates[0], party.coordinates[1]);
                    var marker = L.marker(latLng, {clickable: true, icon: icon});
                    marker.addTo(self.map);
                    self.bindMarkerClick(marker, party);
                });
            }
        });

        return this;
    },

    events: {
        "click #new-party":"newParty",
        "click #add-course-button":"addNewCourse",
        "click #new-class-tab":"clearAddNewCourse"
    },

    addNewCourse: function(e) {
        e.preventDefault();
        var courseId = $('#add-new-course', $(this.el))[0].selectize.getValue();
        if (courseId != "") {
            var courseNumber = $($('#add-new-course', $(this.el))[0].selectize.getOption(courseId)).text();
            var newTab = '<li role="presentation" class="class-tab" id="class-tab-' + courseId + '"><a href="#course-panel-' + courseId + '" aria-controls="#course-panel-' + courseId + '" role="tab" data-toggle="tab">' + courseNumber + '</a></li>';
            $("#new-class-tab", $(this.el)).before(newTab);
            var newPanel = '<div role="tabpanel" class="class-tab-panel tab-pane" id="course-panel-' + courseId + '">'+
                '<div class="row">'+
                    '<div class="col-md-7 col-md-offset-1">Location</div>'+
                    '<div class="col-md-4">Attendees</div>'+
                '</div>'+
            '</div>';
            $("#new-class-panel", $(this.el)).before(newPanel);
            this.refreshTab(courseId);
            $("#class-tab-"+courseId, $(this.el)).tab("show");
            $("#new-class-panel", $(this.el)).removeClass("active");
            $("#course-panel-"+courseId, $(this.el)).addClass("active");
        } else {
            $("#add-course-errors", $(this.el)).text("Please select a course");
        }
    },

    clearAddNewCourse: function() {
        $("#add-course-errors", $(this.el)).text("");
        $('#add-new-course', $(this.el))[0].selectize.setValue("");
    },

    bindMarkerClick: function(marker, party) {
        var self = this;
        marker.on("click", function() {
            $("#class-tab-"+party.course._id, $(this.el)).tab("show");
            self.openPartyDetails(party._id);
        });
    },

    refreshTab: function(courseId) {
        var tabPanel = $("#course-panel-"+courseId, $(this.el));
        $(".course-line", tabPanel).remove();
        var self = this;
        $.ajax({
            method:"GET",
            url:"/parties/"+courseId,
            success: function(parties) {
                _.each(parties, function(party) {
                    tabPanel.append(self.newPartyLine(party));
                })
            }
        })
    },

    newPartyLine: function(party) {
        var line = $('<div class="row course-line" id="party-line-'+party._id+'"></div>');
        var mainContent = $('<div class="col-md-1"><span class="glyphicon glyphicon-chevron-right"></span></div><div class="col-md-7">'+party.location+'</div><div class="col-md-4">'+party.attendees+'</div>');
        var otherContent = $('<div class="party-details"><div class="col-md-7 col-md-offset-1">'+party.details+'</div><div class="col-md-4"><button id="join-'+party._id+'">Join</button></div></div>');
        line.append(mainContent).append(otherContent);
        return line;
    },

    openPartyDetails: function(partyId) {
        var line = $("#party-line-"+partyId, $(this.el));
        $(".glyphicon", line).removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
        line.addClass("expanded");
    },

    closePartyDetails: function(partyId) {
        var line = $("#party-line-"+partyId, $(this.el));
        $(".glyphicon", line).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
        line.removeClass("expanded");
    },

    clearNewParty: function() {
        this.addingParty = false;
        $("#new-party", $(this.el)).tooltip("hide");
        $("#new-party").attr("data-original-title", "New Party");
        $("#map", $(this.el)).removeClass("adding-party");
        $(this.map).unbind("click");
        $("#new-party span", $(this.el)).css({'-webkit-transform' : '',
            '-moz-transform' : '',
            '-ms-transform' : '',
            'transform' : ''});
        $( "#new-party-duration", $(this.el)).slider("value",2);
        $( "#new-party-course-number", $(this.el))[0].selectedIndex = 0;
        $( "#new-party-location", $(this.el)).val("");
        $( "#new-party-details", $(this.el)).val("");
        $("#new-party-duration-text", $(this.el)).text("2 hours");
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
                self.clearNewParty();
                $("#new-party-modal", $(self.el)).modal("show");
                $("#add-party-button", $(self.el)).on("click", function () {
                    var endTime = new Date();
                    endTime.setHours(endTime.getHours+$( "#new-party-duration", $(self.el))[0].value);
                    $.ajax({
                        method:"POST",
                        url:"/parties",
                        data: {
                            endTime:endTime,
                            course:$("#new-party-course-number", $(self.el)).val(),
                            location:$( "#new-party-location", $(self.el)).val(),
                            details:$( "#new-party-details", $(self.el)).val(),
                            coordinates:[coords.lat, coords.lng]
                        }, success: function(party) {

                        }
                    });
                    var icon = L.MakiMarkers.icon({color: "#b0b", size: "m"});
                    L.marker(coords, {clickable: true, icon: icon}).addTo(self.map);
                    $("#new-party-modal", $(self.el)).modal("hide");
                    $(this).unbind("click");
                });
            });
        } else {
            this.clearNewParty();
        }
    }




});