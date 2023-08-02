import { defineStore } from 'pinia'
import axios from 'axios'

const baseUrl = 'http://localhost:3000'

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
        console.log(error)
      }
    },
    async fetchBicycleData() {
      try {
        const { data } = await axios.get(baseUrl + "/bicycles", {})
        this.bicycleData = data
      } catch (error) {
        console.log(error)
      }
    },
    async fetchBicycle(id) {
      try {
        const { data } = await axios.get(baseUrl + `/bicycles/${id}`, {})
        this.bicycle = data
      } catch (error) {
        console.log(error)
      }
    }
  }
})