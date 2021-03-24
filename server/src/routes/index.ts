import { Router } from "express";
import Login from "./serverDetails";
import Command from "./command";

let router = Router();

router.use("/backend", Login);
router.use("/backend", Command);

export default router;
