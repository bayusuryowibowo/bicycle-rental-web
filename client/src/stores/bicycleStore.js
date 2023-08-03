import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toast-notification'

const $toast = useToast()

const baseUrl = 'https://ubike.bayusuryowibowo.xyz'

export const useBicycleStore = defineStore('bicycle', {
  state: () => {
    return {
      categoryData: [],
      bicycleData: [],
      bicycle: []
    }
  },
  actions: {
    async fetchCategoryData() {
      try {
        const { data } = await axios.get(baseUrl + "/categories", {})
        this.categoryData = data
      } catch (error) {
        $toast.error(`${error.response.data.message}`, {
          position: 'top-right'
        })
      }
    },
    async fetchBicycleData() {
      try {
        const { data } = await axios.get(baseUrl + "/bicycles", {})
        this.bicycleData = data
      } catch (error) {
        $toast.error(`${error.response.data.message}`, {
          position: 'top-right'
        })
      }
    },
    async fetchBicycle(id) {
      try {
        const { data } = await axios.get(baseUrl + `/bicycles/${id}`, {})
        this.bicycle = data
      } catch (error) {
        $toast.error(`${error.response.data.message}`, {
          position: 'top-right'
        })
      }
    }
  }
})