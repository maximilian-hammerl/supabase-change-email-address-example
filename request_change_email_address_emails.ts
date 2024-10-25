import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve({ port: 4242}, (req) => {
  console.info('REQUEST', req)
  console.info('REQUEST URL', req.url)
  return new Response("ok");
});

const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
);

async function invokeFunction<T>(
  functionName: string,
  requestData: Record<string, any>,
): Promise<T> {
  const { data, error } = await supabaseClient.functions.invoke(functionName, {
    body: requestData,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function signUpUser(
    emailAddress: string,
    password: string,
): Promise<void> {
  const { error } = await supabaseClient.auth.signUp({
    email: emailAddress,
    password: password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

const emailAddress = `${crypto.randomUUID()}@test.com`;
const password = crypto.randomUUID();

await signUpUser(
    emailAddress,
    password,
)

const newEmailAddress = `${crypto.randomUUID()}@test.com`;

const {currentEmailAddressLink, newEmailAddressLink} = await invokeFunction<{
  currentEmailAddressLink: string,
  newEmailAddressLink: string
}>(
  "send-change-email-address-emails",
  { currentEmailAddress: emailAddress, newEmailAddress },
);

console.info('currentEmailAddressLink', currentEmailAddressLink)

try {
  const response = await fetch(currentEmailAddressLink);
  console.info("RESPONSE", response);
} catch(error) {
  console.error('ERROR', error)
}

try {
  const response = await fetch(newEmailAddressLink);
  console.info("RESPONSE", response);
} catch(error) {
  console.error('ERROR', error)
}
