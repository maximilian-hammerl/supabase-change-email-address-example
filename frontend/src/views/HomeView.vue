<script setup lang="ts">
import { ref } from 'vue'
import { supabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const currentStep = ref<'registerLogin' | 'requestLinks' | 'testLinks'>(
  'registerLogin',
)

const emailAddress = ref<string>(`${crypto.randomUUID()}@test.com`)
const password = ref<string>(crypto.randomUUID())
const newEmailAddress = ref<string>(`${crypto.randomUUID()}@test.com`)

const currentEmailAddressLink = ref<string>('')
const newEmailAddressLink = ref<string>('')

const isLoading = ref<boolean>(false)

async function registerAndLogin() {
  isLoading.value = true
  const { error } = await supabaseClient.auth.signUp({
    email: emailAddress.value,
    password: password.value,
  })
  isLoading.value = false

  if (error) {
    throw new Error(error.message)
  }

  currentStep.value = 'requestLinks'
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

      <div>
        Current e-mail address link:
        <a target="_blank" :href="currentEmailAddressLink">
          {{ currentEmailAddressLink }}
        </a>
      </div>

      <div>
        New e-mail address link:
        <a target="_blank" :href="newEmailAddressLink">
          {{ newEmailAddressLink }}
        </a>
      </div>

      <div>Requested e-mail address: {{ newEmailAddress }}</div>

      <div>
        Current e-mail address:
        <span v-if="currentUser === null"> Loading... </span>
        <span v-else>
          {{ currentUser.email }}
        </span>
      </div>

      <div>
        <button @click="loadUser()" :disabled="isLoading">
          Load User to update current e-mail address
        </button>
      </div>
    </div>

    <div v-else-if="currentStep === 'requestLinks'">
      <h1>Request Change E-Mail Address Links</h1>

      <form @submit.prevent="requestChangeEmailAddressLinks">
        <div>
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
        <div>
          <button type="submit" :disabled="isLoading">
            Request Change E-Mail Address Links
          </button>
        </div>
      </form>
    </div>

    <div v-else-if="currentStep === 'registerLogin'">
      <h1>Register & Login</h1>
      <form @submit.prevent="registerAndLogin">
        <div>
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
        <div>
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
        <div>
          <button type="submit" :disabled="isLoading">Register & Login</button>
        </div>
      </form>
    </div>
  </div>
</template>
