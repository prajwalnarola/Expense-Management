const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const usersRoutes = require("./routes/users.routes");

app.use(bodyParser.json());

app.use("/users", usersRoutes);

app.use("/images", express.static('/uploadProfileImage'))

app.listen(3000, () => {
    console.log("I am ready to listne you");
});

