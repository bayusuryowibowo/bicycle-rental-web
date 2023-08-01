<script>
import H from '@here/maps-api-for-javascript'

export default {
  data() {
    return {
      map: null,
      platform: null,
      // bubble: null,
      ui: null,
      travelledDistance: 0,
    }
  },
  methods: {
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
          zoom: 13,
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

      // Now use the map as required...
      this.calculateRouteFromAtoB()
    },
    calculateRouteFromAtoB() {
      // Step 4: calculate the route from the given locations
      var router = this.platform.getRoutingService(null, 8)
      var routeRequestParams = {
        routingMode: 'fast',
        transportMode: 'bicycle',
        origin: '-6.1754,106.8272', // Jakarta
        destination: '-6.1744,106.8205', // Monumen Nasional (Monas) di Jakarta
        return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
      }

      router.calculateRoute(routeRequestParams, this.onSuccess, this.onError)
    },
    /**
     * Opens/Closes a infobubble
     * @param  {H.geo.Point} position     The location on the map.
     * @param  {String} text              The contents of the infobubble.
     */
    openBubble(position, text) {
      if (!this.bubble) {
        this.bubble = new H.ui.InfoBubble(position, { content: text })
        this.ui.addBubble(this.bubble)
      } else {
        this.bubble.setPosition(position)
        this.bubble.setContent(text)
        this.bubble.open()
      }
    },
    /**
     * Creates a H.map.Polyline from the shape of the route and adds it to the map.
     * @param {Object} route A route as received from the H.service.RoutingService
     */
    addRouteShapeToMap(route) {
      route.sections.forEach((section) => {
        // decode LineString from the flexible polyline
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline)

        // Create a polyline to display the route:
        let polyline = new H.map.Polyline(linestring, {
          style: {
            lineWidth: 4,
            strokeColor: 'rgba(0, 128, 255, 0.7)'
          }
        })

        // Add the polyline to the map
        this.map.addObject(polyline)
        // And zoom to its bounding rectangle
        this.map.getViewModel().setLookAtData({
          bounds: polyline.getBoundingBox()
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

        // group.addEventListener(
        //   'tap',
        //   (evt) => {
        //     this.map.setCenter(evt.target.getGeometry())
        //     this.openBubble(evt.target.getGeometry(), evt.target.instruction)
        //   },
        //   false
        // )

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

      var summaryDiv = document.createElement('div'),
        content = ''
      content += '<b>Total distance</b>: ' + distance + 'm. <br/>'
      content += '<b>Travel Time</b>: ' + duration.toMMSS()

      summaryDiv.style.fontSize = 'small'
      summaryDiv.style.marginLeft = '5%'
      summaryDiv.style.marginRight = '5%'
      summaryDiv.innerHTML = content
      // Find the element with ID "panel" and append the summaryDiv to it
      var panelElement = document.getElementById('panel')
      panelElement.appendChild(summaryDiv)
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
      this.addManueversToMap(route)
      this.addManueversToPanel(route)
      this.addSummaryToPanel(route)
    },

    onError(error) {
      console.log(error, '<<< error')
    }
  },
  mounted() {
    window.addEventListener('load', this.initializeMap)
  },
  beforeUnmount() {
    window.removeEventListener('load', this.initializeMap)
  }
}
</script>

<template>
  <div>
    <div id="mapContainer" class="map-container"></div>
    <div id="panel"></div>
  </div>
</template>

<style>
.map-container {
  width: 100%;
  height: 650px;
}
</style>
