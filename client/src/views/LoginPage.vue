<script>
import { mapActions } from 'pinia';
import { useUserStore } from '../stores/userStore';



export default {
  data() {
    return {
      user: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    ...mapActions(useUserStore, ['postLogin']),
    login() {
      this.postLogin(this.user)
    }
  }
}
</script>

<template>
  <section class="h-screen">
    <div class="max-w-7xl mx-auto py-24 px-4">
      <h1 class="font-sans text-4xl font-bold pt-8 lg:pt-0 text-center text-black">
        Login
      </h1>
      <div
        class="mx-auto lg:mx-0 w-full pt-3 border-b-2 border-black opacity-25"
      ></div>
      <form
        @submit.prevent="login"
        class="mt-10 p-8 w-1/2 mx-auto rounded-lg border-4 shadow-xl"
      >
        <div class="mb-6">
          <label for="username" class="block mb-2 text-base font-medium text-black"
            >Your username</label
          >
          <input
            v-model="user.username"
            type="username"
            class="shadow-sm bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 shadow-sm-light"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="password"
            class="block mb-2 text-base font-medium text-black"
            >Your password</label
          >
          <input
            v-model="user.password"
            type="password"
            class="shadow-sm bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 shadow-sm-light"
            placeholder="must be at least 6 characters"
            required
          />
        </div>
        <div class="flex justify-between">
          <button
            type="submit"
            class="text-white bg-BrightMint font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </section>
</template>