<script>
import { RouterLink, RouterView } from 'vue-router'

export default {
  components: {
    RouterLink,
    RouterView
  }
}

</script>

<template>
  <header class="flex justify-center fixed w-full z-20 top-0 left-0 bg-white dark:bg-black shadow-md border-b border-gray-400">

<div class="flex justify-center w-3/4">

  <nav>
    <ul class=" h-full grid grid-cols-12 gap-5 text-center items-center text-black">
      <li>
        <a href="#" class="flex items-center">
          <img src="./assets/logo-no-background.svg" class="" alt="Ubike Logo" />
        </a>
      </li>
      <li>
        <RouterLink active-class="font-bold dark:text-white" to="/">Home</RouterLink>
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
