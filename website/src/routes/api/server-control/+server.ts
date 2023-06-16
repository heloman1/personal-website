import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = function ({ url }) {

    return new Response("Placeholder");
}