import 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';
import admin from 'firebase-admin';
// So Typescript sees the decorator added in index.ts
declare module 'fastify' {
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

/**
 * An object containing a single server's data.
 *
 * Expected to be used as an ExpectedJSONData[]
 */
export interface ExpectedJSONData {
  gameFolderName: string;
  server: string;
  details_string: string;
}

/**
 * The final form of all the server data combined.
 *
 * Should match IncomingServerStatuses on client-side
 * */
export interface OutgoingServerStatuses {
  [game: string]: {
    [server: string]: {
      is_online: boolean;
      port: number;
    };
  };
}
