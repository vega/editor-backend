require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.PORT || 9000;
app.get("/", (req: any, res: any) => {
  res.send("Initialized backend server for vega/editor-backend");
});

app.listen(port, (err: any) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`Server is listening on ${port}`);
});
