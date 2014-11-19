// Primary Author: Jessica

window.LoggedInView = Backbone.View.extend({

    initialize: function (options) {
        this.user = options.user;
        this.courses = options.courses;
        this.colors = ["FF0000", "0000FF", "00FF00", "FFFF00", "FF00FF", "00FFFF"];
        this.render();

    },

    render: function () {
        $(this.el).html(this.template({user:this.user, courses:this.courses}));
        $('[data-toggle="tooltip"]', $(this.el)).tooltip();
        this.addingParty = false;
        this.markers = {};
        for (var i=0; i<this.user.courses.length; i++) {
            this.markers[this.user.courses[i]._id] = [];
        }
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
        $('#add-new-course', $(this.el)).selectize({
            create: true,
            sortField: 'text'
        });


        var mapContainer = $("#map", $(this.el))[0];
        this.map = L.map(mapContainer, {
            minZoom: 1,
            maxZoom: 5,
            center: [-160, 280],
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

        L.Util.requestAnimFrame(this.map.invalidateSize, this.map, false, this.map._container)

        /*$.ajax({
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
        });*/

        self.refreshMap();

        return this;
    },

    events: {
        "click #new-party":"newParty",
        "click #add-course-button":"addNewCourse",
        "click #new-class-tab":"clearAddNewCourse",
        "click .open-party-details":"openPartyDetailsClick",
        "click #refresh-map":"refreshMap",
        "click .go-to-party":"goToParty"
    },

    goToParty: function(e) {
        var partyId = $(e.target).attr("id").substr(12);
        var courseId = $(e.target).parents(".class-tab-panel").attr("id").substr(13);
        if ($(e.target).parents(".course-line").eq(0).hasClass("expanded")) {
            this.closePartyDetails(partyId);
        } else {
            this.openPartyDetails(partyId, false);
        }
        var marker;
        for (var i=0; i<this.markers[courseId].length; i++) {
            if (this.markers[courseId][i].party == partyId) {
                marker = this.markers[courseId][i];
            }
        }
        this.map.panTo(marker.getLatLng());
        $(marker._icon).eq(0).animate({"top": "-=20px"}, 500).animate({"top": "+=20px"}, 500);

    },

    refreshMap: function() {
        var self = this;
        _.each(self.user.courses, function(course) {
            self.refreshTab(course._id);
            $('#add-new-course', $(self.el))[0].selectize.removeOption(course._id);
        });
    },

    addNewCourse: function(e) {
        e.preventDefault();
        var courseId = $('#add-new-course', $(this.el))[0].selectize.getValue();
        var self = this;
        if (courseId != "") {
            var courseNumber = $($('#add-new-course', $(this.el))[0].selectize.getOption(courseId)).text();
            $.ajax({
                type:"PUT",
                url:"/users/"+courseId,
                success: function() {
                    self.user.courses.push({"_id":courseId,"courseNumber":courseNumber});
                    self.markers[courseId] = [];
                    var newTab = $('<li role="presentation" class="class-tab" id="class-tab-' + courseId + '"><a href="#course-panel-' + courseId + '" aria-controls="#course-panel-' + courseId + '" role="tab" data-toggle="tab"><span class="color-palette"></span>' + courseNumber + '</a></li>');
                    $("#new-class-tab", $(self.el)).before(newTab);
                    var newPanel = '<div role="tabpanel" class="class-tab-panel tab-pane" id="course-panel-' + courseId + '">'+
                        '<div class="container-fluid">'+
                        '<div class="row">'+
                        '<div class="col-md-6 col-md-offset-1">Location</div>'+
                        '<div class="col-md-4">Attendees</div>'+
                        '</div>'+
                        '</div>'+
                        '</div>';
                    $("#new-class-panel", $(self.el)).before(newPanel);
                    self.refreshTab(courseId);
                    $("#class-tab-"+courseId, $(self.el)).tab("show");
                    $("#new-class-panel", $(self.el)).removeClass("active");
                    $("#course-panel-"+courseId, $(self.el)).addClass("active");
                    $("#new-party-course-number", $(self.el)).append('<option value="'+courseId+'">'+courseNumber+'</option>');
                    $('#add-new-course', $(self.el))[0].selectize.removeOption(courseId);
                }, error: function(xhr, status, err) {
                    console.log(err);
                }
            });

        } else {
            $("#add-course-errors", $(this.el)).text("Please select a course");
        }
    },

    clearAddNewCourse: function() {
        $("#add-course-errors", $(this.el)).text("");
        $('#add-new-course', $(this.el))[0].selectize.setValue("");
    },

    bindMarkerClick: function(marker, partyId, courseId) {
        var self = this;
        marker.on("click", function() {
            $("#class-tab-"+courseId, $(self.el)).tab("show");
            $(".class-tab-panel", $(self.el)).removeClass("active");
            $("#course-panel-"+courseId, $(self.el)).addClass("active");
            self.openPartyDetails(partyId, true);
        });
    },

    getCourseColor: function(courseId) {
        return this.colors[this.user.courses.map(function(course) { return course._id; }).indexOf(courseId)];
    },

    refreshTab: function(courseId, partyId) {
        var tabPanel = $("#course-panel-"+courseId, $(this.el));
        $(".course-line", tabPanel).remove();
        var color = this.getCourseColor(courseId);
        var tab = $("#class-tab-"+courseId, $(this.el));
        $(".color-palette", tab).css("background-color", "#"+color);
        var self = this;
        var xhr = $.ajax({
            method:"GET",
            url:"/courses/"+courseId,
            success: function(parties) {
                for (var i=0; i<self.markers[courseId].length; i++) {
                    self.map.removeLayer(self.markers[courseId][i]);
                }
                self.markers[courseId] = [];
                _.each(parties, function(party) {
                    var latLng = L.latLng(party.lat, party.lng);
                    var icon = L.MakiMarkers.icon({color: "#"+color, size: "m"});
                    var marker = L.marker(latLng, {clickable: true, icon: icon})
                    marker.addTo(self.map);
                    marker.party = party._id;
                    self.markers[courseId].push(marker);
                    $("#new-party-modal", $(self.el)).modal("hide");
                    self.bindMarkerClick(marker,party._id, courseId);
                    var partyLine = self.newPartyLine(party);
                    $(".container-fluid", tabPanel).append(partyLine);
                    self.bindJoinButton(party._id, courseId);
                });
                if (partyId) {
                    self.openPartyDetails(partyId, true);
                }
            }
        });
        return xhr;
    },

    bindJoinButton: function(partyId, courseId) {
        var self = this;
        $("#join-"+partyId).on("click", function() {
            var button = this;
            if ($(button).text() === "Leave") {
                $.ajax({
                    type: "DELETE",
                    url: "/parties/"+partyId,
                    success: function() {
                        var attendees = $("#party-line-"+partyId+" .attendees-column", $(self.el));
                        attendees.text(parseInt(attendees.text())-1);
                        var joinButton = $("#party-line-"+partyId+" .join-party-button", $(self.el));
                        joinButton.text("Join");
                        self.user.party = undefined;
                        $(button).text("Join");
                    }, error: function(xhr, status, err) {
                        console.log(err);
                    }
                })
            } else {
                $.ajax({
                    type: "PUT",
                    url: "/parties/"+partyId,
                    success: function() {
                        if (self.user.party != undefined) {
                            var prevAttendees = $("#party-line-"+self.user.party+" .attendees-column", $(self.el));
                            prevAttendees.text(parseInt(prevAttendees.text())-1);
                            var prevJoinButton = $("#party-line-"+self.user.party+" .join-party-button", $(self.el));
                            prevJoinButton.text("Join");
                        }

                        var attendees = $("#party-line-"+partyId+" .attendees-column", $(self.el));
                        attendees.text(parseInt(attendees.text())+1);
                        var joinButton = $("#party-line-"+partyId+" .join-party-button", $(self.el));
                        joinButton.text("Leave");

                        self.user.party = partyId;
                        $(button).text("Leave");
                    }, error: function(xhr, status, err) {
                        console.log(err);
                    }
                })
            }
        })
    },

    newPartyLine: function(party) {
        var line = $('<div class="row course-line" id="party-line-'+party._id+'"></div>');
        var mainContent = $('<div class="col-md-1"><span class="glyphicon glyphicon-chevron-right open-party-details"></span></div><div class="col-md-6"><a class="go-to-party" id="go-to-party-'+party._id+'">'+party.location+'</a></div><div class="col-md-4 attendees-column">'+party.attendees+'</div>');
        var buttonText = "Join";
        if (this.user.party == party._id) {
            buttonText = "Leave";
        }
        var date = new Date(party.endTime);
        var ampm;
        if (date.getHours()>11) {
            ampm="pm"
        } else {
            ampm="am"
        }
        var minutes = date.getMinutes();
        if (minutes <10) {
            minutes = "0"+minutes;
        }
        var formattedDate = date.getHours()%12+":"+minutes+" "+ampm;
        var otherContent = $('<div class="party-details"><div class="col-md-6 col-md-offset-1">Ends at '+formattedDate+'</div><div class="col-md-4"><button class="join-party-button btn btn-default" id="join-'+party._id+'">'+buttonText+'</button></div><div class="col-md-10 col-md-offset-1">'+party.details+'</div></div>');
        line.append(mainContent).append(otherContent);
        return line;
    },

    openPartyDetailsClick: function(e) {
        var partyId = $(e.target).parents(".course-line").eq(0).attr("id").substr(11);
        if ($(e.target).hasClass("glyphicon-chevron-right")) {
            this.openPartyDetails(partyId, false);
        } else {
            this.closePartyDetails(partyId);
        }
    },

    openPartyDetails: function(partyId, changeColor) {
        var line = $("#party-line-"+partyId, $(this.el));
        $(".glyphicon", line).removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
        line.addClass("expanded");
        var courseId = line.parents(".class-tab-panel").eq(0).attr("id").substr(13);
        var color = this.getCourseColor(courseId);
        if (changeColor) {
            line.css("background-color", "#" + color);
            line.animate({backgroundColor: ""}, 1000);
        }
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
        this.map.removeEventListener("click");
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
                    var duration = $( "#new-party-duration", $(self.el)).slider("option", "value");
                    if (duration % 1 > 0) {
                        endTime.setMinutes(endTime.getMinutes()+30);
                        endTime.setHours(endTime.getHours()+duration -.5);
                    } else {
                        endTime.setHours(endTime.getHours() + duration);
                    }
                    var coordinates = [coords.lat, coords.lng];
                    var courseId = $("#new-party-course-number", $(self.el)).val();
                    $(this).unbind("click");
                    $.ajax({
                        method:"POST",
                        url:"/parties",
                        data: {
                            endTime:endTime,
                            course:$("#new-party-course-number", $(self.el)).val(),
                            location:$( "#new-party-location", $(self.el)).val(),
                            details:$( "#new-party-details", $(self.el)).val(),
                            lat: coords.lat,
                            lng: coords.lng
                        }, success: function(partyResponse) {
                            var party = partyResponse.content;
                            if (self.user.party != undefined) {
                                var prevAttendees = $("#party-line-"+self.user.party+" .attendees-column", $(self.el));
                                prevAttendees.text(parseInt(prevAttendees.text())-1);
                                var prevJoinButton = $("#party-line-"+self.user.party+" .join-party-button", $(self.el));
                                prevJoinButton.text("Join");
                            }
                            self.user.party = party._id;
                            self.refreshTab(courseId, party._id).done(function() {
                                $("#class-tab-"+courseId, $(self.el)).tab("show");
                                $(".class-tab-panel", $(self.el)).removeClass("active");
                                $("#course-panel-"+courseId, $(self.el)).addClass("active");
                            });
                        }, error: function(xhr, status, err) {
                            console.log(err);
                        }
                    });

                });
            });
        } else {
            this.clearNewParty();
        }
    }




});