import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {

    return {
        number: { holup: new Promise(r => setTimeout(() => r(24), 2000)) }
    }
}
