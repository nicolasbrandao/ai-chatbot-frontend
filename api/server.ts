import express from "express";
import next from "next";
import { routes } from "./route";
import cors from "cors";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Use your combined routes
  server.use(express.json());
  server.use(cors());
  server.use(routes);
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3001, () => {
    console.log("> Ready on http://localhost:3001");
  });
});
