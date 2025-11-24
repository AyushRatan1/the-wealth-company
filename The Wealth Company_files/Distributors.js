
let redata = {}; // make it global
let currentDiv = "";
let nextDiv = "";
let verifiedMobile = false;
let otpCountdown;
let remainingSeconds = 60;
let otpTimerInterval;  // Make sure this is declared outside both functions
let isOtpVerified = false;
function InsertDistributors(button) {
    currentDiv = button.getAttribute('data-current');
    nextDiv = button.getAttribute('data-next');

    const mobile = document.getElementById("dsmobile").value.trim();
    const otp = document.getElementById("otpInput").value.trim();

    if (!/^\d{10}$/.test(mobile)) {
        return toastr.warning("Please enter a valid 10-digit mobile number.");
    }

    if (!isOtpVerified) {
        if (!/^\d{6}$/.test(otp)) {
            return toastr.warning("Please enter a valid 6-digit OTP.");
        }
    }

    // Step 1: Validate input fields and build `redata`
    if (currentDiv === "div1") {
        const orgname = document.getElementById("Odsname").value.trim();
        const name = document.getElementById("dsname").value.trim();
        const email = document.getElementById("dsemail").value.trim();
        const arn = document.getElementById("dsarn").value.trim();
        const pin = document.getElementById("Pincode").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value.trim();

        if (!name) return toastr.warning("Please enter your Name.");
        if (!email || !isValidEmail(email)) return toastr.warning("Please enter a valid Email.");
        if (!arn) return toastr.warning("Please enter your ARN.");

        redata = {
            step: 1,
            orgName: orgname,
            name: name,
            emailId: email,
            mobileno: mobile,
            arn: arn,
            pin: pin,
            city: city,
            state: state
        };
    }
    else if (currentDiv === "div2") {
        const aum = document.getElementById("dsaum").value.trim();
        const pmsaum = document.getElementById("pmsaum").value.trim();
        const experience = document.getElementById("experienceYears").value;
        const clientserved = document.getElementById("clientsServed").value;
        const aifaum = document.getElementById("aifaum").value.trim();
        const teamsize = document.getElementById("teamSize").value;

        if (!aum) return toastr.warning("Please select AUM.");
        if (!pmsaum) return toastr.warning("Please select PMS AUM.");
        if (!aifaum) return toastr.warning("Please select AIF AUM.");
        if (!clientserved) return toastr.warning("Please select Number of Clients Served.");
        if (!teamsize) return toastr.warning("Please select your Team Size.");

        redata = {
            step: 2,
            mobileno: mobile,
            aum: aum,
            pmsaum: pmsaum,
            aifaum: aifaum,
            experience: experience,
            clientserved: clientserved,
            teamsize: teamsize
        };
    }
    else if (currentDiv === "div3") {
        const services = [...document.querySelectorAll(".service-option:checked")].map(c => c.value);
        const targetclients = [...document.querySelectorAll(".client-option:checked")].map(c => c.value);
        const learninggoals = [...document.querySelectorAll(".learning-goal-option:checked")].map(c => c.value);

        const otherService = document.getElementById("otherServiceInput");
        if (otherService && otherService.value.trim() !== "") {
            services.push(otherService.value.trim());
        }

        const otherGoal = document.getElementById("otherLearningGoalInput");
        if (otherGoal && otherGoal.value.trim() !== "") {
            learninggoals.push(otherGoal.value.trim());
        }

        if (services.length === 0) return toastr.warning("Please select at least one Current Service Offering.");
        if (targetclients.length === 0) return toastr.warning("Please select at least one Target Client Segment.");
        if (learninggoals.length === 0) return toastr.warning("Please select at least one Learning Goal.");

        redata = {
            step: 3,
            mobileno: mobile,
            clientsegment: services.join(", "),
            targetclient: targetclients.join(", "),
            hopinggain: learninggoals.join(", ")
        };
    }

    $.ajax({
        type: "POST",
        url: TWCAPI + "/api/Client/InsertDistributors",
        data: JSON.stringify(redata),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.statusCode == 200) {
                toastr.success("Registration completed. We will get back to you soon with course details.");
                document.querySelectorAll("input, select").forEach(el => el.value = "");
                document.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
                $('#' + currentDiv).hide();
                $('#div1').show();
                setTimeout(() => window.location.href = 'https://wealthcompany.in', 2000);
            } else {
                toastr.error("Something went wrong.");
            }
        },
        error: function () {
            toastr.error("Failed to submit data.");
        }
    });
    
}

function saveDistributorsAfterOtp() {
    $.ajax({
        type: "POST",
        url: TWCAPI + "/api/Client/InsertDistributors",
        data: JSON.stringify(redata),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.statusCode == 200) {
                toastr.success("Registration completed. We will get back to you soon with course details.");
                document.querySelectorAll("input, select").forEach(el => el.value = "");
                document.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
                $('#' + currentDiv).hide();
                $('#div1').show();
                setTimeout(() => window.location.href = 'https://wealthcompany.in', 2000);
            } else {
                toastr.error("Something went wrong.");
            }
        },
        error: function () {
            toastr.error("Failed to submit data.");
        }
    });
}



$('#Pincode').on('input', function () {
    const pin = $(this).val();

    if (pin.length === 6) {
        $.ajax({
            url: clientprofileapi+ '/api/UsersNominee/GetAddressDetailsPinCode',
            type: 'GET',
            data: { PINCode: pin },
            success: function (response) {
                if (response.code === 200 && response.data) {
                    $('#city').val(response.data.cityName);
                    $('#state').val(response.data.stateName);
                } else {
                    toastr.error("Please enter correct pincode");
                }
            },
            error: function () {
                toastr.error("Please enter correct pincode");
            }
        });
    } else {
        $('#city').val('');
        $('#state').val('');
    }
});


function sendOtpAndShowField() {
    const mobile = document.getElementById('dsmobile').value.trim();

    if (!/^\d{10}$/.test(mobile)) {
        toastr.warning("Please enter a valid 10-digit mobile number.");
        return;
    }

    // Send OTP to backend
    $.ajax({
        type: "POST",
        url: TWCAPI + "/api/Client/SendSMSOTP",
        data: JSON.stringify({ option: 1, mobile: mobile }),
        contentType: "application/json",
        success: function () {
            toastr.success("OTP sent successfully.");

            // Show OTP input field
            document.getElementById('otpInputWrapper').style.display = "block";

            // Disable Send OTP button
            const sendBtn = document.getElementById("sendOtpBtn");
            sendBtn.disabled = true;
            sendBtn.classList.add("opacity-50", "cursor-not-allowed");

            // Start 60s timer
            startOtpTimer();
        },
        error: function () {
            toastr.error("Failed to send OTP.");
        }
    });
}
function startOtpTimer() {
    let seconds = 60;
    const otpTimer = document.getElementById("otpTimer");
    otpTimer.classList.remove("hidden");
    otpTimer.innerText = `You can resend OTP in ${seconds}s`;

    clearInterval(otpTimerInterval); // Clear any previous timer

    otpTimerInterval = setInterval(() => {
        seconds--;
        otpTimer.innerText = `You can resend OTP in ${seconds}s`;

        if (seconds <= 0) {
            clearInterval(otpTimerInterval);
            otpTimer.classList.add("hidden");

            // Re-enable Send OTP button
            const sendBtn = document.getElementById("sendOtpBtn");
            sendBtn.disabled = false;
            sendBtn.classList.remove("opacity-50", "cursor-not-allowed");
        }
    }, 1000);
}

function verifyOtp() {
    const otp = document.getElementById('otpInput').value.trim();
    const mobileno = document.getElementById('dsmobile').value.trim();

    if (!otp || otp.length !== 6) {
        toastr.warning("Please enter a valid 6-digit OTP.");
        return;
    }

    $.ajax({
        type: "POST",
        url: TWCAPI + "/api/Client/VerifySMSOTP",
        data: JSON.stringify({ option: 2, mobile: mobileno, otp: otp }),
        contentType: "application/json",
        success: function (response) {
            if (response.statusCode === 200 && response.data?.Status === 1) {
                toastr.success(response.data.Message || "OTP verified.");
                isOtpVerified = true;

                // ✅ Make input readonly
                const otpInput = document.getElementById("otpInput");
                otpInput.readOnly = true;

                // ✅ Show OTP Verified message below input
                const otpStatusMsg = document.getElementById("otpStatusMsg");
                otpStatusMsg.textContent = "✅ OTP Verified";
                otpStatusMsg.classList.remove("hidden");

                // ✅ Stop and hide timer
                clearInterval(otpTimerInterval); // <-- stop timer
                document.getElementById("otpTimer")?.classList.add("hidden");

                const sendBtn = document.getElementById("sendOtpBtn");
                sendBtn.disabled = true;
                sendBtn.classList.add("opacity-50", "cursor-not-allowed");
                sendBtn.textContent = "OTP Verified";

            } else {
                isOtpVerified = false;
                toastr.error(response.data?.Message || "Invalid OTP. Please try again.");
            }
        },
        error: function () {
            isOtpVerified = false;
            document.getElementById("otpStatusMsg")?.classList.add("hidden");
            toastr.error("OTP verification failed. Please try again.");
        }
    });
}

function handleOtpInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 6);

    if (input.value.length === 6 && !isOtpVerified) {
        verifyOtp();
    }
}



function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function toggleModal(show) {
    const modal = document.getElementById("registerModal");
    modal.classList.toggle("hidden", !show);
}

function toggleServiceDropdown() {
    document.getElementById('serviceDropdown').classList.toggle('hidden');
}
function toggleSelectAllServices(checkbox) {
    const options = document.querySelectorAll('.service-option');
    options.forEach(opt => {
        opt.checked = checkbox.checked;
    });
}
function toggleOtherService(checkbox) {
    const input = document.getElementById('otherServiceInput');
    input.classList.toggle('hidden', !checkbox.checked);
}
function toggleClientDropdown() {
    document.getElementById("clientSegmentDropdown").classList.toggle("hidden");
}

function toggleSelectAllClients(checkbox) {
    document.querySelectorAll('.client-option').forEach(opt => {
        opt.checked = checkbox.checked;
    });
}

function toggleLearningGoalsDropdown() {
    document.getElementById('learningGoalsDropdown').classList.toggle('hidden');
}

function toggleSelectAllLearningGoals(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('.learning-goal-option');
    checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
}

function toggleOtherLearningGoal(checkbox) {
    document.getElementById('otherLearningGoalInput').classList.toggle('hidden', !checkbox.checked);
}

// Optional: Close dropdown on outside click
document.addEventListener("click", function (event) {
    const dropdowns = [
        { dropdown: "clientSegmentDropdown", button: "clientSegmentDropdownBtn" },
        { dropdown: "serviceDropdown", button: "serviceDropdownBtn" },
        { dropdown: "learningGoalsDropdown", button: "learningGoalsDropdownBtn" }
        // ➕ Add more dropdown-button pairs if needed
    ];

    dropdowns.forEach(({ dropdown, button }) => {
        const dropdownEl = document.getElementById(dropdown);
        const buttonEl = document.getElementById(button);

        if (dropdownEl && !dropdownEl.contains(event.target) && !buttonEl.contains(event.target)) {
            dropdownEl.classList.add("hidden");
        }
    });
});
function openOtpModal() {
    $("#mobileOtpModal").show();
}

function closeOtpModal() {
    $("#mobileOtpModal").hide();
}

function startOtpTimer() {
    remainingSeconds = 60;

    const timerEl = document.getElementById('otpTimer');
    const buttonEl = document.getElementById('sendOtpBtn');

    timerEl.classList.remove("hidden");
    buttonEl.disabled = true;

    timerEl.innerText = `You can resend OTP in ${remainingSeconds}s`;

    otpCountdown = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds <= 0) {
            clearInterval(otpCountdown);
            buttonEl.disabled = false;
            timerEl.innerText = "You can resend OTP now.";
        } else {
            timerEl.innerText = `You can resend OTP in ${remainingSeconds}s`;
        }
    }, 1000);
}


function Insertevents(button) {
    const orgname = document.getElementById("eventOrgName").value.trim();
    const name = document.getElementById("eventName").value.trim();
    const email = document.getElementById("eventEmail").value.trim();
    const mobile = document.getElementById("eventMobile").value.trim();
    const eventarn = document.getElementById("eventarn").value.trim();
    const pincode = document.getElementById("eventPincode").value.trim();
    const city = document.getElementById("eventcity")?.value.trim() || '';
    const state = document.getElementById("eventstate")?.value.trim() || '';

    // Custom email validation function
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validation with toastr alerts
    if (!name) return toastr.warning("Please enter your Name.");
    if (!email || !isValidEmail(email)) return toastr.warning("Please enter a valid Email.");
    if (!eventarn) return toastr.warning("Please enter ARN No.");
    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) return toastr.warning("Please enter a valid 10-digit Mobile number.");
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return toastr.warning("Please enter a valid 6-digit Pincode.");
    //if (!city) return toastr.warning("Please enter your City.");
    //if (!state) return toastr.warning("Please enter your State.");


    // AJAX call
    $.ajax({
        url: TWCAPI +  '/api/Client/InsertEventRegistration', 
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            name: name,
            orgName: orgname,
            mobileno: mobile,
            arn: eventarn,
            emailId: email,
            pin: pincode,
            City: city,   
            State: state
        }),
        success: function (response) {
            toastr.success("Registration successful.    We look forward to your presence");
            // Optionally move to next div
            setTimeout(function () {
                window.location.href = 'https://wealthcompany.in';
            }, 3000); 

        },
        error: function (xhr) {
            alert("Error: " + xhr.responseText);
        }
    });
}
$('#eventPincode').on('input', function () {
    const pin = $(this).val();

    if (pin.length === 6) {
        $.ajax({
            url: clientprofileapi + '/api/UsersNominee/GetAddressDetailsPinCode',
            type: 'GET',
            data: { PINCode: pin },
            success: function (response) {
                if (response.code === 200 && response.data) {
                    $('#eventcity').val(response.data.cityName);
                    $('#eventstate').val(response.data.stateName);
                } else {
                    toastr.error("Please enter correct pincode");
                }
            },
            error: function () {
                toastr.error("Please enter correct pincode");
            }
        });
    } else {
        $('#city').val('');
        $('#state').val('');
    }
});
function Insertmfdsif(button) {
    const orgname = document.getElementById("mfdsifOrgName").value.trim();
    const name = document.getElementById("mfdsifName").value.trim();
    const email = document.getElementById("mfdsifEmail").value.trim();
    const mobile = document.getElementById("mfdsifMobile").value.trim();
    const panno = document.getElementById("mfdsifpan").value.trim();
    const arn = document.getElementById("mfdsifarn").value.trim();
    const pincode = document.getElementById("mfdsifPincode").value.trim();
    const city = document.getElementById("mfdsifcity")?.value.trim() || '';
    const state = document.getElementById("mfdsifstate")?.value.trim() || '';

    // Custom email validation function
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validation with toastr alerts
    if (!name) return toastr.warning("Please enter your Name.");
    if (!email || !isValidEmail(email)) return toastr.warning("Please enter a valid Email.");
    if (!arn) return toastr.warning("Please enter ARN No.");
    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) return toastr.warning("Please enter a valid 10-digit Mobile number.");
    if (!panno) return toastr.warning("Please enter PAN No.");
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return toastr.warning("Please enter a valid 6-digit Pincode.");
    //if (!city) return toastr.warning("Please enter your City.");
    //if (!state) return toastr.warning("Please enter your State.");
    // PAN format: 10 characters, 4th char must be 'P'
    const panRegex = /^[A-Z]{3}P[A-Z]\d{4}[A-Z]$/i;
    if (!panRegex.test(panno)) {
        toastr.error("Invalid PAN number.");
        return;
    }

    // AJAX call
    $.ajax({
        url: TWCAPI + '/api/Client/InsertMFDSIFRegistration',
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            name: name,
            orgName: orgname,
            mobileno: mobile,
            arn: arn,
            pan: panno.toUpperCase(),
            emailId: email,
            pin: pincode,
            City: city,
            State: state
        }),
        success: function (response) {
            toastr.success("Registration successful.    We look forward to your presence");
            // Optionally move to next div
            setTimeout(function () {
                window.location.href = 'https://wealthcompany.in/mfd_sif_training';
            }, 3000);

        },
        error: function (xhr) {
            alert("Error: " + xhr.responseText);
        }
    });
}
$('#mfdsifPincode').on('input', function () {
    const pin = $(this).val();

    if (pin.length === 6) {
        $.ajax({
            url: clientprofileapi + '/api/UsersNominee/GetAddressDetailsPinCode',
            type: 'GET',
            data: { PINCode: pin },
            success: function (response) {
                if (response.code === 200 && response.data) {
                    $('#mfdsifcity').val(response.data.cityName);
                    $('#mfdsifstate').val(response.data.stateName);
                } else {
                    toastr.error("Please enter correct pincode");
                }
            },
            error: function () {
                toastr.error("Please enter correct pincode");
            }
        });
    } else {
        $('#mfdsifcity').val('');
        $('#mfdsifstate').val('');
    }
});