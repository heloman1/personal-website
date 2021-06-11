//Note: This file is being loaded by routes/serverDetails.ts
import { FastifyReply } from "fastify";
import { OutgoingServerStatuses } from "../types";
import DeferredFunctions from "../utils/deferredFunctions";
import { isCommandRunning } from "../routes/command";
import Globals from "../globals";
const sseResponses = new DeferredFunctions<
    { event: string; data: string },
    void
>({ clearOnConsume: true });

// This will run whenever serverStatuses.next() is called
function sendServerData(data: OutgoingServerStatuses) {
    console.log(`SSE: Sending Server Data`);
    sseResponses.consumeAll({
        event: "serverData",
        data: JSON.stringify(data),
    });
}
Globals.getGlobals().serverStatuses.subscribe((data) => {
    sendServerData(data);
});

function sendCommandRunning(b: boolean) {
    console.log(`SSE: Inform Command Running (${b})`);
    sseResponses.consumeAll({
        event: "commandRunning",
        data: JSON.stringify(b),
    });
}
isCommandRunning.subscribe((b) => {
    sendCommandRunning(b);
});

export default function pushClient(res: FastifyReply) {
    console.log(`SSE: Client Added, Total: ${sseResponses.count}`);

    const id = sseResponses.push((data) => {
        res.raw.write(`event: ${data.event}\ndata: ${data.data}\n\n`);
    });
    res.raw.on("close", () => {
        sseResponses.kick(id);
        res.raw.end();
        console.log(`SSE: Client Closed, Total: ${sseResponses.count}`);
    });
}
