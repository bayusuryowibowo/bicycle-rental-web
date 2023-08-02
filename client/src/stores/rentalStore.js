import { defineStore } from 'pinia'
import axios from 'axios'

const baseUrl = 'http://localhost:3000'

export const useRentalStore = defineStore('rental', {
  state: () => {
    return {
      rental: {}
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
        this.rental = data.rental
      } catch (error) {
        console.log(error)
      }
    },
    async finishRental(totalPrice) {
      try {
        const id = this.rental.id
        const { data } = await axios.patch(baseUrl + `/rentals/${id}`, {
          travelledDistance, totalPrice
        })
        // <<<< tampilkan message ke client
      } catch (error) {
        console.log(error)
      }
    },
    async snapTransaction(travelledDistance, price) {
      const totalPrice = Math.ceil(price * travelledDistance);
      const { token } = await axios.post(baseUrl + '/generate-midtrans-token', {
        email: localStorage.email,
        username: localStorage.username,
        totalPrice
      })
      const callback = this.finishRental
      window.snap.pay(token, {
        onSuccess: function(result){
          /* You may add your own implementation here */
          // alert("payment success!"); console.log(result);
          callback(totalPrice)
        },
        onPending: function(result){
          /* You may add your own implementation here */
          // alert("wating your payment!"); console.log(result);
        },
        onError: function(result){
          /* You may add your own implementation here */
          // alert("payment failed!"); console.log(result);
        },
        onClose: function(){
          /* You may add your own implementation here */
          // alert('you closed the popup without finishing the payment');
        }
      })
    }
  }
})
