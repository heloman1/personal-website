import fastify from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import admin from "firebase-admin";
// So Typescript sees the decorator added in index.ts
declare module "fastify" {
    export interface FastifyRequest {
        user: admin.auth.DecodedIdToken | null;
    }
}


// To make typescript see querystring params correctly
export interface CommandRouteInterface extends RouteGenericInterface {
    Querystring: {
        command: string;
        game: string;
        server: string;
    };
}
