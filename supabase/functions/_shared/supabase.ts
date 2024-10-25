import {
    createClient,
    type SupabaseClient,
} from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

export const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
        global: {
            headers: {
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    },
);

export function createSupabaseClient(req: Request): SupabaseClient {
    const authHeader = req.headers.get("Authorization")!;

    return createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: authHeader,
                },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
        },
    );
}
