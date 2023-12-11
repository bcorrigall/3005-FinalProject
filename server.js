// --------------------- Import Required Modules --------------
const express = require("express");
const session = require("express-session");
const logger = require("morgan");
const http = require("http");
const bodyParser = require("body-parser");
const db = require("./server/dbConnect.js"); // database connection
const {
    verifyUser,
    registerUser,
    getAll,
    getMembersInClass,
    joinTablesOn,
    getAllWithID,
    matchTrainers,
    insertWithID,
    deleteAllWithId,
    toggleAllWithID,
    addLoyalty,
    updateMaintenance,
    getAllEquipmentWithRoomNames,
} = require("./server/queries.js");
const e = require("express");

// ------------- Initialize Express app and Port --------------
const app = express();
const PORT = 3000;
// ----------------------- Start the Server -----------------------
const server = http.createServer(app); // create an HTTP server with Express app
server.timeout = 10000;

// ---------------------- View Engine Setup ---------------------
app.set("view engine", "pug"); // sets pug as the view engine, templates will be .pug files
app.set("views", "./views"); // sets the path to the directory containing the pug files

// --------------------- Middleware Setup ----------------

// session middleware
app.use(
    session({
        secret: "top secret key",
        resave: true,
        saveUninitialized: false,
    })
);

// authorization middleware
const requireRole = role => (req, res, next) => {
    if (req.session.userRole !== role) {
        return res.status(403).send("Forbidden"); // user does not have required role
    }

    next();
};

// logging middleware
app.use(
    logger((tokens, req, res) => {
        return [`METHOD: ${tokens.method(req, res)}`, `FILEPATH: ${tokens.url(req, res)}`, `STATUS: ${tokens.status(req, res)}`].join(" || ");
    })
);

// parsing json middleware
app.use(express.json()); //<--- we currently do not send any json files, not sure we will be sending in the future. i dont think we will need this

// Use bodyParser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------- Static File Setup ---------------------
// serves static files from the public folder (css, images)
app.use(express.static("public"));

// --------------------------- Routes ---------------------------

// landing Page Route
app.get("/", async (req, res) => {
    res.render("./home", { session: req.session });
});

// equipment page route
app.get("/equipment", async (req, res) => {
    try {
        // console.log(req.session.userRole);
        let result = await getAllEquipmentWithRoomNames(db);

        res.render("equipment", { session: req.session, result });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// members page route
app.get("/members", requireRole("admins"), async (req, res) => {
    try {
        // console.log(req.session.userRole);
        const result = await getAll(db, "Members");

        console.log("Result:", result);
        res.render("members", { session: req.session, result });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// trainers page route
app.get("/trainers", requireRole("admins"), async (req, res) => {
    try {
        // console.log(req.session.userRole);
        const result = await getAll(db, "Trainers");

        console.log("Result:", result);
        res.render("trainers", { session: req.session, result });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// rooms page route
app.get("/rooms", requireRole("admins"), async (req, res) => {
    try {
        console.log(req.session.userRole);

        let result = await getAll(db, "Rooms");

        res.render("rooms", { session: req.session, result });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// classes page route
app.get("/classes", async (req, res) => {
    try {
        console.log(req.session.userRole);

        let result = await getAll(db, "Classes");

        res.render("classes", { session: req.session, result });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// members page route
app.get("/members/:member_id", async (req, res) => {
    const { member_id } = req.params;

    try {
        console.log(req.session.userRole + req.session.userID);
        if (req.session.userRole !== "admins" && req.session.userRole !== "trainers" && String(req.session.userID) !== member_id) {
            res.status(403).send("Forbidden");
        }

        let member = await getAllWithID(db, "Members", "m_id", member_id);
        let goals = await getAllWithID(db, "Goals", "m_id", member_id);
        let exercises = await getAllWithID(db, "Exercises", "m_id", member_id);
        let sessions = await matchTrainers(db, "m_id", member_id);
        let complaints = await getAllWithID(db, "Complaints", "m_id", member_id);
        let payments = await getAllWithID(db, "Payments", "m_id", member_id);
        let loyalty = await getAllWithID(db, "Loyalty", "m_id", member_id);
        let health = await getAllWithID(db, "Health", "m_id", member_id);

        let data = {
            member: member,
            goals: goals,
            exercises: exercises,
            sessions: sessions,
            complaints: complaints,
            payments: payments,
            loyalty: loyalty,
            health: health,
        };

        res.render("member", { session: req.session, data });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// trainers page route
app.get("/trainers/:trainer_id", async (req, res) => {
    const { trainer_id } = req.params;
    try {
        // early return for unauthorized access
        if (req.session.userRole !== "admins" && String(req.session.userID) !== trainer_id) {
            return res.status(403).send("Forbidden");
        }

        // fetch trainer details
        let trainer = await getAllWithID(db, "Trainers", "t_id", trainer_id);

        // fetch sessions associated with the trainer
        let sessions = await matchTrainers(db, "t_id", trainer_id);

        // prepare data to be rendered
        let data = {
            trainer: trainer,
            sessions: sessions,
        };

        // render the trainer page with fetched data
        res.render("trainer", { session: req.session, data });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// equipment page route
app.get("/equipment/:equipment_id", requireRole("admins"), async (req, res) => {
    const { equipment_id } = req.params;
    try {
        let data = await getAllWithID(db, "Equipment", "e_id", equipment_id);

        res.render("equipmentIndividual", { session: req.session, data });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/rooms/:room_id", async (req, res) => {
    const { room_id } = req.params;
    try {
        // early return if user is not an admin
        if (req.session.userRole !== "admins") res.status(403).send("Forbidden");

        let room = await getAllWithID(db, "Rooms", "r_id", room_id);

        let equipment = await getAllWithID(db, "Equipment", "r_id", room_id);

        let bookings = await joinTablesOn(db, "Bookings", "Classes", "b_id", room_id, "r_id");

        let data = {
            room: room,
            equipment: equipment,
            bookings: bookings,
        };

        res.render("room", { session: req.session, data });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/classes/:class_id", async (req, res) => {
    const { class_id } = req.params;
    try {
        console.log(req.session.userRole + req.session.userID);

        // early return for unauthorized access
        if (req.session.userRole !== "admins" && req.session.userRole !== "members") {
            return res.status(403).send("Forbidden");
        }

        let iClass = await getAllWithID(db, "Classes", "c_id", class_id);
        if (iClass.length === 0) {
            return res.status(404).send("Class not found");
        }

        let booking = await getAllWithID(db, "Bookings", "b_id", iClass[0].b_id);
        if (booking.length === 0) {
            return res.status(404).send("Booking not found");
        }

        let room = await getAllWithID(db, "Rooms", "r_id", booking[0].r_id);
        let members = await getMembersInClass(db, class_id);

        let data = {
            iClass: iClass,
            booking: booking,
            room: room,
            members: members,
        };

        res.render("class", { session: req.session, data });
    } catch (err) {
        console.error("Error:", err);
        if (err.code === "ENOENT") {
            res.status(404).send("Template not found");
        } else {
            res.status(500).send("Internal Server Error");
        }
    }
});

app.post("/submit", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const userType = req.body.userChoice;
    const loginType = req.body.loginChoice;

    try {
        if (loginType === "logout") {
            req.session.destroy(err => {
                if (err) {
                    console.error("Error destroying session:", err);
                    res.redirect("/");
                }
            });
        } else if (loginType === "login") {
            const result = await verifyUser(db, userType, username, password);
            console.log("Verified User:", result);
            if (result.length === 0) {
                console.log("incorrect password");
            } else {
                req.session.userRole = userType;
                if (userType === "members") {
                    req.session.userID = result[0].m_id;
                    res.redirect("/" + userType + "/" + req.session.userID);
                } else if (userType === "trainers") {
                    req.session.userID = result[0].t_id;
                    res.redirect("/" + userType + "/" + req.session.userID);
                } else if (userType === "admins") {
                    req.session.userID = result[0].a_id;
                    res.redirect("/members");
                }
            }
        } else if (loginType === "register") {
            let result = await registerUser(db, userType, username, password);
            console.log("Added new user:", result);
            res.redirect("/");
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/goals", async (req, res) => {
    const goal = req.body.goal;
    const id = req.body.m_id;

    try {
        await insertWithID(db, "Goals", ["m_id", "description"], [id, goal]);

        console.log("Goal inserted successfully for member ID:", id);

        res.redirect("/members/" + id);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/workouts", async (req, res) => {
    const bodyGroup = req.body.bodyGroup;
    const description = req.body.description;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const date = new Date(req.body.date);
    const id = req.body.m_id;

    try {
        await insertWithID(
            db,
            "Exercises",
            ["m_id", "date", "body_group", "description", "start_time", "end_time"],
            [id, date, bodyGroup, description, startTime, endTime]
        );

        console.log("Workout inserted successfully for member ID:", id);
        res.redirect("/members/" + id);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/session", async (req, res) => {
    const trainerName = req.body.trainerName;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const date = new Date(req.body.date);
    const id = req.body.m_id;

    try {
        // fetch the trainer details
        let trainer = await getAllWithID(db, "Trainers", "name", trainerName);

        // check if trainer exists
        if (!trainer || trainer.length === 0) return res.status(404).send("Trainer not found");

        // insert the session
        await insertWithID(db, "Sessions", ["m_id", "t_id", "date", "start_time", "end_time"], [id, trainer[0].t_id, date, startTime, endTime]);

        // if insertion is successful
        console.log("Session inserted successfully for member ID:", id);
        res.redirect("/members/" + id);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/trainersSession", async (req, res) => {
    const memberName = req.body.memberName;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const date = new Date(req.body.date);
    const id = req.body.t_id;

    try {
        let member = await getAllWithID(db, "Members", "name", memberName);

        if (!member || member.length === 0) return res.status(404).send("Member not found");

        await insertWithID(db, "Sessions", ["m_id", "t_id", "date", "start_time", "end_time"], [member[0].m_id, id, date, startTime, endTime]);

        res.redirect("/trainers/" + id);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/health", async (req, res) => {
    const weight = req.body.weight;
    const height = req.body.height;
    const date = new Date(req.body.date);
    const id = req.body.m_id;

    try {
        await insertWithID(db, "Health", ["m_id", "weight", "height", "date"], [id, weight, height, date]);

        res.redirect("/members/" + id);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/addEquipment", async (req, res) => {
    const equipmentName = req.body.equipmentName;
    const date = new Date(req.body.date);
    const r_id = req.body.r_id;

    try {
        await insertWithID(db, "Equipment", ["r_id", "e_name", "target_date"], [r_id, equipmentName, date]);

        res.redirect("/rooms/" + r_id);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/complaint", async (req, res) => {
    const complaint = req.body.complaint;
    const id = req.body.m_id;

    try {
        await insertWithID(db, "Complaints", ["m_id", "description"], [id, complaint]);

        res.redirect(req.get("referer"));
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/delete", async (req, res) => {
    const { idType, id, table } = req.body;

    try {
        const result = await deleteAllWithId(db, table, idType, id);

        res.redirect(req.get("referer"));
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/deleteBooking", async (req, res) => {
    const { b_id, c_id } = req.body;

    try {
        // deleting associated MemberClasses
        await deleteAllWithId(db, "MemberClasses", "c_id", c_id);

        // deleting associated Classes
        await deleteAllWithId(db, "Classes", "b_id", b_id);

        // deleting the Booking
        const result = await deleteAllWithId(db, "Bookings", "b_id", b_id);

        res.redirect(req.get("referer"));
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/pay", async (req, res) => {
    const id = req.body.id;
    const m_id = req.body.m_id;
    const cost = req.body.cost;

    try {
        // toggle the 'processed' state of the payment
        await toggleAllWithID(db, "Payments", "p_id", id, "processed");

        // add loyalty points when payment is processed
        await addLoyalty(db, cost, m_id);

        // redirect back to the previous page, req has the referer
        res.redirect(req.get("referer"));
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/maintenance", async (req, res) => {
    if (!req.body.date) {
        console.error("No date provided");
        return res.status(400).send("Date is required");
    }

    const date = new Date(req.body.date);
    const e_id = req.body.id;

    try {
        await updateMaintenance(db, e_id, date);
        res.redirect(req.get("referer"));
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// ----------------------- Start the Server -----------------------
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
