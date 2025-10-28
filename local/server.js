const express = require("express");
const path = require("path");

const app = express();
const PORT = 4001;

// Static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Root redirects to index.html
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, "public")}`);
});
