module.exports = (req, res) => {
  const raw = String((req.query && req.query.id) || "");
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) {
    res.statusCode = 400;
    res.end("missing id");
    return;
  }
  const url =
    "https://drive.usercontent.google.com/download?id=" +
    encodeURIComponent(id) +
    "&export=download&confirm=t";
  res.statusCode = 302;
  res.setHeader("Location", url);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.end();
};
