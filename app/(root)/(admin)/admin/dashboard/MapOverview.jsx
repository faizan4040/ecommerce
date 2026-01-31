"use client"

import { useLayoutEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

let am4core, am4maps, am4themes_animated, am4geodata_indiaLow

const MapOverview = () => {
  const chartRef = useRef(null)

  useLayoutEffect(() => {
    let chart

    const loadChart = async () => {
      am4core = await import("@amcharts/amcharts4/core")
      am4maps = await import("@amcharts/amcharts4/maps")
      am4themes_animated = (
        await import("@amcharts/amcharts4/themes/animated")
      ).default
      am4geodata_indiaLow = (
        await import("@amcharts/amcharts4-geodata/indiaLow")
      ).default

      am4core.useTheme(am4themes_animated)

      chart = am4core.create(chartRef.current, am4maps.MapChart)
      chart.geodata = am4geodata_indiaLow
      chart.projection = new am4maps.projections.Miller()

      chart.homeZoomLevel = 1.2
      chart.homeGeoPoint = { latitude: 22.9734, longitude: 78.6569 }
      chart.maxZoomLevel = 5
      chart.minZoomLevel = 1
      chart.zoomControl = new am4maps.ZoomControl()

      const polygonSeries = chart.series.push(
        new am4maps.MapPolygonSeries()
      )
      polygonSeries.useGeodata = true

      const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.tooltipText = "{name}"
      polygonTemplate.fill = am4core.color("#e5e7eb")
      polygonTemplate.stroke = am4core.color("#ffffff")

      polygonSeries.data = [
        { id: "IN-DL", fill: am4core.color("#ff5722") },
        { id: "IN-AS", fill: am4core.color("#ff5722") },
        { id: "IN-RJ", fill: am4core.color("#ff5722") },
      ]

      polygonTemplate.propertyFields.fill = "fill"
    }

    loadChart()

    return () => {
      if (chart) chart.dispose()
    }
  }, [])

  return (
    <Card className="rounded-2xl shadow-sm flex flex-col">
      
      {/* HEADER */}
      <CardHeader className="">
        <CardTitle className="text-lg font-semibold">
          Sessions by Country
        </CardTitle>
      </CardHeader>

      {/* MAP CENTER */}
      <CardContent className="flex-1 p-0">
        <div ref={chartRef} className="w-full h-full" />
      </CardContent>

      {/* FOOTER */}
      <div className="px-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">This Week</p>
          <p className="text-xl font-bold">23.5k</p>
        </div>

        <div className="text-right">
          <p className="text-muted-foreground">Last Week</p>
          <p className="text-xl font-bold">41.05k</p>
        </div>
      </div>
    </Card>
  )
}

export default MapOverview
