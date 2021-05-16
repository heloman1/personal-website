import serverDetails from "./serverDetails";
import Command from "./command";

import { FastifyInstance, FastifyPluginOptions } from "fastify";
export default function (
    routes: FastifyInstance,
    _opts: FastifyPluginOptions,
    done: (err?: Error) => void
) {
    routes.register(serverDetails, { prefix: "/backend" });
    routes.register(Command, { prefix: "/backend" });
    done();
}
