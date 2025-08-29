const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const oldpw = "password12345";
const SQLPassword =
  "$2b$10$709RcGITaRFQVp9XmTaz9OmMss6DegOq40HO9DU5g7uGEMcSR963C";

const app = express();
app.use(cors());
app.use(express.json());

// app.use(bodyParser.urlencoded({ extended: true }));

app.post("/login", async (req, res) => {
  res.sendStatus(200);
  console.log("received data", req.body);

  const username = req.body.username;
  const password = req.body.password;

  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);

  (await bcrypt.compare(password, SQLPassword))
    ? console.log("Login successful, output is:", true)
    : console.log("Login failed, output is:", false);
});

const port = 8080;

app.listen(port, () => {
  console.log("Server running on port", port);
});
