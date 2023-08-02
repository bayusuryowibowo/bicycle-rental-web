import { defineStore } from 'pinia'
import axios from 'axios'

const baseUrl = 'http://localhost:3000'

export const useRentalStore = defineStore('rental', {
  state: () => {
    return {
      
    }
  },
  actions: {
    async startRental(travelledDistance, BicycleId) {
      try {
        const { data } = await axios.post(baseUrl + '/rentals', {
          travelledDistance, BicycleId
        }, {
          headers: {
            access_token: localStorage.access_token
          }
        })
        // <<<< menampilkan message ke client
      } catch (error) {
        console.log(error)
      }
    }
  }
})
