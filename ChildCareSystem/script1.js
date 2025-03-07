// ==========================
// 🚀 Parent & Warden Login
// ==========================

// Parent Login
// ==========================
function parentLogin() {
    let newEmail = document.getElementById("parentEmail").value.trim();
    let password = document.getElementById("parentPassword").value.trim();

    if (newEmail === "" || password === "") {
        alert("Please enter Email and password.");
        return;
    }

    let oldEmail = localStorage.getItem("parentEmail");

    // If a new parent logs in, only clear their session (not other parents' data)
    if (oldEmail && oldEmail !== newEmail) {
        localStorage.removeItem("childID");
    }

    // Save the new parent's email
    localStorage.setItem("parentEmail", newEmail);

    // Ensure each parent has a separate child list
    if (!localStorage.getItem(`parentChildren_${newEmail}`)) {
        localStorage.setItem(`parentChildren_${newEmail}`, JSON.stringify({}));
    }

    // Redirect to parent dashboard
    window.location.href = "parent.html";
}

// Warden Login
function wardenLogin() {
    let Email = document.getElementById("wardenEmail").value.trim();
    let password = document.getElementById("wardenPassword").value.trim();

    if (Email === "" || password === "") {
        alert("Please enter Email and password.");
    } else {
        window.location.href = "warden.html";
    }
}

// ==========================
// 🚀 Parent - Add Child Details
// ==========================
function addChildDetails() {
    let parentEmail = localStorage.getItem("parentEmail");
    if (!parentEmail) {
        alert("No parent session found. Please log in again.");
        window.location.href = "index.html"; // Redirect to login if no parent found
        return;
    }

    let childName = document.getElementById("childName").value.trim();
    let childID = document.getElementById("childID").value.trim();

    if (childName === "" || childID === "") {
        alert("All fields are required.");
        return;
    }

    // Get current parent's children
    let parentChildren = JSON.parse(localStorage.getItem(`parentChildren_${parentEmail}`)) || {};

    // Add new child
    parentChildren[childID] = childName;
    localStorage.setItem(`parentChildren_${parentEmail}`, JSON.stringify(parentChildren));

    // Save child data globally
    localStorage.setItem(`childName_${childID}`, childName);
    localStorage.setItem("childID", childID);

    window.location.href = "schedule.html";
}

// ==========================
// 🚀 Load Child Name in Schedule Page
// ==========================
document.addEventListener("DOMContentLoaded", function () {
    let childID = localStorage.getItem("childID");

    if (!childID) return; 

    let parentEmail = localStorage.getItem("parentEmail");
    let parentChildren = JSON.parse(localStorage.getItem(`parentChildren_${parentEmail}`)) || {};

    if (!parentChildren[childID]) {
        return;
    }

    let childName = parentChildren[childID];

    if (window.location.pathname.includes("schedule.html")) {
        let nameElement = document.getElementById("childScheduleName");
        if (nameElement) nameElement.innerText = childName;
        loadSchedule();
    } else if (window.location.pathname.includes("parent.html")) {
        loadSchedule();
    }
});

// ==========================
// 🚀 Parent - Manage Schedule (Add, Update, Delete)
// ==========================
function loadSchedule() {
    let parentEmail = localStorage.getItem("parentEmail");
    let childID = localStorage.getItem("childID");

    if (!parentEmail || !childID) return;

    let parentChildren = JSON.parse(localStorage.getItem(`parentChildren_${parentEmail}`)) || {};

    if (!parentChildren[childID]) {
        alert("Unauthorized access! This child does not belong to your account.");
        return;
    }

    let childName = parentChildren[childID];
    let scheduleList = document.getElementById("scheduleList");

    if (!scheduleList) return;

    document.getElementById("childScheduleName").innerText = childName;

    let storedSchedule = JSON.parse(localStorage.getItem(`schedule_${childID}`)) || {};
    scheduleList.innerHTML = ""; 

    Object.entries(storedSchedule).forEach(([activity, time]) => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `${activity}: ${time} 
            <button onclick="deleteSchedule('${activity}')">❌</button>`;
        scheduleList.appendChild(listItem);
    });
}

// 🚀 Save Schedule
// ==========================
function saveSchedule() {
    let childID = localStorage.getItem("childID");

    if (!childID) {
        alert("No child selected. Please go back and select a child.");
        return;
    }

    let schedule = {
        "Eating Time": document.getElementById("eatingTime").value,
        "Sleeping Time": document.getElementById("sleepingTime").value,
        "Play Time": document.getElementById("playTime").value,
        "Study Time": document.getElementById("studyTime").value
    };

    localStorage.setItem(`schedule_${childID}`, JSON.stringify(schedule));
    alert("Schedule Saved Successfully!");
}
// ==========================
// 🚀 Warden - View Specific Child Schedule
// ==========================
function viewChildSchedule() {
    let searchChildID = document.getElementById("searchChildID").value.trim();

    if (!searchChildID) {
        alert("Please enter a valid Child ID.");
        return;
    }

    let storedSchedule = localStorage.getItem(`schedule_${searchChildID}`);

    if (!storedSchedule) {
        alert("No schedule found for this child.");
        return;
    }

    let schedule = JSON.parse(storedSchedule);
    let childName = localStorage.getItem(`childName_${searchChildID}`) || "Unknown";
    // Display child name
    document.getElementById("childScheduleName").innerText = childName;

    // Display schedule
    let scheduleList = document.getElementById("wardenScheduleList");
    scheduleList.innerHTML = ""; // Clear previous data

    Object.entries(schedule).forEach(([activity, time]) => {
        let listItem = document.createElement("li");
        listItem.innerText = `${activity}: ${time}`;
        scheduleList.appendChild(listItem);
    });

    document.getElementById("wardenScheduleSection").classList.remove("hidden");
}

// ==========================
// 🚀 Warden - View All Child Schedules
// ==========================
function viewAllChildSchedules() {
    let allSchedulesTable = document.getElementById("allSchedulesTable");
    let allChildSchedulesDiv = document.getElementById("allChildSchedules");

    if (!allSchedulesTable || !allChildSchedulesDiv) return;

    allSchedulesTable.innerHTML = ""; // Clear previous data

    let hasData = false;

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("schedule_")) { // Identify schedule data
            let childID = key.replace("schedule_", "");
            let childName = localStorage.getItem(`childName_${childID}`) || "Unknown";
            let schedule = JSON.parse(localStorage.getItem(key));

            Object.entries(schedule).forEach(([activity, time]) => {
                let row = `<tr>
                    <td>${childID}</td>
                    <td>${childName}</td>
                    <td>${activity}</td>
                    <td>${time}</td>
                </tr>`;
                allSchedulesTable.innerHTML += row;
                hasData = true;
            });
        }
    });

    if (!hasData) {
        allSchedulesTable.innerHTML = `<tr><td colspan="4">No schedules found.</td></tr>`;
    }

    allChildSchedulesDiv.classList.remove("hidden");
}

// ✅ Make functions available globally for HTML onclick handlers
window.viewChildSchedule = viewChildSchedule;
window.viewAllChildSchedules = viewAllChildSchedules;
// ==========================
// 🚀 Delete Schedule Item
// ==========================
function deleteSchedule(activity) {
    let childID = localStorage.getItem("childID");
    if (!childID) return;

    let storedSchedule = JSON.parse(localStorage.getItem(`schedule_${childID}`)) || {};

    delete storedSchedule[activity]; 
    localStorage.setItem(`schedule_${childID}`, JSON.stringify(storedSchedule));
    alert("Schedule Deleted!");
    loadSchedule();
}


// ==========================
// 🚀 Add or Update Schedule
// ==========================
function addOrUpdateSchedule() {
    let childID = localStorage.getItem("childID");
    if (!childID) return;

    let activity = document.getElementById("activityType").value.trim();
    let time = document.getElementById("activityTime").value.trim();

    if (activity === "" || time === "") {
        alert("Please enter a valid activity and time.");
        return;
    }

    let storedSchedule = JSON.parse(localStorage.getItem(`schedule_${childID}`)) || {};
    storedSchedule[activity] = time;

    localStorage.setItem(`schedule_${childID}`, JSON.stringify(storedSchedule));
    alert("Schedule Updated!");
    loadSchedule();
}
//==========================
// 🚀 Save Schedule
// ==========================
function saveSchedule() {
    let childID = localStorage.getItem("childID");

    if (!childID) {
        alert("No child selected. Please go back and select a child.");
        return;
    }

    let schedule = {
        "Eating Time": document.getElementById("eatingTime").value,
        "Sleeping Time": document.getElementById("sleepingTime").value,
        "Play Time": document.getElementById("playTime").value,
        "Study Time": document.getElementById("studyTime").value
    };

    localStorage.setItem(`schedule_${childID}`, JSON.stringify(schedule));
    alert("Schedule Saved Successfully!");
}

// ==========================
// 🚀 Schedule Notifications for Parents
// ==========================
function scheduleNotifications(childID) {
    let schedule = JSON.parse(localStorage.getItem(`schedule_${childID}`));
    if (!schedule) return;

    Object.entries(schedule).forEach(([activity, time]) => {
        if (time) {
            let now = new Date();
            let notificationTime = new Date();
            let [hours, minutes] = time.split(":");
            notificationTime.setHours(hours, minutes, 0, 0);

            let timeDiff = notificationTime - now;

            if (timeDiff > 0) {
                setTimeout(() => {
                    let childName = localStorage.getItem(`childName_${childID}`) || "your child";
                    alert(`Reminder: ${activity} for ${childName}`);
                }, timeDiff);
            }
        }
    });
}
window.viewAllChildSchedules = viewAllChildSchedules;
window.deleteSchedule = deleteSchedule;
window.saveSchedule = saveSchedule;
window.parentLogin = parentLogin;
window.wardenLogin = wardenLogin;
window.addChildDetails = addChildDetails;
window.loadSchedule = loadSchedule;

