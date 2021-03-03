import {Router} from "express";
import Login from "./serverDetails";

let router = Router();

router.use("/backend", Login);

export default router;