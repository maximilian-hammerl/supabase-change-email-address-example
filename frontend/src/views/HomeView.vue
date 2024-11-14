<script setup lang="ts">
import { ref } from 'vue'
import { supabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const currentStep = ref<
  | 'requestSignupLink'
  | 'confirmSignup'
  | 'login'
  | 'requestChangeEmailAddressLinks'
  | 'testLinks'
>('requestSignupLink')

const emailAddress = ref<string>(`${crypto.randomUUID()}@test.com`)
const password = ref<string>(crypto.randomUUID())
const newEmailAddress = ref<string>(`${crypto.randomUUID()}@test.com`)

const signupLink = ref<string>('')
const currentEmailAddressLink = ref<string>('')
const newEmailAddressLink = ref<string>('')

const isLoading = ref<boolean>(false)

async function login() {
  isLoading.value = true
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailAddress.value,
    password: password.value,
  })
  isLoading.value = false

  if (error) {
    throw new Error(error.message)
  }

  currentStep.value = 'requestChangeEmailAddressLinks'
}

async function invokeFunction<T>(
  functionName: string,
  requestData: object,
): Promise<T> {
  isLoading.value = true
  const { data, error } = await supabaseClient.functions.invoke(functionName, {
    body: requestData,
  })
  isLoading.value = false

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function requestSignupLink() {
  const response = await invokeFunction<{
    signupLink: string
  }>('request-signup-link', {
    emailAddress: emailAddress.value,
    password: password.value,
  })

  signupLink.value = response.signupLink
  currentStep.value = 'confirmSignup'
}

async function requestChangeEmailAddressLinks() {
  const response = await invokeFunction<{
    currentEmailAddressLink: string
    newEmailAddressLink: string
  }>('request-change-email-address-links', {
    currentEmailAddress: emailAddress.value,
    newEmailAddress: newEmailAddress.value,
  })

  currentEmailAddressLink.value = response.currentEmailAddressLink
  newEmailAddressLink.value = response.newEmailAddressLink
  currentStep.value = 'testLinks'

  await loadUser()
}

const currentUser = ref<User | null>(null)

async function loadUser() {
  const { data, error } = await supabaseClient.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  currentUser.value = data.user
}
</script>

<template>
  <div>
    <div v-if="currentStep === 'testLinks'">
      <h1>Test Change E-Mail Address Links</h1>

      <div style="margin-bottom: 1rem">
        <div>
          Current e-mail address link (<code>email_change_current</code>):
        </div>
        <a target="_blank" :href="currentEmailAddressLink">
          {{ currentEmailAddressLink }}
        </a>
      </div>

      <div style="margin-bottom: 1rem">
        <div>New e-mail address link (<code>email_change_new</code>):</div>
        <a target="_blank" :href="newEmailAddressLink">
          {{ newEmailAddressLink }}
        </a>
      </div>

      <div style="margin-bottom: 1rem">
        <div>
          <strong>Important:</strong>
          The links lead nowhere, but you can see the result from the URL
          fragment.
        </div>
        <div>
          If the URL fragment looks like
          <code>#access_token=...&refresh_token=...&...</code>, the action was
          successful. (More details:
          <a
            target="_blank"
            href="https://supabase.com/docs/guides/auth/sessions/implicit-flow"
            >Supabase implicit flow</a
          >)
        </div>
        <div>
          If the URL fragment looks like
          <code>#error=...&error_code=...&...</code>, the action failed.
        </div>
      </div>

      <div>
        Requested e-mail address:
        <strong>{{ newEmailAddress }}</strong>
      </div>

      <div style="margin-bottom: 1rem">
        Current e-mail address:
        <span v-if="currentUser === null">Loading...</span>
        <strong v-else>
          {{ currentUser.email }}
        </strong>
      </div>

      <div style="margin-bottom: 1rem">
        <div>
          After clicking on either link, click on the button to see that the
          current e-mail address has changed to the requested e-mail address
          after clicking on just one of the two links.
        </div>
        <div>
          Clicking on the second link will lead to an error (check the URL
          fragment).
        </div>
      </div>

      <div>
        <button @click="loadUser()" :disabled="isLoading">
          Reload user and display current e-mail address
        </button>
      </div>
    </div>

    <div v-else-if="currentStep === 'requestChangeEmailAddressLinks'">
      <h1>Request Change E-Mail Address Links</h1>

      <form @submit.prevent="requestChangeEmailAddressLinks">
        <div style="margin-bottom: 1rem">
          <label>
            New e-mail address
            <input
              v-model="newEmailAddress"
              type="email"
              required
              :disabled="isLoading"
            />
          </label>
        </div>
        <div style="margin-bottom: 1rem">
          <div>The new e-mail address is randomly generated.</div>
          <div>
            When clicking on the button, the
            <code>request-change-email-address-links</code> edge function is
            called. It will create the <code>email_change_current</code> and
            <code>email_change_new</code> links using the
            <a
              target="_blank"
              href="https://supabase.com/docs/reference/javascript/auth-admin-generatelink"
              >Supabase <code>generateLink</code> function</a
            >.
          </div>
        </div>
        <div>
          <button type="submit" :disabled="isLoading">
            Request change e-mail address links
          </button>
        </div>
      </form>
    </div>

    <div v-else-if="currentStep === 'login'">
      <h1>Login</h1>

      <div style="margin-bottom: 1rem">
        <div>
          When clicking on the button, the
          <a
            target="_blank"
            href="https://supabase.com/docs/reference/javascript/auth-signinwithpassword"
            >Supabase <code>signInWithPassword</code> function</a
          >
          will be called with the previously entered e-mail address and
          password.
        </div>
      </div>

      <div>
        <button :disabled="isLoading" @click="login()">Login</button>
      </div>
    </div>

    <div v-else-if="currentStep === 'confirmSignup'">
      <h1>Confirm Signup</h1>

      <div style="margin-bottom: 1rem">
        <div>Signup link (<code>signup</code>):</div>
        <a target="_blank" :href="signupLink">
          {{ signupLink }}
        </a>
      </div>

      <div style="margin-bottom: 1rem">
        <div>
          <strong>Important:</strong>
          The link leads nowhere, but you can see the result from the URL
          fragment.
        </div>
        <div>
          If the URL fragment looks like
          <code>#access_token=...&refresh_token=...&...</code>, the action was
          successful. (More details:
          <a
            target="_blank"
            href="https://supabase.com/docs/guides/auth/sessions/implicit-flow"
            >Supabase implicit flow</a
          >)
        </div>
        <div>
          If the URL fragment looks like
          <code>#error=...&error_code=...&...</code>, the action failed.
        </div>
      </div>

      <div>
        <button :disabled="isLoading" @click="currentStep = 'login'">
          Continue to login
        </button>
      </div>
    </div>

    <div v-else-if="currentStep === 'requestSignupLink'">
      <h1>Request Signup Link</h1>
      <form @submit.prevent="requestSignupLink()">
        <div style="margin-bottom: 1rem">
          <label>
            E-mail address
            <input
              v-model="emailAddress"
              type="email"
              required
              :disabled="isLoading"
            />
          </label>
        </div>
        <div style="margin-bottom: 1rem">
          <label>
            Password
            <input
              v-model="password"
              type="text"
              required
              :disabled="isLoading"
            />
          </label>
        </div>
        <div style="margin-bottom: 1rem">
          <div>The e-mail address and password are randomly generated.</div>
          <div>
            When clicking on the button, the
            <code>request-signup-link</code> edge function is called. It will
            create the <code>signup</code> link using the
            <a
              target="_blank"
              href="https://supabase.com/docs/reference/javascript/auth-admin-generatelink"
              >Supabase <code>generateLink</code> function</a
            >.
          </div>
        </div>
        <div>
          <button type="submit" :disabled="isLoading">
            Request signup link
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
