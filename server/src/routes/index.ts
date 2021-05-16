import Login from "./serverDetails";
import Command from "./command";

import { FastifyInstance, FastifyPluginOptions } from "fastify";
export default function (
    routes: FastifyInstance,
    _opts: FastifyPluginOptions,
    _done: (err?: Error) => void
) {
    routes.register(Login, { prefix: "/backend" });
    routes.register(Command, { prefix: "/backend" });
}
