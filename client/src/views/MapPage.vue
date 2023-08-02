<script>
import { mapActions, mapState } from 'pinia';
import Map from '../components/Map.vue'
import { useBicycleStore } from '../stores/bicycleStore';

export default {
  computed: {
    // ...mapState(useBicycleStore, ['bicycle'])
  },
  components: {
    Map
  },
  methods: {
    ...mapActions(useBicycleStore, ['fetchBicycle'])
  },
  created() {
    this.fetchBicycle(this.$route.params.id)
  }
}
</script>

<template>
  <section class="min-h-screen">
    <div class="max-w-7xl mx-auto py-24 px-4">
      <Map />
    </div>
  </section>
</template>