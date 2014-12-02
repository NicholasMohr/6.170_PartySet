// Primary Author: Jessica

window.LoggedInView = Backbone.View.extend({

    initialize: function (options) {
        this.user = options.user;
        this.courses = options.courses;
        this.colors = [{r:255,g:0,b:0,hex:"FF0000"}, {r:0,g:0,b:255,hex:"0000FF"}, {r:0,g:255,b:0,hex:"00FF00"}, {r:255,g:255,b:0,hex:"FFFF00"}, {r:255,g:0,b:255,hex:"FF00FF"}, {r:0,g:255,b:255,hex:"00FFFF"}];
        this.opacity = {};
        this.currentErrorTimeout = undefined;
        this.render();
    },

    render: function () {
        var self = this;

        $(this.el).html(this.template({user:this.user, courses:this.courses}));
        $('[data-toggle="tooltip"]', $(this.el)).tooltip();
        this.addingParty = false;

        //keep a dictionary of markers
        this.markers = {};
        for (var i=0; i<this.user.courses.length; i++) {
            this.markers[this.user.courses[i]._id] = {};
        }

        //if the user has no courses the add party button should be disabled
        if (this.user.courses.length == 0) {
            $("#new-party", $(this.el)).addClass("disabled");
        }

        $(".class-tab:first", $(this.el)).tab("show");
        $(".class-tab-panel:first", $(this.el)).addClass("active");

        this.initializeSlider();
        $('#add-new-course', $(this.el)).selectize({
            create: true,
            sortField: 'text'
        });

        //if a course is already added it shouldn't be an option to add
        _.each(self.user.courses, function(course) {
            $('#add-new-course', $(self.el))[0].selectize.removeOption(course._id);
        });

        this.initializeMap();

        return this;
    },

    events: {
        "click #new-party":"newParty",
        "click #add-course-button":"addNewCourse",
        "click #new-class-tab":"clearAddNewCourse",
        "click .open-party-details":"openPartyDetailsClick",
        "click #refresh-map":"refreshMap",
        "click .go-to-party":"goToParty",
        "click .color-palette":"toggleMarkerVisibility",
        "click .remove-course .glyphicon-remove": "removeCourse",
        "click .invite-button":"invite",
        "click .end-button":"endParty",
        "click .join-party-button":"joinParty"
    },

    /*******
     * Initialization functions
     **********/

    //Initializes the jQuery UI slider that determines the duration of a new party
    initializeSlider: function() {
        var self = this;

        $( "#new-party-duration", $(this.el) ).slider({
            value:2,
            min:.5,
            max: 12,
            step:.5,
            slide: function( event, ui ) {
                //when the user uses the slider, update the text to show the chosen value
                var val = ui.value;
                var text = $("#new-party-duration-text", $(self.el));
                if (val % 1.0 == 0) {
                    text.text(val+" hours");
                } else {
                    text.text((val-.5)+" hours 30 minutes");
                }
            }
        });
    },

    //Initializes the Leaflet map that will show where parties are
    initializeMap: function() {
        var self = this;

        var mapContainer = $("#map", $(this.el))[0];

        //I found the center as I wanted it through trial and error
        this.map = L.map(mapContainer, {
            minZoom: 1,
            maxZoom: 5,
            center: [-160, 290],
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

        //this line was taken from Stack Overflow
        //the problem was that the dimensions were not being correctly calculated until the window was resized
        //which was causing problems with locating a party on the map and with bounding the map
        L.Util.requestAnimFrame(this.map.invalidateSize, this.map, false, this.map._container);

        //load all the parties
        this.refreshMap();
    },

    /*********
     * Button click functions
     ********/

    //End a party - the button you click to end a party is only available if you are the host
    endParty: function(e) {
        var partyId = $(e.currentTarget).attr("id").substr(4);
        var courseId = $(e.currentTarget).parents(".class-tab-panel").eq(0).attr("id").substr(13);
        var self = this;
        $.ajax({
            type: "DELETE",
            url: "/parties/endparty/"+partyId,
            success: function() {
                $(e.currentTarget).parents(".course-line").eq(0).remove();
                self.map.removeLayer(self.markers[courseId][partyId]);
                delete self.markers[courseId][partyId];
                if (self.user.party == partyId) {
                    self.user.party = undefined;
                }
            }, error: function( xhr, status, err) {
                self.newGeneralError(err);
            }
        })
    },

    //Invite a friend to a party
    //the button is only visible if you are at the party
    invite: function(e) {
        //reset the modal and display the correct information
        this.clearInviteModal();
        var partyId = $(e.currentTarget).eq(0).attr("id").substr(7);
        var courseId = $(e.currentTarget).parents(".class-tab-panel").eq(0).attr("id").substr(13);
        var courseNumber;
        for (var i=0;i<this.user.courses.length;i++) {
            if (this.user.courses[i]._id == courseId) {
                courseNumber = this.user.courses[i].courseNumber;
                break;
            }
        }
        $("#invite-course-number", $(this.el)).text(courseNumber);
        $("#invite-modal", $(this.el)).modal("show");

        var self = this;

        //on clicking the send invite button
        $("#send-invite-button", $(this.el)).on("click", function() {
            //parse the inputted list of emails
            //they should be separated by some combination of commas and spaces
            var inviteList = $("#invite-list", $(self.el)).val().split(/[ ,]+/);
            for (var i=0; i<inviteList.length; i++) {
                //if one of them isn't an mit email, show an error
                if (inviteList[i].substr(-8) != "@mit.edu") {
                    $("#invite-errors", $(self.el)).text("Please use friends' @mit.edu email addresses.");
                    return;
                }
            }
            $("#invite-modal", $(self.el)).modal("hide");
            //TODO: make request
        });
    },

    //On clicking a color palette in a tab, toggle the visibility of that course's markers on the map
    toggleMarkerVisibility: function(e) {
        e.preventDefault();
        //stop propagation so toggling the markers doesn't change the tab
        e.stopPropagation();

        var courseId = $(e.target).parents(".class-tab").eq(0).attr("id").substr(10);
        //current visibility is stored in an object
        var opacity = this.opacity[courseId];

        //if they're not visible, make them visible
        if (opacity == 0) {
            var color = this.getCourseColor(courseId, 1);
            //change color of palette back to what it was originally
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

    //on clicking a listed party, navigate to it on the map
    goToParty: function(e) {
        var partyId = $(e.target).attr("id").substr(12);
        var courseId = $(e.target).parents(".class-tab-panel").attr("id").substr(13);
        //open the party details if it's not open already
        if (!$(e.target).parents(".course-line").eq(0).hasClass("expanded")) {
            this.openPartyDetails(partyId, false);
        }
        var marker = this.markers[courseId][partyId];
        //pan to the marker on the map
        this.map.panTo(marker.getLatLng());
        //make the marker bounce
        $(marker._icon).eq(0).animate({"top": "-=20px"}, 500).animate({"top": "+=20px"}, 500);

    },

    //on clicking the add button in the add panel
    //adds the selected course to your list of courses,
    //adding a tab and populating the map
    addNewCourse: function(e) {
        e.preventDefault();
        var courseSelect = $('#add-new-course', $(this.el))[0].selectize;
        var courseId = courseSelect.getValue();
        var self = this;

        //makes sure a course is selected
        //selectize makes sure it's a valid course
        if (courseId != "") {
            var courseNumber = $(courseSelect.getOption(courseId)).text();
            $.ajax({
                type:"PUT",
                url:"/users/"+courseId,
                success: function() {
                    //add to the local list of courses
                    self.user.courses.push({"_id":courseId,"courseNumber":courseNumber});
                    //if the new party button was disabled it shouldn't be anymore
                    $("#new-party", $(self.el)).removeClass("disabled");
                    //opacity starts at 1, parties are visible
                    self.opacity[courseId] = 1;
                    self.markers[courseId] = {};

                    //create the new tab to add to the list classes
                    var newTab = $(self.CourseTab({courseId:courseId, courseNumber:courseNumber}));
                    $("#new-class-tab", $(self.el)).before(newTab);
                    //create the new panel that will display all the parties
                    var newPanel = $(self.CoursePanel({courseId:courseId}));
                    $("#new-class-panel", $(self.el)).before(newPanel);

                    //load all the parties
                    self.refreshTab(courseId);

                    //show this new tab
                    $("#class-tab-"+courseId, $(self.el)).tab("show");
                    $("#new-class-panel", $(self.el)).removeClass("active");
                    $("#course-panel-"+courseId, $(self.el)).addClass("active");

                    //change select boxes to display the correct course options
                    $("#new-party-course-number", $(self.el)).append('<option value="'+courseId+'">'+courseNumber+'</option>');
                    courseSelect.removeOption(courseId);
                }, error: function(xhr, status, err) {
                    self.newGeneralError(err);
                }
            });

        } else {
            $("#add-course-errors", $(this.el)).text("Please select a course");
        }
    },

    //on clicking the remove course button at the bottom of a panel,
    //get rid of the tab
    removeCourse: function(e) {
        var panel = $(e.target).parents(".class-tab-panel").eq(0);
        var courseId = panel.attr("id").substr(13);
        var tab = $("#class-tab-"+courseId, $(this.el));
        var self = this;
        $.ajax({
            type:"PUT",
            url:"/users/delete/"+courseId,
            success: function() {
                //show the first tab and delete this one
                $(".class-tab:first", $(self.el)).tab("show");
                $(".class-tab-panel:first", $(self.el)).addClass("active");
                tab.remove();
                panel.remove();

                //find the course in the local list of courses and delete it
                for (var i=0; i<self.user.courses.length; i++) {
                    if (self.user.courses[i]["_id"] == courseId) {
                        var courseNumber = self.user.courses[i]["courseNumber"];
                        self.user.courses.splice(i, 1);

                        //update any course selects
                        $('#add-new-course', $(self.el))[0].selectize.addOption({value:courseId,text:courseNumber});
                        $("#new-party-course-number option[value="+courseId+"]", $(self.el)).remove();
                        break;
                    }
                }

                //if the user has no courses left, the add party button should be disabled
                if (self.user.courses.length == 0) {
                    $("#new-party", $(self.el)).addClass("disabled")
                }

                //delete the markers from the map
                for (var party in self.markers[courseId]) {
                    self.map.removeLayer(self.markers[courseId][party]);

                    //while we're at it,
                    //if we find out that the user is currently in a party in the course we just deleted
                    //they are no longer at that party
                    if (party == self.user.party) {
                        self.user.party = undefined;
                    }
                }
                delete self.opacity[courseId];
                delete self.markers[courseId];
            },
            error: function(xhr, status, err) {
                self.newGeneralError(err);
            }
        });
    },

    //on a join/leave button click
    joinParty: function(e) {
        var partyId = $(e.currentTarget).attr("id").substr(5);
        var self = this;
        var button = $(e.currentTarget);
        var symbol = $(".glyphicon",button);

        //if the user is leaving a party
        if (symbol.hasClass("glyphicon-log-out")) {
            $.ajax({
                type: "DELETE",
                url: "/parties/"+partyId,
                success: function() {
                    //subtract one from the attendees display
                    var attendees = $("#party-line-"+partyId+" .attendees-column", $(self.el));
                    attendees.text(parseInt(attendees.text())-1);

                    //change the icon of the corresponding marker to be not a star
                    var course = button.parents(".class-tab-panel").eq(0).attr("id").substr(13);
                    self.changeIcon(course, self.user.party, false);

                    //now the user is in no party
                    self.user.party = undefined;

                    //change the icon and tooltip of the button
                    symbol.removeClass("glyphicon-log-out").addClass("glyphicon-log-in");
                    button.tooltip("hide");
                    button.attr("data-original-title", "Join");

                    //hide the invite button
                    $("#invite-"+partyId, $(self.el)).hide();

                }, error: function(xhr, status, err) {
                    self.newGeneralError(err);
                }
            })
        }
        //if the user is joining a party
        else {
            $.ajax({
                type: "PUT",
                url: "/parties/"+partyId,
                success: function() {
                    //if they're in another party to begin with, remove them from that party
                    if (self.user.party != undefined) {
                        var prevAttendees = $("#party-line-"+self.user.party+" .attendees-column", $(self.el));
                        if (prevAttendees.length > 0) {
                            prevAttendees.text(parseInt(prevAttendees.text()) - 1);
                            var prevJoinButton = $("#party-line-" + self.user.party + " .join-party-button", $(self.el));
                            $(".glyphicon", prevJoinButton).removeClass("glyphicon-log-out").addClass("glyphicon-log-in");
                            prevJoinButton.attr("data-original-title", "Join");
                            var prevCourse = prevJoinButton.parents(".class-tab-panel").eq(0).attr("id").substr(13);
                            self.changeIcon(prevCourse, self.user.party, false);
                            $("#invite-"+self.user.party, $(self.el)).hide();
                        }
                    }

                    //and join this one
                    var attendees = $("#party-line-"+partyId+" .attendees-column", $(self.el));
                    attendees.text(parseInt(attendees.text())+1);
                    symbol.removeClass("glyphicon-log-in").addClass("glyphicon-log-out");
                    button.tooltip("hide");
                    button.attr("data-original-title", "Leave");
                    var course = button.parents(".class-tab-panel").eq(0).attr("id").substr(13);
                    self.changeIcon(course, partyId, true);
                    $("#invite-"+partyId, $(self.el)).show();
                    self.user.party = partyId;
                }, error: function(xhr, status, err) {
                    self.newGeneralError(err);
                }
            })
        }
    },

    //on clicking the arrow for a party, open or close party details
    openPartyDetailsClick: function(e) {
        var partyId = $(e.target).parents(".course-line").eq(0).attr("id").substr(11);
        if ($(e.target).hasClass("glyphicon-chevron-right")) {
            this.openPartyDetails(partyId, false);
        } else {
            this.closePartyDetails(partyId);
        }
    },

    //on clicking the add party button,
    //change it to a cancel button then add a click event to the map
    //when the map is clicked unbind it and add a click event to the modal submit button
    newParty: function() {
        var mapContainer = $("#map", $(this.el));

        //do nothing if the user has no courses yet and the button is thus disabled
        if ($("#new-party", $(this.el)).hasClass("disabled")) {
            return;
        }

        //if we're not already trying to add a party
        if (!this.addingParty) {
            this.addingParty = true;
            var self = this;

            //change the add button to a cancel button
            $("#new-party", $(this.el)).tooltip("hide");
            $("#new-party", $(this.el)).attr("data-original-title", "Cancel");
            $("#new-party span", $(this.el)).css({'-webkit-transform' : 'rotate(135deg)',
                '-moz-transform' : 'rotate(135deg)',
                '-ms-transform' : 'rotate(135deg)',
                'transform' : 'rotate(135deg)'});

            //the cursor should now be a crosshair
            mapContainer.addClass("adding-party");

            //when the map is clicked
            this.map.on('click', function (e) {
                var coords = e.latlng;

                //make sure the modal is cleared and show it
                self.clearNewParty();
                $("#new-party-modal", $(self.el)).modal("show");

                //when the submit button is clicked in the modal
                $("#add-party-button", $(self.el)).on("click", function () {
                    //verify all necessary fields are filled in
                    if ($( "#new-party-location", $(self.el)).val() == "") {
                        $("#add-party-errors", $(self.el)).text("Please specify a location.");
                        return;
                    }

                    //calculate the end time based on the duration slider
                    var endTime = new Date();
                    var duration = $( "#new-party-duration", $(self.el)).slider("option", "value");
                    if (duration % 1 > 0) {
                        endTime.setMinutes(endTime.getMinutes()+30);
                        endTime.setHours(endTime.getHours()+duration -.5);
                    } else {
                        endTime.setHours(endTime.getHours() + duration);
                    }

                    var courseId = $("#new-party-course-number", $(self.el)).val();
                    $.ajax({
                        method:"POST",
                        url:"/parties",
                        data: {
                            expireAt:endTime,
                            course:$("#new-party-course-number", $(self.el)).val(),
                            location:$( "#new-party-location", $(self.el)).val(),
                            details:$( "#new-party-details", $(self.el)).val(),
                            lat: coords.lat,
                            lng: coords.lng
                        }, success: function(partyResponse) {
                            var party = partyResponse.content;
                            //if the user was already in a party, remove them from it and add them to the new one
                            if (self.user.party != undefined) {
                                var prevAttendees = $("#party-line-"+self.user.party+" .attendees-column", $(self.el));
                                prevAttendees.text(parseInt(prevAttendees.text())-1);
                                var prevJoinButton = $("#party-line-"+self.user.party+" .join-party-button", $(self.el));
                                prevJoinButton.text("Join");
                                for (var i=0; i<self.user.courses.length; i++) {
                                    var course = self.user.courses[i]._id;
                                    if (self.user.party in self.markers[course]) {
                                        self.changeIcon(course,self.user.party,false);
                                    }
                                }
                            }
                            self.user.party = party._id;
                            //refresh the tab then navigate to the tab
                            self.refreshTab(courseId, party._id).done(function() {
                                $("#class-tab-"+courseId, $(self.el)).tab("show");
                                $(".class-tab-panel", $(self.el)).removeClass("active");
                                $("#course-panel-"+courseId, $(self.el)).addClass("active");
                            });
                        }, error: function(xhr, status, err) {
                            self.newGeneralError(err);
                        }
                    });

                });
            });
        }
        //if we are already trying to add a party, then the user is trying to cancel the action
        else {
            this.clearNewParty();
        }
    },

    /******
     * Event helpers
     */

    //upon adding a new marker, bind an event to it
    bindMarkerClick: function(marker, partyId, courseId) {
        var self = this;
        //on clicking a marker, navigate to the tab and highlight and open the details of the party
        marker.on("click", function() {
            $("#class-tab-"+courseId, $(self.el)).tab("show");
            $(".class-tab-panel", $(self.el)).removeClass("active");
            $("#course-panel-"+courseId, $(self.el)).addClass("active");
            self.openPartyDetails(partyId, true);
        });
    },

    //expands a party's details
    //if changeColor is true, animate the background color to highlight it
    openPartyDetails: function(partyId, changeColor) {
        var line = $("#party-line-"+partyId, $(this.el));
        $(".glyphicon-chevron-right", line).removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
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
        $(".glyphicon-chevron-down", line).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
        line.removeClass("expanded");
    },

    /*******
     * Clear + reset inputs
     */

    //clears the invite dialog
    clearInviteModal: function() {
        $("#invite-list", $(this.el)).val("");
        $("#send-invite-button", $(this.el)).unbind("click");
        $("#invite-errors", $(this.el)).text("");
    },

    //clears the new course page so that when the user goes back it'll be clean
    clearAddNewCourse: function() {
        $("#add-course-errors", $(this.el)).text("");
        $('#add-new-course', $(this.el))[0].selectize.setValue("");
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
        $("#add-party-button", $(this.el)).unbind("click");
        $( "#new-party-duration", $(this.el)).slider("value",2);
        $( "#new-party-course-number", $(this.el))[0].selectedIndex = 0;
        $( "#new-party-location", $(this.el)).val("");
        $( "#new-party-details", $(this.el)).val("");
        $("#new-party-duration-text", $(this.el)).text("2 hours");
        $("#add-party-errors", $(this.el)).text("");
    },

    /*******
     * Refresh functions
     */

    //refreshes all the courses
    refreshMap: function() {
        var self = this;
        _.each(self.user.courses, function(course) {
            self.refreshTab(course._id);
        });
    },

    //refreshes a course's parties in the tab and on the map
    refreshTab: function(courseId, partyId) {
        //find the panel and empty it
        var tabPanel = $("#course-panel-"+courseId, $(this.el));
        $(".course-line", tabPanel).remove();
        var tab = $("#class-tab-"+courseId, $(this.el));

        //prepare colors for the tabs and for visible markers
        var color = this.getCourseColor(courseId);
        var opacity = this.opacity[courseId];
        var cssColor = this.getCourseColor(courseId, opacity);
        $(".color-palette", tab).css("background-color", cssColor);

        var self = this;
        var xhr = $.ajax({
            method:"GET",
            url:"/courses/"+courseId,
            success: function(parties) {
                //delete all markers that were on the map for the course before refresh
                for (var party in self.markers[courseId]) {
                    self.map.removeLayer(self.markers[courseId][party]);
                }

                //add a new marker for each party found
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
                    var partyLine = $(self.newPartyLine(party));
                    $(".container-fluid", tabPanel).append(partyLine);

                    //hide the invite button if the user is not in the party
                    if (self.user.party != party._id) {
                        $('.invite-button', partyLine).hide();
                    }
                    $('.join-party-button, .invite-button, .end-button', partyLine).tooltip();
                });

                //if the party id was passed in, then this party was just created
                //and we should highlight it and open the details
                if (partyId) {
                    self.openPartyDetails(partyId, true);
                }
            },
            error: function(xhr, status, err) {
                self.newGeneralError(err);
            }
        });
        return xhr;
    },

    /*******
     * Helper functions
     */

    //get the color for a given courseId and opacity from a predefined list of colors
    getCourseColor: function(courseId, opacity) {
        var color = this.colors[this.user.courses.map(function(course) { return course._id; }).indexOf(courseId)];

        //if opacity is specified return an rgba version (for css things)
        if (opacity !== undefined) {
            return "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + ")"
        }
        //if it's not specified return a hex version (for markers)
        else {
            return "#"+color.hex;
        }
    },

    //change the icon of a marker from or to a star
    changeIcon: function(courseId, partyId, star) {
        //find the marker and the correct color
        var marker = this.markers[courseId][partyId];
        var color = this.getCourseColor(courseId);
        var icon;

        //make a new icon and change the marker
        if (star) {
            icon = L.MakiMarkers.icon({icon:"star",color: color, size: "m"});
        } else {
            icon = L.MakiMarkers.icon({color: color, size: "m"});
        }
        marker.setIcon(icon);
    },

    //show an error message
    newGeneralError: function(message) {
        var self = this;

        //set the text for the error message and fade it in
        $("#general-errors", $(this.el)).html("<b>Error</b>: "+message).fadeIn();

        //if the last error message isn't gone yet, reset the time
        if (this.currentErrorTimeout != undefined) {
            clearTimeout(this.currentErrorTimeout);
        }

        //the error message should fade away in 5 seconds
        this.currentErrorTimeout = setTimeout(function() {
            $("#general-errors", $(self.el)).fadeOut();
        }, 5000);
    },

    //returns the new line that contains details about a party
    newPartyLine: function(party) {
        //whether the user is in the party already or not
        var joinType = "log-in";
        var tooltipText = "Join";
        if (this.user.party == party._id) {
            joinType = "log-out";
            tooltipText = "Leave";
        }

        //make the date pretty
        var date = new Date(party.expireAt);
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

        //compile the template
        return this.PartyLine({party:party, user:this.user, joinType: joinType, tooltipText: tooltipText, formattedDate: formattedDate});
    }

});