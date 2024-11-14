import {type GenerateLinkProperties} from "@supabase/supabase-js";
import {corsHeaders} from "../_shared/cors.ts";
import {supabaseAdmin} from "../_shared/supabase.ts";

async function generateSignupLink(
    emailAddress: string,
    password: string,
): Promise<GenerateLinkProperties> {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email: emailAddress,
        password,
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
        const { emailAddress, password } = await req.json();

        const signupData = await generateSignupLink(emailAddress, password);

        const responseData = {
            signupLink: signupData.action_link,
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
