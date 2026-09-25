import { useEffect } from 'react'
import { Circle, CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'

const PRIMARY = '#4a9eed'
const VIOLET = '#8b5cf6'

function ClickToSet({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    if (!map.getBounds().contains([lat, lng])) map.setView([lat, lng])
  }, [lat, lng, map])
  return null
}

/** OpenStreetMap picker: click to move the center; the circle is the check-in geofence. */
export function MapPicker({
  lat,
  lng,
  radius,
  onPick,
}: {
  lat: number
  lng: number
  radius: number
  onPick: (lat: number, lng: number) => void
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom
      className="h-[360px] w-full rounded-lg border"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[lat, lng]}
        radius={radius}
        pathOptions={{ color: VIOLET, weight: 2, fillColor: PRIMARY, fillOpacity: 0.12 }}
      />
      <CircleMarker
        center={[lat, lng]}
        radius={8}
        pathOptions={{ color: '#fff', weight: 3, fillColor: PRIMARY, fillOpacity: 1 }}
      />
      <ClickToSet onPick={onPick} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  )
}
