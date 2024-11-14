import {type GenerateLinkProperties, type SupabaseClient, type User,} from "@supabase/supabase-js";
import {createSupabaseClient, supabaseAdmin} from "../_shared/supabase.ts";
import {corsHeaders} from "../_shared/cors.ts";

async function getCurrentUser(supabaseClient: SupabaseClient): Promise<User> {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.log(error);
        throw new Error(error.message);
    }

    return data.user;
}

async function generateEmailChangeCurrentLink(
    currentEmailAddress: string,
    newEmailAddress: string,
): Promise<GenerateLinkProperties> {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "email_change_current",
        email: currentEmailAddress,
        newEmail: newEmailAddress,
    });

    if (error) {
        console.log(error);
        throw new Error(error.message);
    }

    return data.properties;
}

async function generateEmailChangeNewLink(
    currentEmailAddress: string,
    newEmailAddress: string,
): Promise<GenerateLinkProperties> {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "email_change_new",
        email: currentEmailAddress,
        newEmail: newEmailAddress,
    });

    if (error) {
        console.log(error);
        throw new Error(error.message);
    }

    return data.properties;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createSupabaseClient(req);
        const currentUser = await getCurrentUser(supabaseClient);
        const currentEmailAddress = currentUser.email!;

        const { newEmailAddress } = await req.json();

        const currentEmailAddressData = await generateEmailChangeCurrentLink(
            currentEmailAddress,
            newEmailAddress,
        );

        const newEmailAddressData = await generateEmailChangeNewLink(
            currentEmailAddress,
            newEmailAddress,
        );

        const responseData = {
            currentEmailAddressLink: currentEmailAddressData.action_link,
            newEmailAddressLink: newEmailAddressData.action_link,
        };

        return new Response(JSON.stringify(responseData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("ERROR", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
