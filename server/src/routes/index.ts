import {Router} from "express";
import Login from "./serverDetails";

let router = Router();

router.use("/", Login);

export default Login;