import express from "express";

//config env
import "dotenv/config";

const app = express();
const port = process.env.PORT || 2727;

app.get("/", (req, res) => {
  res.send("Test!");
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
