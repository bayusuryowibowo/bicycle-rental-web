import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toast-notification'

const $toast = useToast()
const baseUrl = 'http://localhost:3000'

export const useUserStore = defineStore('users', {
  state: () => {
    return {
      id: null,
      email: '',
      username: '',
      isLogin: false
    }
  },
  actions: {
    async postRegister(user) {
      try {
        const { data } = await axios.post(baseUrl + '/register', {
          email: user.email,
          password: user.password
        })
        this.router.push('/login')
        $toast.success(`${data.message}`, {
          position: 'top-right'
        })
      } catch (error) {
        $toast.error(`${error.response.data.message}`, {
          position: 'top-right'
        })
      }
    },
    async postLogin(user) {
      try {
        const { data } = await axios.post(baseUrl + '/login', {
          username: user.username,
          password: user.password
        })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('id', data.id)
        localStorage.setItem('email', data.email)
        localStorage.setItem('username', data.username)
        this.id = data.id
        this.email = data.email
        this.username = data.username
        this.isLogin = true
        this.router.push('/')
        $toast.success(`${data.message}`, {
          position: 'top-right'
        })
      } catch (error) {
        $toast.error(`${error.response.data.message}`, {
          position: 'top-right'
        })
      }
    },
  }
})