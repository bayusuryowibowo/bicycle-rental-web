import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toast-notification'

const $toast = useToast()

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
        const { data } = await axios.post(
          baseUrl + '/rentals',
          {
            travelledDistance,
            BicycleId
          },
          {
            headers: {
              access_token: localStorage.access_token
            }
          }
        )
        // <<<< menampilkan message ke client
        $toast.success(`${data.message}`, {
          position: 'top-right'
        })
        this.rental = data.rental
      } catch (error) {
        $toast.error(`${error.response.data.message}`, {
          position: 'top-right'
        })
      }
    },
    async finishRental(totalPrice) {
      try {
        const id = this.rental.id
        const { data } = await axios.patch(baseUrl + `/rentals/${id}`, {
          travelledDistance,
          totalPrice
        }, {
          headers: {
            access_token: localStorage.access_token
          }
        })
        this.router.push('/')
        // <<<< tampilkan message ke client
        $toast.success(`${data.message}`, {
          position: 'top-right'
        })
      } catch (error) {
        $toast.error(`${error.response.data.message}`, {
          position: 'top-right'
        })
      }
    },
    async snapTransaction(travelledDistance, price) {
      try {
        const totalPrice = Math.ceil(price * travelledDistance)
        const { data } = await axios.post(baseUrl + '/generate-midtrans-token', {
          email: localStorage.email,
          username: localStorage.username,
          totalPrice
        }, {
          headers: {
            access_token: localStorage.access_token
          }
        })
        const callback = this.finishRental
        window.snap.pay(data.token, {
          onSuccess: function (result) {
            /* You may add your own implementation here */
            // alert("payment success!"); console.log(result);
            callback(totalPrice)
          },
          onPending: function (result) {
            /* You may add your own implementation here */
            // alert("wating your payment!"); console.log(result);
          },
          onError: function (result) {
            /* You may add your own implementation here */
            // alert("payment failed!"); console.log(result);
          },
          onClose: function () {
            /* You may add your own implementation here */
            // alert('you closed the popup without finishing the payment');
          }
        })
      } catch (error) {
        // $toast.error(`${error.response.data.message}`, {
        //   position: 'top-right'
        // })
        console.log(error)
      }
    }
  }
})
