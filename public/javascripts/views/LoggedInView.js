// Primary Author: Jessica

window.LoggedInView = Backbone.View.extend({

    initialize: function (options) {
        this.user = options.user;
        this.courses = options.courses;
        this.colors = [{r:255,g:0,b:0,hex:"FF0000"}, {r:0,g:0,b:255,hex:"0000FF"}, {r:0,g:255,b:0,hex:"00FF00"}, {r:255,g:255,b:0,hex:"FFFF00"}, {r:255,g:0,b:255,hex:"FF00FF"}, {r:0,g:255,b:255,hex:"00FFFF"}];
        this.opacity = {};
        this.render();

    },

    render: function () {
        $(this.el).html(this.template({user:this.user, courses:this.courses}));
        $('[data-toggle="tooltip"]', $(this.el)).tooltip();
        this.addingParty = false;
        this.markers = {};
        for (var i=0; i<this.user.courses.length; i++) {
            this.markers[this.user.courses[i]._id] = {};
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

        _.each(self.user.courses, function(course) {
            $('#add-new-course', $(self.el))[0].selectize.removeOption(course._id);
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

        self.refreshMap();

        return this;
    },

    events: {
        "click #new-party":"newParty",
        "click #add-course-button":"addNewCourse",
        "click #new-class-tab":"clearAddNewCourse",
        "click .open-party-details":"openPartyDetailsClick",
        "click #refresh-map":"refreshMap",
        "click .go-to-party":"goToParty",
        "click .color-palette":"toggleMarkerVisibility"
    },

    toggleMarkerVisibility: function(e) {
        var courseId = $(e.target).parents(".class-tab").eq(0).attr("id").substr(10);
        var opacity = this.opacity[courseId];
        if (opacity == 0) {
            var color = this.getCourseColor(courseId, 1);
            $(e.target).css("backgroundColor", color);
            this.opacity[courseId] = 1;
            for (var partyId in this.markers[courseId]) {
                this.markers[courseId][partyId].setOpacity(1);
            }
        } else {
            var color = this.getCourseColor(courseId, 0);
            $(e.target).css("backgroundColor", color);
            this.opacity[courseId] = 0;
            for (var partyId in this.markers[courseId]) {
                this.markers[courseId][partyId].setOpacity(0);
            }
        }
    },

    //after clicking a listed party
    //navigate to it on the map
    goToParty: function(e) {
        var partyId = $(e.target).attr("id").substr(12);
        var courseId = $(e.target).parents(".class-tab-panel").attr("id").substr(13);
        if (!$(e.target).parents(".course-line").eq(0).hasClass("expanded")) {
            this.openPartyDetails(partyId, false);
        }
        var marker = this.markers[courseId][partyId];
        this.map.panTo(marker.getLatLng());
        $(marker._icon).eq(0).animate({"top": "-=20px"}, 500).animate({"top": "+=20px"}, 500);

    },

    //refreshes all the tabs and the map
    refreshMap: function() {
        var self = this;
        _.each(self.user.courses, function(course) {
            self.refreshTab(course._id);
        });
    },

    //adds the selected course to your list of courses,
    //adding a tab and populating the map
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
                    this.opacity[courseId] = 1;
                    self.markers[courseId] = {};
                    var newTab = $('<li role="presentation" class="class-tab" id="class-tab-' + courseId + '"><a href="#course-panel-' + courseId + '" aria-controls="#course-panel-' + courseId + '" role="tab" data-toggle="tab"><span class="color-palette"></span>' + courseNumber + '</a></li>');
                    $("#new-class-tab", $(self.el)).before(newTab);
                    $(".color-palette", newTab).on("click", function() {

                    });
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

    //clears the new course page so that when the user goes back it'll be clean
    clearAddNewCourse: function() {
        $("#add-course-errors", $(this.el)).text("");
        $('#add-new-course', $(this.el))[0].selectize.setValue("");
    },

    //upon adding a new marker, bind an event to it
    //so that it shows its party's details when clicked
    bindMarkerClick: function(marker, partyId, courseId) {
        var self = this;
        marker.on("click", function() {
            $("#class-tab-"+courseId, $(self.el)).tab("show");
            $(".class-tab-panel", $(self.el)).removeClass("active");
            $("#course-panel-"+courseId, $(self.el)).addClass("active");
            self.openPartyDetails(partyId, true);
        });
    },

    //get the color for a given courseId and opacity
    getCourseColor: function(courseId, opacity) {
        var color = this.colors[this.user.courses.map(function(course) { return course._id; }).indexOf(courseId)];
        if (opacity !== undefined) {
            return "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + ")"
        } else {
            return "#"+color.hex;
        }
    },

    //refreshes a course's parties in the tab and on the map
    refreshTab: function(courseId, partyId) {
        var tabPanel = $("#course-panel-"+courseId, $(this.el));
        $(".course-line", tabPanel).remove();
        var color = this.getCourseColor(courseId);
        var tab = $("#class-tab-"+courseId, $(this.el));
        var opacity = this.opacity[courseId];
        var cssColor = this.getCourseColor(courseId, opacity);
        $(".color-palette", tab).css("background-color", cssColor);
        var self = this;
        var xhr = $.ajax({
            method:"GET",
            url:"/courses/"+courseId,
            success: function(parties) {
                for (var party in self.markers[courseId]) {
                    self.map.removeLayer(self.markers[courseId][party]);
                }
                self.markers[courseId] = {};
                _.each(parties, function(party) {
                    var latLng = L.latLng(party.lat, party.lng);
                    var icon;
                    if (self.user.party == party._id) {
                        icon = L.MakiMarkers.icon({icon:"star", color: color, size: "m"});
                    } else {
                        icon = L.MakiMarkers.icon({color: color, size: "m"});
                    }
                    var marker = L.marker(latLng, {clickable: true, icon: icon, opacity:opacity});
                    marker.addTo(self.map);
                    self.markers[courseId][party._id] = marker;
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

    //binds a click event to a join button
    //that either leaves a party if the user is already in it
    //or joins the party and leaves the previous party if not
    bindJoinButton: function(partyId) {
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
                            if (prevAttendees.length > 0) {
                                prevAttendees.text(parseInt(prevAttendees.text()) - 1);
                                var prevJoinButton = $("#party-line-" + self.user.party + " .join-party-button", $(self.el));
                                prevJoinButton.text("Join");
                                var prevCourse = prevJoinButton.parents(".class-tab-panel").eq(0).attr("id").substr(13);
                                self.changeIcon(prevCourse, self.user.party, false);
                            }
                        }

                        var attendees = $("#party-line-"+partyId+" .attendees-column", $(self.el));
                        attendees.text(parseInt(attendees.text())+1);
                        var joinButton = $("#party-line-"+partyId+" .join-party-button", $(self.el));
                        joinButton.text("Leave");
                        var course = joinButton.parents(".class-tab-panel").eq(0).attr("id").substr(13);
                        self.changeIcon(course, partyId, true);
                        self.user.party = partyId;
                        $(button).text("Leave");
                    }, error: function(xhr, status, err) {
                        console.log(err);
                    }
                })
            }
        })
    },

    changeIcon: function(courseId, partyId, star) {
        var marker = this.markers[courseId][partyId];
        var color = this.getCourseColor(courseId);
        var icon;
        if (star) {
            icon = L.MakiMarkers.icon({icon:"star",color: color, size: "m"});
        } else {
            icon = L.MakiMarkers.icon({color: color, size: "m"});
        }
        marker.setIcon(icon);
    },

    //returns the new line that contains details about a party
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
        var hours = date.getHours()%12;
        if (hours == 0) {
            hours = 12;
        }
        var formattedDate = hours+":"+minutes+" "+ampm;
        var otherContent = $('<div class="party-details"><div class="col-md-6 col-md-offset-1">Ends at '+formattedDate+'</div><div class="col-md-4"><button class="join-party-button btn btn-default" id="join-'+party._id+'">'+buttonText+'</button></div><div class="col-md-10 col-md-offset-1">'+party.details+'</div></div>');
        line.append(mainContent).append(otherContent);
        return line;
    },

    //when the arrow is clicked, open or close party details
    openPartyDetailsClick: function(e) {
        var partyId = $(e.target).parents(".course-line").eq(0).attr("id").substr(11);
        if ($(e.target).hasClass("glyphicon-chevron-right")) {
            this.openPartyDetails(partyId, false);
        } else {
            this.closePartyDetails(partyId);
        }
    },

    //expands a party's details
    //if changeColor is true, animate the background color to highlight it
    openPartyDetails: function(partyId, changeColor) {
        var line = $("#party-line-"+partyId, $(this.el));
        $(".glyphicon", line).removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
        line.addClass("expanded");
        var courseId = line.parents(".class-tab-panel").eq(0).attr("id").substr(13);
        var color = this.getCourseColor(courseId);
        if (changeColor) {
            line.css("background-color", color);
            line.animate({backgroundColor: ""}, 1000);
        }
    },

    //hides a party's details
    closePartyDetails: function(partyId) {
        var line = $("#party-line-"+partyId, $(this.el));
        $(".glyphicon", line).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
        line.removeClass("expanded");
    },

    //clears the new party dialog and changes the cancel button back to add
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

    //upon clicking the add party button,
    //change it to a cancel button then add a click event to the map
    //when the map is clicked unbind it and add a click event to the modal submit button
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
                            if (self.user.party != undefined) {
                                for (var i=0; i<self.user.courses.length; i++) {
                                    var course = self.user.courses[i]._id;
                                    if (self.user.party in self.markers[course]) {
                                        self.changeIcon(course,self.user.party,false);
                                    }
                                }
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