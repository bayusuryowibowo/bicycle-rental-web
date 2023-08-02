<script>
import { mapActions, mapState } from 'pinia'
import { useBicycleStore } from '../stores/bicycleStore'

export default {
  computed: {
    ...mapState(useBicycleStore, ['categoryData', 'bicycleData'])
  },
  methods: {
    ...mapActions(useBicycleStore, ['fetchCategoryData', 'fetchBicycleData', 'fetchBicycle']),
    selectBicycle(id) {
      // console.log(id)
      this.$router.push(`/map/${id}`)
    }
  },
  mounted() {
    this.fetchCategoryData()
    this.fetchBicycleData()
  }
}
</script>

<template>
  <section class="min-h-screen">
    <div class="max-w-7xl mx-auto py-24 px-4">
      <div class="grid grid-cols-3 gap-5">
        <div
          v-for="category in categoryData"
          :key="category.id"
          :class="{
            'col-span-3 w-full': category.name === 'Tandem',
            'col-span-1': category.name !== 'Tandem'
          }"
        >
          <h5 class="text-xl text-black font-semibold text-center">
            {{ category.name }}
          </h5>
          <p>
            {{ category.description }}
          </p>
          <div class="flex flex-row justify-center items-center align-middle gap-5">
            <div
              v-for="bicycle in bicycleData"
              :key="bicycle.id"
            >
              <img
                v-if="bicycle.Category.name === category.name"
                :src="bicycle.imageURL"
                :class="{
                  'w-full': category.name === 'Tandem',
                  'w-full h-64': category.name !== 'Tandem'
                }"
                alt="bicycle image"
              />
              <h6
                v-if="bicycle.Category.name === category.name"
                class="text-xl text-black font-semibold text-center"
              >
                {{ bicycle.name }}
              </h6>
              <button
                v-if="bicycle.Category.name === category.name"
                @click="selectBicycle(bicycle.id)"
                type="submit"
                class="text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-BrightMint focus:outline-none focus:ring-4 focus:ring-white hover:bg-teal-500 cursor-pointer"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
