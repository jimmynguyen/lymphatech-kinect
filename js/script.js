// Sign in to web application
function login(email, password) {
    var ref = new Firebase("https://gtkinectproject.firebaseio.com/");
    ref.authWithPassword(
        {
            email: email,
            password: password
        }, 
        function(error, userData) {
            if (error) {
                $("#div_login_message").html("<strong>Error:</strong> " + error.message);
                $("#div_login_message").removeClass().addClass("alert").addClass("alert-danger");
            } else {
                $.cookie("email",email);
                $.cookie("password",password);
                var ref2 = new Firebase("https://gtkinectproject.firebaseio.com/users/");
                ref2.once("value", function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                        var childData = childSnapshot.val();
                        if (childData['uid'] == userData.uid) {
                            if (childData['urole'] == 'doctor') {
                                $("#table_patients").html(getPatientsTable(userData.uid));
                                $(".logged-out").fadeOut("slow", function() {
                                    $(".logged-in").fadeIn();
                                    $("#section_patients").fadeIn();
                                });
                            } else if (childData['urole'] == 'patient') {
                                viewPatientData(userData.uid);
                                $(".logged-out").fadeOut("slow", function() {
                                    $(".logged-in").fadeIn();
                                    $("#section_viewPatientData").fadeIn(function() {
                                        $("#a_logo").click();
                                    });
                                    $(".backToPatients").hide();
                                    $("#button_viewPatientData_viewPatientInfo").hide();
                                });
                                $("#section_patients").fadeOut();
                            }
                            $("#a_user").text("Welcome " + childData["name"] + "!");
                        }
                    });
                });
            }
        }
    );
}

function register(email, password, role, name, clinicName) {
    var ref = new Firebase("https://gtkinectproject.firebaseio.com/users/");
    ref.createUser(
        {
            email: email,
            password: password
        }, 
        function(error, userData) {
            if (error) {
                $("#div_register_message").html("<strong>Error:</strong> " + error.message);
                $("#div_register_message").removeClass().addClass("alert").addClass("alert-danger");
            } else {
                $("#form_register")[0].reset();
                $("#div_login_message").html("Account successfully created! Please sign in to continue.");
                $("#div_login_message").removeClass().addClass("alert").addClass("alert-success");
                $("#a_login").click();
                newRef = ref.push();
                newRef.set({
                    uid: userData.uid,
                    urole: role,
                    name: name
                });
            }
        }
    );
}

function addPatient(name,email,dateOfBirth,height,dominantHand,affectedSide,surgicalHistory,radiation,chemotherapy,numberOfLymphnodesRemoved,numberOfLymphnodesPositive,lymphedemaHistory) {
    var ref = new Firebase("https://gtkinectproject.firebaseio.com/users/");
    var authData = ref.getAuth();
    if (authData) {
        ref.createUser(
            {
                email: email,
                password: "1234"
            },
            function(error, userData) {
                if (error) {
                    $('#div_patients_message').html("<strong>Error:<strong/> " + error.message);
                    $("#div_patients_message").removeClass().addClass("alert").addClass("alert-danger");
                } else {
                    newRef = ref.push();
                    var onComplete = function(error) {
                        if (error) {
                            $('#div_patients_message').html("<strong>Error:<strong/> " + error.message);
                            $("#div_patients_message").removeClass().addClass("alert").addClass("alert-danger");
                            ref.removeUser(
                                {
                                    email: patient_email,
                                    password: "1234"
                                }
                            );
                        } else {
                            // Clear the form
                            $("#form_addPatient")[0].reset();

                            // Reload table
                            getPatientsTable(authData.uid)

                            // Display Status Message
                            $('#div_patients_message').html("The patient (" + name + ") has been added successfully.");
                            $("#div_patients_message").removeClass().addClass("alert").addClass("alert-success");
                        }
                    };
                    newRef.set(
                        {
                            clinicianuid: authData.uid,
                            uid: userData.uid,
                            urole: "patient",
                            name: name,
                            email: email,
                            dob: dateOfBirth,
                            height: height,
                            dominant_hand: dominantHand,
                            affected_side: affectedSide,
                            surgical_history: surgicalHistory,
                            radiation: radiation,
                            chemotherapy: chemotherapy,
                            number_of_lymphnodes_removed: numberOfLymphnodesRemoved,
                            number_of_lymphnodes_positive: numberOfLymphnodesPositive,
                            lymphedema_history: lymphedemaHistory
                        }, 
                        onComplete
                    );
                }
            }
        );
    }
}

function viewPatient(patientId) {
    $("#div_viewPatient_message").html("");
    $("#div_viewPatient_message").removeClass();
    var ref = new Firebase("https://gtkinectproject.firebaseio.com/users/");
    ref.once("value", function(snapshot) {
        patient = snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            if (childData['uid'] == patientId) {
                patient = childData;

                $("#input_viewPatient_uid").val(patientId);

                $("#span_viewPatient_name").text(patient["name"]);
                $("#input_viewPatient_name").val(patient["name"]);
                $("#input_viewPatient_email").val(patient["email"]);
                $("#input_viewPatient_dateOfBirth").val(patient["dob"]);
                $("#input_viewPatient_height").val(patient["height"]);

                if (patient["dominant_hand"] == "Both") {
                    $("#input_viewPatient_dominantHand_left").prop('checked', true);
                    $("#input_viewPatient_dominantHand_right").prop('checked', true);
                } else if (patient["dominant_hand"] == "Right") {
                    $("#input_viewPatient_dominantHand_right").prop('checked', true);
                } else if (patient["dominant_hand"] == "Left") {
                    $("#input_viewPatient_dominantHand_left").prop('checked', true);
                }

                if (patient["affected_side"] == "Both") {
                    $("#input_viewPatient_dominantHand_left").prop('checked', true);
                    $("#input_viewPatient_dominantHand_right").prop('checked', true);
                } else if (patient["affected_side"] == "Right") {
                    $("#input_viewPatient_dominantHand_right").prop('checked', true);
                } else if (patient["affected_side"] == "Left") {
                    $("#input_viewPatient_dominantHand_left").prop('checked', true);
                }

                $("#textarea_viewPatient_surgicalHistory").val(patient["surgical_history"]);
                $("#input_viewPatient_radiation").val(patient["raditation"]);
                $("#input_viewPatient_chemotherapy").val(patient["chemotherapy"]);
                $("#input_viewPatient_numberOfLymphnodesRemoved").val(patient["number_of_lymphnodes_removed"]);
                $("#input_viewPatient_numberOfLymphnodesPositive").val(patient["number_of_lymphnodes_positive"]);
                $("#textarea_viewPatient_lymphedemaHistory").val(patient["lymphedema_history"]);
            }
        })
    });
}

function saveChangesToPatient(uid,name,email,dateOfBirth,height,dominantHand,affectedSide,surgicalHistory,radiation,chemotherapy,numberOfLymphnodesRemoved,numberOfLymphnodesPositive,lymphedemaHistory) {
    var ref = new Firebase("https://gtkinectproject.firebaseio.com/users/");
    ref.once("value", function(snapshot) {
        patient = snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            var childSnapshotRef = childSnapshot.ref();
            if (childData['uid'] == uid) {
                patient = childData;
                var onComplete = function(error) {
                    // Reload view patient
                    getPatientsTable(childData['clinicianuid']);
                    viewPatient(uid);

                    if (error) {
                        $('#div_viewPatient_message').html("<strong>Error:<strong/> " + error.message);
                        $("#div_viewPatient_message").removeClass().addClass("alert").addClass("alert-danger");
                    } else {
                        // Display Status Message
                        $('#div_viewPatient_message').html("Your changes has been saved successfully.");
                        $("#div_viewPatient_message").removeClass().addClass("alert").addClass("alert-success");
                        $("#a_logo").click();
                    }
                };
                childSnapshotRef.update({
                    name: name,
                    email: email,
                    dob: dateOfBirth,
                    height: height,
                    dominant_hand: dominantHand,
                    affected_side: affectedSide,
                    surgical_history: surgicalHistory,
                    radiation: radiation,
                    chemotherapy: chemotherapy,
                    number_of_lymphnodes_removed: numberOfLymphnodesRemoved,
                    number_of_lymphnodes_positive: numberOfLymphnodesPositive,
                    lymphedema_history: lymphedemaHistory
                }, onComplete);
            }
        });
    });
}

function viewPatientData(patientId) {
    $("#div_viewPatientData_message").html("");
    $("#div_viewPatientData_message").removeClass();
    $("#div_viewPatientData_data").html("");
    var ref = new Firebase("https://gtkinectproject.firebaseio.com/users/");
    ref.once("value", function(snapshot) {
        patient = snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            if (childData['uid'] == patientId) {
                patient = childData;

                $("#input_viewPatient_uid").val(patientId);
                $("#span_viewPatientData_name").text(patient["name"]);

                graphVolumeVsTime(patient["measurements"].l_vol,patient["measurements"].r_vol,patient["measurements"].date)
                latestPercentDifference = graphPercentDifferenceVsTime(patient['measurements'].percent_difference,patient['measurements'].date);

                // Check latest percent difference against thresholds
                if (latestPercentDifference > 10) {
                    $('#div_viewPatientData_message').html("<strong>Warning:</strong> Percent difference is greater than 10%").addClass("alert").addClass("alert-danger");
                } else if (latestPercentDifference > 5) {
                    $('#div_viewPatientData_message').html("<strong>Warning:</strong> Percent difference is greater than 5%").addClass("alert").addClass("alert-danger");
                } else if (latestPercentDifference < -10) {
                    $('#div_viewPatientData_message').html("<strong>Warning:</strong> Percent difference is less than -10%").addClass("alert").addClass("alert-danger");
                } else if (latestPercentDifference < -5) {
                    $('#div_viewPatientData_message').html("<strong>Warning:</strong> Percent difference is less than -5%").addClass("alert").addClass("alert-danger");
                }
            }
        })
    });
}

function getPatientsTable(doctorId) {
    var ref = new Firebase("https://gtkinectproject.firebaseio.com/users/");
    var tableHeader = "<thead><tr><th>Name</th><th>Email</th><th></th><th></th></tr></thead><tbody id='tbody_patients'>";
    $("#table_patients").html(tableHeader);
    ref.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            if (childData["clinicianuid"] == doctorId) {
                var name = childData["name"];
                var email = childData["email"];
                $("#table_patients").append("<tr>" + 
                                                "<td>" + name + "</td>" + 
                                                "<td>" + email + "</td>" +
                                                "<td class='text-right'>" +
                                                    "<span class='glyphicon glyphicon-edit cursor-pointer' " + 
                                                          "onclick='viewPatient(\"" + childData["uid"] + "\");$(\"#section_patients\").fadeOut(\"slow\",function(){$(\"#section_viewPatient\").fadeIn(\"slow\");});' " + 
                                                          "aria-hidden='true'>" +
                                                    "</span>" + 
                                                "</td>" + 
                                                "<td class='text-right'>" + 
                                                    "<span class='glyphicon glyphicon-stats cursor-pointer' " + 
                                                          "onclick='viewPatientData(\"" + childData["uid"] + "\");$(\"#section_patients\").fadeOut(\"slow\",function(){$(\"#section_viewPatientData\").fadeIn(\"slow\");});' " + 
                                                          "aria-hidden='true'>" + 
                                                    "</span>" + 
                                                "</td>" + 
                                            "</tr>");
            }
        });
        if ($("#tbody_patients").html() == "") {
            $("#table_patients").html("<tbody id='tbody_patients'><tr><td class='text-center'>You don't have any patients</td></tr></tbody>")
        }
    });
}

$().ready(function() {
    //Does nothing for now:
    var pathname = (window.location.pathname).replace(window.location.hash, "");
    if (pathname == "/") {
        //Do something - URL control. Requires apache .htaccess
    }

    // Initialize
    $(".logged-out").show();
    $(".logged-in").hide();
    $("#section_patients").hide();
    $("#section_viewPatient").hide();
    $("#section_viewPatientData").hide();

    /* Login ******************************************/
    $('#input_login_password').keypress(function (e) {
        if (e.which == 13) {
            $("#button_login").click();
            return false;    //<---- Add this line
        }
    });
    $("#button_login").on("click", function() {
        var email = $("#input_login_email").val();
        var password = $("#input_login_password").val();
        login(email, password);
    });
    /**************************************************/

    /* Register ***************************************/
    $("#button_register").on("click", function() {
        var name = $("#input_register_name").val();
        var email = $("#input_register_email").val();
        var password = $("#input_register_password").val();
        var clinic = $("#input_register_clinic").val();
        var isTermsAndConditionsAccepted = $("#input_register_termsAndConditions").is(":checked");

        //Validate user input
        if (name == "" || email == "" || password == "" || clinic == "") {
            $("#div_register_message").html("<strong>Error:</strong> Please fill in all the fields.");
            $("#div_register_message").removeClass().addClass("alert").addClass("alert-danger");
        } else {
            //Check that they checked the terms and conditions.
            if (isTermsAndConditionsAccepted) {
                register(email, password, "doctor", name, clinic);
            } else {
                $("#div_register_message").html("<strong>Error:</strong> Please accept Terms and Conditions.");
                $("#div_register_message").removeClass().addClass("alert").addClass("alert-danger");
            }
        }
    });
    /**************************************************/

    /* Add Patient ************************************/
    $("#button_addPatient").on("click", function() {
        var name = $("#input_addPatient_name").val();
        var email = $("#input_addPatient_email").val();
        var dateOfBirth = $("#input_addPatient_dateOfBirth").val();
        var height = $("#input_addPatient_height").val();
        
        var dominantHandLeft = $("#input_addPatient_dominantHand_left").is(":checked");
        var dominantHandRight = $("#input_addPatient_dominantHand_right").is(":checked");

        if (dominantHandLeft && dominantHandRight) {
            var dominantHand = "Both";
        } else if (dominantHandLeft) {
            var dominantHand = "Left";
        } else if (dominantHandRight) {
            var dominantHand = "Right";
        } else {
            var dominantHand = "Neither";
        }

        var affectedSideLeft = $("#input_addPatient_affectedSide_left").is(":checked");
        var affectedSideRight = $("#input_addPatient_affectedSide_right").is(":checked");

        if (affectedSideLeft && affectedSideRight) {
            var affectedSide = "Both";
        } else if (affectedSideLeft) {
            var affectedSide = "Left";
        } else if (affectedSideRight) {
            var affectedSide = "Right";
        } else {
            var affectedSide = "Neither";
        }

        var surgicalHistory = $("#textarea_addPatient_surgicalHistory").val();
        var radiation = $("#input_addPatient_radiation").val();
        var chemotherapy = $("#input_addPatient_chemotherapy").val();
        var numberOfLymphnodesRemoved = $("#input_addPatient_numberOfLymphnodesRemoved").val();
        var numberOfLymphnodesPositive = $("#input_addPatient_numberOfLymphnodesPositive").val();
        var lymphedemaHistory = $("#textarea_addPatient_lymphedemaHistory").val();

        addPatient(name,email,dateOfBirth,height,dominantHand,affectedSide,surgicalHistory,radiation,chemotherapy,numberOfLymphnodesRemoved,numberOfLymphnodesPositive,lymphedemaHistory);
        $("#button_addPatient_cancel").click();
    });
    /**************************************************/

    /* Save Changes ***********************************/
    $("#button_viewPatient_saveChanges").on("click", function() {
        var uid = $("#input_viewPatient_uid").val();
        var name = $("#input_viewPatient_name").val();
        var email = $("#input_viewPatient_email").val();
        var dateOfBirth = $("#input_viewPatient_dateOfBirth").val();
        var height = $("#input_viewPatient_height").val();
        
        var dominantHandLeft = $("#input_viewPatient_dominantHand_left").is(":checked");
        var dominantHandRight = $("#input_viewPatient_dominantHand_right").is(":checked");

        if (dominantHandLeft && dominantHandRight) {
            var dominantHand = "Both";
        } else if (dominantHandLeft) {
            var dominantHand = "Left";
        } else if (dominantHandRight) {
            var dominantHand = "Right";
        } else {
            var dominantHand = "Neither";
        }

        var affectedSideLeft = $("#input_viewPatient_affectedSide_left").is(":checked");
        var affectedSideRight = $("#input_viewPatient_affectedSide_right").is(":checked");

        if (affectedSideLeft && affectedSideRight) {
            var affectedSide = "Both";
        } else if (affectedSideLeft) {
            var affectedSide = "Left";
        } else if (affectedSideRight) {
            var affectedSide = "Right";
        } else {
            var affectedSide = "Neither";
        }

        var surgicalHistory = $("#textarea_viewPatient_surgicalHistory").val();
        var radiation = $("#input_viewPatient_radiation").val();
        var chemotherapy = $("#input_viewPatient_chemotherapy").val();
        var numberOfLymphnodesRemoved = $("#input_viewPatient_numberOfLymphnodesRemoved").val();
        var numberOfLymphnodesPositive = $("#input_viewPatient_numberOfLymphnodesPositive").val();
        var lymphedemaHistory = $("#textarea_viewPatient_lymphedemaHistory").val();

        saveChangesToPatient(uid,name,email,dateOfBirth,height,dominantHand,affectedSide,surgicalHistory,radiation,chemotherapy,numberOfLymphnodesRemoved,numberOfLymphnodesPositive,lymphedemaHistory);
        $("#button_viewPatient_cancel").click();
    });
    /**************************************************/

    /* Logout *****************************************/
    $("#a_logout").on("click", function() {
        var ref = new Firebase("https://gtkinectproject.firebaseio.com/");
        ref.unauth();
        $.removeCookie("email");
        $.removeCookie("password");
        location.reload();
    });
    /**************************************************/

    $(".backToPatients").click(function() {
        $("#section_viewPatient").fadeOut(function() {
            $("#section_viewPatientData").fadeOut(function() {
                $("#section_patients").fadeIn(function() {
                    $("#a_logo").click();
                });
            });
        });
    });

    $("#button_viewPatient_viewPatientData").click(function() {
        viewPatientData($("#input_viewPatient_uid").val());
        $("#section_viewPatient").fadeOut(function() {
            $("#section_viewPatientData").fadeIn(function() {
                $("#a_logo").click();
            });
        });
    });

    $("#button_viewPatientData_viewPatientInfo").click(function() {
        viewPatient($("#input_viewPatient_uid").val());
        $("#section_viewPatientData").fadeOut(function() {
            $("#section_viewPatient").fadeIn(function() {
                $("#a_logo").click();
            });
        });
    });

    if ($.cookie("email")) {
        login($.cookie("email"), $.cookie("password"));
    }
});

function graphVolumeVsTime(l_vol,r_vol,date) {

    data = [];
    for (i = 0; i < date.length; i++) {
        data.push({date:date[i],right:r_vol[i],left:l_vol[i]});
    }

    var margin = {top: 20, right: 110, bottom: 75, left: 55},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
    var parseDate = d3.time.format("%y%m%d%H%M%S").parse;

    var x = d3.time.scale()
            .range([0, width]);
    var y = d3.scale.linear()
            .range([height, 0]);
    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .innerTickSize(-height)
            .outerTickSize(0)
            .tickPadding(10);
    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-width)
            .outerTickSize(0)
            .tickPadding(10);

    var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.volume); });

    var line_interp = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.volume); });

    var svg = d3.select("#div_viewPatientData_data").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

    data.forEach(function(d) {
        d.date = parseDate(d.date.toString());
    });
    var directions = color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {date: d.date, volume: +d[name]};
            })
        };
    });

    var y_padding = Math.abs(d3.max(directions, function(c) { return d3.max(c.values, function(v) { return v.volume; }); }))*0.25;

    if (d3.max(directions, function(c) { return d3.max(c.values, function(v) { return v.volume; }); }) == 0 
        && d3.min(directions, function(c) { return d3.min(c.values, function(v) { return v.volume; }); }) == 0) {
        y_padding = 1;
    } else if (d3.max(directions, function(c) { return d3.max(c.values, function(v) { return v.volume; }); }) == 0 ) {
        y_padding = Math.abs(d3.min(directions, function(c) { return d3.min(c.values, function(v) { return v.volume; }); }))*0.25;
    }

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([
        d3.min(directions, function(c) { return d3.min(c.values, function(v) { return v.volume; }); }) - y_padding,
        d3.max(directions, function(c) { return d3.max(c.values, function(v) { return v.volume; }); }) + y_padding
    ]);

    svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", 0)
                .attr("text-anchor", "middle")  
                .style("font-size", "20px") 
                .style("text-decoration", "underline")  
                .text("Volume vs Time");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
        .append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + width/2 + ",40)")
            .style("font-size","16px")
            .style("font-weight","bold")
            .text("Time");

    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
        .append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(-40," + height/2 + ")rotate(-90)")
            .style("font-size","16px")
            .style("font-weight","bold")
            .text("Volume (cubic centimeters)");

    var direction = svg.selectAll(".direction")
            .data(directions)
        .enter().append("g")
            .attr("class", "direction");

    direction.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .attr("data-legend",function(d) { return d.name.charAt(0).toUpperCase() + d.name.slice(1); })
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke", function(d) { return color(d.name); });

    direction.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line_interp(d.values); })
            .style("stroke", function(d) { return color(d.name); });

    var point = direction.append("g")
    .attr("class", "line-point");
    point.selectAll("circle")
    .data(function(d){ return d.values })
    .enter().append("circle")
    .attr("cx", function(d) { return x(d.date) })
    .attr("cy", function(d) { return y(d.volume) })
    .attr("r", 3.5)
    .style("fill", "white")
    .style("stroke", function(d) { return color(this.parentNode.__data__.name); });

    $('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
            var d = this.__data__, c = color(d.i);

            var options = {
                weekday: "long", year: "numeric", month: "short",
                day: "numeric", hour: "2-digit", minute: "2-digit"
            };
            return "<table><tr><td>Date</td><td style='padding-left:10px'>" + d.date.toLocaleTimeString("en-us",options) + "</td></tr><tr><td>Volume</td><td style='padding-left:10px'>" + d.volume + " cm<sup>3</sup></td></tr></table>";
        }
    });

    legend = svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(50,30)")
        .style("font-size","12px")
        .call(d3.legend);

    setTimeout(function() { 
        legend
            .style("font-size","20px")
            .attr("data-style-padding",10)
            .call(d3.legend)
    },1000);
}

function graphPercentDifferenceVsTime(percent_difference,date) {

    data = [];
    latest_percent_difference = percent_difference[percent_difference.length-1];
    for (i = 0; i < date.length; i++) {
        if (latest_percent_difference > 10) {
            data.push({date:date[i],percent_difference:percent_difference[i],warning:10});
        } else if (latest_percent_difference > 5) {
            data.push({date:date[i],percent_difference:percent_difference[i],warning:5});
        } else if (latest_percent_difference < -10) {
            data.push({date:date[i],percent_difference:percent_difference[i],warning:-10});
        } else if (latest_percent_difference < -5) {
            data.push({date:date[i],percent_difference:percent_difference[i],warning:-5});
        } else {
            data.push({date:date[i],percent_difference:percent_difference[i]});
        }
    }

    var margin = {top: 20, right: 80, bottom: 75, left: 55},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
    var parseDate = d3.time.format("%y%m%d%H%M%S").parse;

    var x = d3.time.scale()
            .range([0, width]);
    var y = d3.scale.linear()
            .range([height, 0]);
    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .innerTickSize(-height)
            .outerTickSize(0)
            .tickPadding(10);
    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-width)
            .outerTickSize(0)
            .tickPadding(10);

    var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.percent_difference); });

    var line_interp = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.percent_difference); });

    var svg = d3.select("#div_viewPatientData_data").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

    data.forEach(function(d) {
        d.date = parseDate(d.date.toString());
    });
    var directions = color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {date: d.date, percent_difference: +d[name]};
            })
        };
    });

    var y_padding = Math.abs(d3.max(directions, function(c) { return d3.max(c.values, function(v) { return v.percent_difference; }); }))*0.25;

    if (d3.max(directions, function(c) { return d3.max(c.values, function(v) { return v.percent_difference; }); }) == 0 
        && d3.min(directions, function(c) { return d3.min(c.values, function(v) { return v.percent_difference; }); }) == 0) {
        y_padding = 1;
    } else if (d3.max(directions, function(c) { return d3.max(c.values, function(v) { return v.percent_difference; }); }) == 0 ) {
        y_padding = Math.abs(d3.min(directions, function(c) { return d3.min(c.values, function(v) { return v.percent_difference; }); }))*0.25;
    }

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([
        d3.min(directions, function(c) { return d3.min(c.values, function(v) { return v.percent_difference; }); }) - y_padding,
        d3.max(directions, function(c) { return d3.max(c.values, function(v) { return v.percent_difference; }); }) + y_padding
    ]);

    svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", 0)
                .attr("text-anchor", "middle")  
                .style("font-size", "20px") 
                .style("text-decoration", "underline")  
                .text("Percent Difference vs Time");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
        .append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + width/2 + ",40)")
            .style("font-size","16px")
            .style("font-weight","bold")
            .text("Time");

    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
        .append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(-40," + height/2 + ")rotate(-90)")
            .style("font-size","16px")
            .style("font-weight","bold")
            .text("Percent Difference");

    var direction = svg.selectAll(".direction")
            .data(directions)
        .enter().append("g")
            .attr("class", "direction");

    direction.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .attr("data-legend",function(d) { 
                if (d.name == "warning") {
                    if (latest_percent_difference > 10) {
                        return "10% threshold";
                    } else if (latest_percent_difference > 5) {
                        return "5% threshold";
                    } else if (latest_percent_difference < -10) {
                        return "-10% threshold";
                    } else if (latest_percent_difference < -5) {
                        return "-5% threshold";
                    }
                } else {
                    return d.name.charAt(0).toUpperCase() + d.name.substring(1,d.name.indexOf("_")) + " " + d.name.charAt(d.name.indexOf("_")+1).toUpperCase() + d.name.substring(d.name.indexOf("_")+2); 
                }
            })
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke", function(d) { 
                if (d.name == "warning") {
                    if (latest_percent_difference > 10) {
                        return "red";
                    } else if (latest_percent_difference > 5) {
                        return "yellow";
                    } else if (latest_percent_difference < -10) {
                        return "red";
                    } else if (latest_percent_difference < -5) {
                        return "yellow";
                    }
                } else {
                    return color(d.name);
                }
            });

    direction.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line_interp(d.values); })
            .style("stroke", function(d) { 
                if (d.name == "warning") {
                    if (latest_percent_difference > 10) {
                        return "red";
                    } else if (latest_percent_difference > 5) {
                        return "yellow";
                    } else if (latest_percent_difference < -10) {
                        return "red";
                    } else if (latest_percent_difference < -5) {
                        return "yellow";
                    }
                } else {
                    return color(d.name);
                }
            });

    var point = direction.append("g")
    .attr("class", "line-point");
    point.selectAll("circle")
    .data(function(d){ return d.values })
    .enter().append("circle")
    .attr("cx", function(d) { return x(d.date) })
    .attr("cy", function(d) { return y(d.percent_difference) })
    .attr("r", function(d) {
        if (this.parentNode.__data__.name == "warning") {
            return 0;
        } else {
            return 3.5;
        }
    })
    .style("fill", "white")
    .style("stroke", function(d) { 
        return color(this.parentNode.__data__.name);
    });

    $('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
            var d = this.__data__, c = color(d.i);

            var options = {
                weekday: "long", year: "numeric", month: "short",
                day: "numeric", hour: "2-digit", minute: "2-digit"
            };
            return "<table><tr><td>Date</td><td style='padding-left:10px'>" + d.date.toLocaleTimeString("en-us",options) + "</td></tr><tr><td>% Difference</td><td style='padding-left:10px'>" + d.percent_difference + "</td></tr></table>";
        }
    });

    legend_percentDifference = svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(50,30)")
        .style("font-size","12px")
        .call(d3.legend);

    setTimeout(function() { 
        legend_percentDifference
            .style("font-size","20px")
            .attr("data-style-padding",10)
            .call(d3.legend)
    },1000);

    return latest_percent_difference;
}