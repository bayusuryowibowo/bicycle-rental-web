<script>
import H from '@here/maps-api-for-javascript'
import { mapActions, mapState } from 'pinia'
import { useBicycleStore } from '../stores/bicycleStore'
import { useRentalStore } from '../stores/rentalStore'

export default {
  data() {
    return {
      map: null,
      platform: null,
      ui: null,
      travelledDistance: 0,
      duration: 0,
      allMarkers: [],
      selectedMarker: null,
      origin: null,
      destination: null,
      isStart: false
    }
  },
  computed: {
    ...mapState(useBicycleStore, ['bicycle']),
    getDurationInMMSS() {
      if (this.duration) {
        const minutes = Math.floor(this.duration / 60)
        const seconds = this.duration % 60
        return `${minutes} minutes ${seconds} seconds`
      }
      return ''
    }
  },
  watch: {
    isStart(newValue) {
      if (newValue === true) this.startRental(this.travelledDistance, this.bicycle.id)
    }
  },
  methods: {
    ...mapActions(useRentalStore, ['startRental']),
    addMarkersToMap() {
      const markerData = [
        {
          position: { lat: -6.175163012431789, lng: 106.82714821653543 },
          label: 'Monas'
        },
        {
          position: { lat: -6.128784852303684, lng: 106.83327159926687 },
          label: 'Ancol'
        },
        {
          position: { lat: -6.244423444006796, lng: 106.80072952644662 },
          label: 'Blok M'
        },
        {
          position: { lat: -6.134530154822225, lng: 106.81334465687262 },
          label: 'Kota Tua'
        },
        {
          position: { lat: -6.138641231582186, lng: 106.83164583236173 },
          label: 'Mangga Dua'
        }
      ]

      markerData.forEach((data) => {
        const marker = new H.map.Marker(data.position)
        marker.setData(data.label)
        this.allMarkers.push(marker)

        marker.addEventListener('tap', (event) => {
          const clickedMarker = event.target

          // If the clicked marker is the same as the previously selected marker, do nothing
          if (clickedMarker === this.selectedMarker) {
            return
          }

          this.removeOtherMarkers()

          // Save the selected marker
          this.selectedMarker = clickedMarker

          // Set the origin using the clicked marker's position
          this.origin = clickedMarker.getGeometry().lat + ',' + clickedMarker.getGeometry().lng

          // Hide other markers
          this.allMarkers.forEach((marker) => {
            if (marker !== clickedMarker) {
              marker.setVisibility(false)
            }
          })

          this.setUpClickListener()
        })

        // Add marker to the map
        this.map.addObject(marker)
      })
    },
    removeOtherMarkers() {
      // Show all markers that were hidden
      this.allMarkers.forEach((marker) => {
        marker.setVisibility(true)
      })
    },
    setUpClickListener() {
      // someCondition = true;
      if (this.isStart === true) {
        map.removeEventListener('tap', clickListener)
      }
      const self = this

      function clickListener(evt) {
        let coord = self.map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY)

        let latitude = coord.lat.toFixed(6)
        let longitude = coord.lng.toFixed(6)

        // console.log('Latitude: ' + latitude)
        // console.log('Longitude: ' + longitude)

        let coordinate = latitude + ',' + longitude

        if (self.destination) {
          self.map.removeObject(self.destination.marker)
        }

        let existingMarker = self.allMarkers.find((marker) => marker.getData() === coordinate)

        if (!existingMarker) {
          const marker = new H.map.Marker({ lat: latitude, lng: longitude })
          marker.setData(coordinate)
          self.allMarkers.push(marker)
          self.map.addObject(marker)

          self.destination = {
            coordinate: coordinate,
            marker: marker
          }
        } else {
          self.destination = {
            coordinate: coordinate,
            marker: existingMarker
          }
        }
      }

      this.map.addEventListener('tap', clickListener)
    },
    initializeMap() {
      // Step 1: initialize communication with the platform
      this.platform = new H.service.Platform({
        apikey: import.meta.env.VITE_HERE_MAPS_API_KEY
      })
      const defaultLayers = this.platform.createDefaultLayers()

      // Step 2: initialize a map - this map is centered over Jakarta
      this.map = new H.Map(
        document.getElementById('mapContainer'),
        defaultLayers.vector.normal.map,
        {
          center: { lat: -6.1754, lng: 106.8272 }, // Jakarta, Indonesia
          zoom: 12,
          pixelRatio: window.devicePixelRatio || 1
        }
      )

      // add a resize listener to make sure that the map occupies the whole container
      window.addEventListener('resize', () => this.map.getViewPort().resize())

      // Step 3: make the map interactive
      // MapEvents enables the event system
      // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
      const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map))

      // Create the default UI components
      this.ui = H.ui.UI.createDefault(this.map, defaultLayers)
    },
    calculateRouteFromAtoB() {
      this.isStart = true

      // Step 4: calculate the route from the given locations
      var router = this.platform.getRoutingService(null, 8)
      var routeRequestParams = {
        routingMode: 'fast',
        transportMode: 'bicycle',
        origin: this.origin,
        destination: this.destination.coordinate,
        return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
      }

      router.calculateRoute(routeRequestParams, this.onSuccess, this.onError)
    },
    /**
     * Creates a H.map.Polyline from the shape of the route and adds it to the map.
     * @param {Object} route A route as received from the H.service.RoutingService
     */
    addRouteShapeToMap(route) {
      route.sections.forEach((section) => {
        // decode LineString from the flexible polyline
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline)

        // Create an outline for the route polyline
        var routeOutline = new H.map.Polyline(linestring, {
          style: {
            lineWidth: 10,
            strokeColor: 'rgba(0, 128, 255, 0.7)',
            lineTailCap: 'arrow-tail',
            lineHeadCap: 'arrow-head'
          }
        })

        // Create a patterned polyline
        var routeArrows = new H.map.Polyline(linestring, {
          style: {
            lineWidth: 10,
            fillColor: 'white',
            strokeColor: 'rgba(255, 255, 255, 1)',
            lineDash: [0, 2],
            lineTailCap: 'arrow-tail',
            lineHeadCap: 'arrow-head'
          }
        })

        // Create a group that represents the route line and contains outline and the pattern
        var routeLine = new H.map.Group()
        routeLine.addObjects([routeOutline, routeArrows])

        // Add the routeLine group to the map
        this.map.addObject(routeLine)

        // And zoom to its bounding rectangle
        this.map.getViewModel().setLookAtData({
          bounds: routeLine.getBoundingBox()
        })
      })
    },
    /**
     * Creates a series of H.map.Marker points from the route and adds them to the map.
     * @param {Object} route  A route as received from the H.service.RoutingService
     */
    addManueversToMap(route) {
      var svgMarkup =
          '<svg width="18" height="18" ' +
          'xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="8" cy="8" r="8" ' +
          'fill="#1b468d" stroke="white" stroke-width="1"  />' +
          '</svg>',
        dotIcon = new H.map.Icon(svgMarkup, { anchor: { x: 8, y: 8 } }),
        group = new H.map.Group(),
        i,
        j
      route.sections.forEach((section) => {
        let poly = H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray()

        let actions = section.actions
        // Add a marker for each maneuver
        for (i = 0; i < actions.length; i += 1) {
          let action = actions[i]
          var marker = new H.map.Marker(
            {
              lat: poly[action.offset * 3],
              lng: poly[action.offset * 3 + 1]
            },
            { icon: dotIcon }
          )
          marker.instruction = action.instruction
          group.addObject(marker)
        }

        // Add the maneuvers group to the map
        this.map.addObject(group)
      })
    },
    /**
     * Creates a series of H.map.Marker points from the route and adds them to the map.
     * @param {Object} route  A route as received from the H.service.RoutingService
     */
    addSummaryToPanel(route) {
      Number.prototype.toMMSS = function () {
        return Math.floor(this / 60) + ' minutes ' + (this % 60) + ' seconds.'
      }
      let duration = 0,
        distance = 0

      route.sections.forEach((section) => {
        distance += section.travelSummary.length
        duration += section.travelSummary.duration
      })

      this.travelledDistance = distance
      this.duration = duration

      // var summaryDiv = document.createElement('div'),
      //   content = ''
      // content += '<b>Total distance</b>: ' + distance + 'm. <br/>'
      // content += '<b>Travel Time</b>: ' + duration.toMMSS()

      // summaryDiv.style.fontSize = 'small'
      // summaryDiv.style.marginLeft = '5%'
      // summaryDiv.style.marginRight = '5%'
      // summaryDiv.innerHTML = content
      // // Find the element with ID "panel" and append the summaryDiv to it
      // var panelElement = document.getElementById('panel')
      // panelElement.appendChild(summaryDiv)
    },
    /**
     * Creates a series of H.map.Marker points from the route and adds them to the map.
     * @param {Object} route  A route as received from the H.service.RoutingService
     */
    addManueversToPanel(route) {
      var nodeOL = document.createElement('ol')

      nodeOL.style.fontSize = 'small'
      nodeOL.style.marginLeft = '5%'
      nodeOL.style.marginRight = '5%'
      nodeOL.className = 'directions'

      route.sections.forEach((section) => {
        section.actions.forEach((action, idx) => {
          var li = document.createElement('li'),
            spanArrow = document.createElement('span'),
            spanInstruction = document.createElement('span')

          spanArrow.className = 'arrow ' + (action.direction || '') + action.action
          spanInstruction.innerHTML = section.actions[idx].instruction
          li.appendChild(spanArrow)
          li.appendChild(spanInstruction)

          nodeOL.appendChild(li)
        })
      })

      // Find the element with ID "panel" and append the nodeOL to it
      var panelElement = document.getElementById('panel')
      panelElement.appendChild(nodeOL)
    },
    onSuccess(result) {
      var route = result.routes[0]
      // console.log(result, '<<< result')
      /*
       * The styling of the route response on the map is entirely under the developer's control.
       * A representitive styling can be found the full JS + HTML code of this example
       * in the functions below:
       */
      this.addRouteShapeToMap(route)
      // this.addManueversToMap(route)
      // this.addManueversToPanel(route)
      this.addSummaryToPanel(route)
    },

    onError(error) {
      console.log(error, '<<< error')
    },
    showUBikeStations() {
      this.addMarkersToMap()
    },
    start() {
      // Now use the map as required...
      this.calculateRouteFromAtoB()
    }
  },
  mounted() {
    this.initializeMap()
    // window.addEventListener('load', this.initializeMap)
  },
  beforeUnmount() {
    // window.removeEventListener('load', this.initializeMap)
  }
}
</script>

<template>
  <div>
    <div id="mapContainer" class="map-container"></div>
    <div>
      <div class="text-lg font-bold mb-2">Summary</div>
      <div id="panel" class="text-base">
        <b>Total distance</b>: {{ travelledDistance }} m <br />
        <b>Travel Time</b>: {{ getDurationInMMSS() }}
      </div>
    </div>
  </div>
  <div>
    <button
      @click="showUBikeStations"
      class="text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-BrightMint focus:outline-none focus:ring-4 focus:ring-white hover:bg-teal-500 cursor-pointer"
    >
      Show UBike Station
    </button>
    <button
      @click="start"
      class="text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-BrightMint focus:outline-none focus:ring-4 focus:ring-white hover:bg-teal-500 cursor-pointer"
    >
      Start
    </button>
  </div>
</template>

<style>
.map-container {
  width: 100%;
  height: 650px;
}
</style>
