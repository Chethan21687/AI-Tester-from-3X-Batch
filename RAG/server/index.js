import "dotenv/config";
import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import chokidar from "chokidar";
import multer from "multer";
import { ingest, query, status, listPdfs, CFG } from "./rag.js";

const app = express();
app.use(cors());
app.use(express.json());

// Serialize ingests so watcher events + manual/upload triggers can't overlap
let ingestChain = Promise.resolve();
function runIngest(reason, fileName) {
  ingestChain = ingestChain
    .then(() => {
      console.log(`[ingest] start (${reason})${fileName ? ` -> ${fileName}` : ""}`);
      return ingest(fileName);
    })
    .then(() => console.log(`[ingest] done — ${status.chunkCount} chunks`))
    .catch((e) => console.error(`[ingest] failed: ${e.message}`));
  return ingestChain;
}

// uploads land straight in the data folder (keep original name)
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, CFG.dataDir),
    filename: (_req, file, cb) => cb(null, path.basename(file.originalname)),
  }),
  fileFilter: (_req, file, cb) =>
    cb(null, file.originalname.toLowerCase().endsWith(".pdf")),
});

// ---- API ----
app.get("/api/status", (_req, res) => res.json(status));

// list PDFs in the data folder + which one is active
app.get("/api/documents", (_req, res) =>
  res.json({ documents: listPdfs(), active: status.pdfName })
);

// re-ingest; optional { file } selects which PDF
app.post("/api/ingest", async (req, res) => {
  const file = req.body?.file;
  await runIngest(file ? "select" : "manual", file);
  res.json(status);
});

// upload a PDF then ingest it
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "PDF file required" });
  await runIngest("upload", req.file.filename);
  res.json({ ...status, uploaded: req.file.filename });
});

// delete a PDF from the data folder
app.post("/api/delete", async (req, res) => {
  const name = path.basename(req.body?.file || "");
  const target = path.join(CFG.dataDir, name);
  if (!name || !fs.existsSync(target)) {
    return res.status(400).json({ error: "file not found" });
  }
  fs.unlinkSync(target);
  const remaining = listPdfs();
  if (name === status.pdfName) {
    if (remaining.length) await runIngest("delete-fallback", remaining[0]);
    else Object.assign(status, { pdfName: null, indexed: false, chunkCount: 0 });
  }
  res.json({ documents: remaining, active: status.pdfName });
});

app.post("/api/query", async (req, res) => {
  const question = (req.body?.question || "").trim();
  if (!question) return res.status(400).json({ error: "question is required" });
  try {
    res.json(await query(question));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = Number(process.env.PORT) || 5174;
app.listen(PORT, () => {
  console.log(`RAG Explorer API on http://localhost:${PORT}`);
  console.log(`Watching data dir: ${CFG.dataDir}`);

  // auto-ingest whatever PDF is already present, then watch for changes
  runIngest("startup");
  chokidar
    .watch(CFG.dataDir, { ignoreInitial: true, awaitWriteFinish: true })
    .on("add", (p) => {
      if (p.toLowerCase().endsWith(".pdf")) runIngest("add", path.basename(p));
    })
    .on("change", (p) => {
      if (p.toLowerCase().endsWith(".pdf")) runIngest("change", path.basename(p));
    });
});
