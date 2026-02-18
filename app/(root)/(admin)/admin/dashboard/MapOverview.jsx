"use client"

import { useLayoutEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useFetch from "@/hooks/useFetch"

let am4core, am4maps, am4themes_animated, am4geodata_indiaLow

const MapOverview = () => {
  const chartRef = useRef(null)
  const { data } = useFetch(
    "/api/dashboard/admin/orders-by-state"
  )

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
      chart.homeGeoPoint = { latitude: 22.97, longitude: 78.65 }

      const polygonSeries = chart.series.push(
        new am4maps.MapPolygonSeries()
      )
      polygonSeries.useGeodata = true

      const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.tooltipText = "{name}: {value}"
      polygonTemplate.stroke = am4core.color("#fff")

      polygonSeries.data = data?.data?.map((item) => ({
        id: item._id,
        value: item.count,
        fill: am4core.color("#ff5722"),
      })) || []

      polygonTemplate.propertyFields.fill = "fill"
    }

    loadChart()

    return () => {
      if (chart) chart.dispose()
    }
  }, [data])

  return (
    <Card className="rounded-2xl shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Orders by State
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div ref={chartRef} className="w-full h-80" />
      </CardContent>
    </Card>
  )
}

export default MapOverview
