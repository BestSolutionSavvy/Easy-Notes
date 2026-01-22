require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./api.yaml");

const notebookRouter = require("./src/routes/notebooksRoutes");
const userRouter = require("./src/routes/userRoutes");
const classesRouter = require("./src/routes/classesRoutes");
const pdfRouter = require("./src/routes/pdfRouter");
const summarizeRouter = require('./src/routes/summarizeRoutes');

const isDevelopment = process.argv.includes('--dev');

mongoose.connect(process.env.MONGO_URI, {
  dbName: "easy-notes",
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 5000,
});

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/notebooks", notebookRouter);
app.use("/api/users", userRouter);
app.use("/api/classes", classesRouter);
app.use("/api/pdfs", pdfRouter);
app.use('/api/summarize', summarizeRouter);

if (isDevelopment) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
    if (isDevelopment) {
        console.log('API docs available at http://localhost:3000/api/docs');
    }
});
