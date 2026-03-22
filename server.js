const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 17777;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => console.log(`Gap Engine API → http://localhost:${PORT}`));