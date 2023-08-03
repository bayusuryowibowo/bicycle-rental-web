<script>
import { mapWritableState } from 'pinia'
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from './stores/userStore'

export default {
  components: {
    RouterLink,
    RouterView
  },
  computed: {
    ...mapWritableState(useUserStore, ['isLogin', 'id', 'email', 'username'])
  },
  methods: {
    logout() {
      localStorage.removeItem('access_token')
      localStorage.removeItem('id')
      localStorage.removeItem('email')
      localStorage.removeItem('username')
      this.isLogin = false
      this.$router.push('/login')
      this.$toast.default('You have logged out', {
        position: 'bottom'
      })
    }
  },
  created() {
    this.isLogin = localStorage.access_token ? true : false
    this.id = localStorage.access_token ? localStorage.id : null
    this.email = localStorage.access_token ? localStorage.email : ''
    this.username = localStorage.access_token ? localStorage.username : ''
  }
}
</script>

<template>
  <header
    class="flex justify-center fixed w-full z-20 top-0 left-0 bg-MidnightBlue shadow-md border-b border-gray-400"
  >
    <div class="flex justify-center w-3/4">
      <nav>
        <ul class="h-full grid grid-cols-12 gap-5 text-center items-center text-black dark:text-white">
          <li>
            <a href="#" class="flex items-center">
              <img src="./assets/logo-no-background.svg" class="" alt="Ubike Logo" />
            </a>
          </li>
          <li>
            <RouterLink active-class="font-bold dark:text-white" to="/">Home</RouterLink>
          </li>
          <li v-if="!isLogin">
            <RouterLink active-class="font-bold dark:text-white" to="/login">Login</RouterLink>
          </li>
          <li v-if="isLogin" class="col-end-13">
            <a @click.prevent="logout" class="cursor-pointer">Logout</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 20px;
  height: 60px;
}

nav a {
  display: inline-block;
  align-self: center;
  border-left: 1px solid var(--color-border);
}
</style>
