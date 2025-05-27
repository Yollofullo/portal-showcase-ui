"use client";
import React, { useEffect, useRef, useState } from "react";
import ProtectedLayout from '../../../components/ProtectedLayout';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../../../lib/supabaseClient';

// Fetch warehouse zones from Supabase
async function getWarehouseZones() {
  const { data, error } = await supabase
    .from('inventory_zones')
    .select('zone_id,sku_count,demand_level,restock_date,geometry');
  if (error) throw error;
  return data || [];
}

const MINIMAL_STYLE = {
  version: 8,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "raster-tiles",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export default function WarehouseMapPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [popup, setPopup] = useState<{ x: number; y: number; zone: any } | null>(null);
  const [sidebarZone, setSidebarZone] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Persist/restore map view
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    function saveView() {
      localStorage.setItem('warehouseMapView', JSON.stringify({
        center: map.getCenter(),
        zoom: map.getZoom()
      }));
    }
    map.on('moveend', saveView);
    return () => { map.off('moveend', saveView); };
  }, [mapReady]);

  // Fetch zones from Supabase
  useEffect(() => {
    setLoading(true);
    getWarehouseZones()
      .then(zs => { setZones(zs); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Load map and add zones
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;
    let center: [number, number] = [0, 0];
    let zoom = 15;
    try {
      const saved = localStorage.getItem('warehouseMapView');
      if (saved) {
        const { center: c, zoom: z } = JSON.parse(saved);
        center = [c.lng, c.lat];
        zoom = z;
      }
    } catch {}
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MINIMAL_STYLE,
      center,
      zoom,
      attributionControl: false,
    });
    mapRef.current = map;
    map.on('load', () => {
      setMapReady(true);
      map.addSource('zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'zone-fill',
        type: 'fill',
        source: 'zones',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'zone_id'], highlightedZone], '#f59e42',
            ['==', ['get', 'zone_id'], hoveredZone], '#2563eb',
            ['match', ['get', 'demand_level'],
              'hot', '#ef4444',
              'warm', '#facc15',
              'cold', '#22c55e',
              '#a3a3a3'
            ]
          ],
          'fill-opacity': 0.5
        }
      });
      map.addLayer({
        id: 'zone-outline',
        type: 'line',
        source: 'zones',
        paint: {
          'line-color': '#1e40af',
          'line-width': 2
        }
      });
    });
    map.resize();
    window.addEventListener('resize', () => map.resize());
    return () => {
      map.remove();
      window.removeEventListener('resize', () => map.resize());
    };
  }, [highlightedZone, hoveredZone]);

  // Update source data when zones change
  useEffect(() => {
    if (!mapRef.current) return;
    const features = zones.map(z => ({
      type: 'Feature',
      properties: {
        zone_id: z.zone_id,
        sku_count: z.sku_count,
        demand_level: z.demand_level,
        restock_date: z.restock_date
      },
      geometry: z.geometry
    }));
    const geojson = { type: 'FeatureCollection', features };
    const map = mapRef.current;
    if (map.getSource('zones')) {
      (map.getSource('zones') as maplibregl.GeoJSONSource).setData(geojson);
    }
  }, [zones]);

  // Tooltip, hover, and click logic
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    function onMove(e) {
      const features = map.queryRenderedFeatures(e.point, { layers: ['zone-fill'] });
      if (features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
        setHoveredZone(features[0].properties.zone_id);
        setPopup({ x: e.point.x, y: e.point.y, zone: features[0].properties });
      } else {
        map.getCanvas().style.cursor = '';
        setHoveredZone(null);
        setPopup(null);
      }
    }
    function onClick(e) {
      const features = map.queryRenderedFeatures(e.point, { layers: ['zone-fill'] });
      if (features.length > 0) {
        setSidebarZone(features[0].properties);
      } else {
        setSidebarZone(null);
      }
    }
    map.on('mousemove', onMove);
    map.on('click', onClick);
    map.on('mouseleave', 'zone-fill', () => { setHoveredZone(null); setPopup(null); });
    return () => {
      map.off('mousemove', onMove);
      map.off('click', onClick);
      map.off('mouseleave', () => { setHoveredZone(null); setPopup(null); });
    };
  }, [zones]);

  // Search and highlight logic
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    const zone = zones.find(z => z.zone_id.toLowerCase() === search.toLowerCase());
    if (zone && mapRef.current) {
      // Zoom to zone
      const geom = zone.geometry;
      let coords = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0];
      const bounds = coords.reduce((b, coord) => b.extend(coord), new maplibregl.LngLatBounds(coords[0], coords[0]));
      mapRef.current.fitBounds(bounds, { padding: 60 });
      setHighlightedZone(zone.zone_id);
      setSidebarZone(zone);
      setTimeout(() => setHighlightedZone(null), 2000);
    }
  };

  // QR Scanner logic (basic, using getUserMedia)
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (scannerOpen && videoRef.current && !scanning) {
      setScanning(true);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        });
    }
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
      if (stream) stream.getTracks().forEach(track => track.stop());
      setScanning(false);
    };
  }, [scannerOpen]);

  // Dummy QR scan handler (replace with real QR lib for production)
  const handleFakeScan = () => {
    if (!videoRef.current) return;
    // Simulate scan by picking a random zone
    if (zones.length > 0) {
      const zone = zones[Math.floor(Math.random() * zones.length)];
      setScannerOpen(false);
      setSearch(zone.zone_id);
      setTimeout(() => handleSearch({ preventDefault: () => {} } as any), 100);
    }
  };

  // Reset view
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [0, 0], zoom: 15 });
      setSidebarZone(null);
      setHighlightedZone(null);
      setSearch('');
    }
  };

  return (
    <ProtectedLayout roles={['operator']}>
      <main className="flex flex-col min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-center my-4">Warehouse Zones Map</h1>
        {error && <div className="text-red-600 text-center mb-2">{error}</div>}
        <form onSubmit={handleSearch} className="flex items-center justify-center gap-2 mb-4">
          <input
            type="text"
            className="border rounded px-3 py-2 w-64"
            placeholder="Search by Zone ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">Search</button>
          <button type="button" className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition" onClick={() => setScannerOpen(true)}>
            Scan QR
          </button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition" onClick={handleResetView}>
            Reset View
          </button>
        </form>
        <div className="relative w-full flex-1 min-h-[70vh]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg font-semibold text-blue-700">Loading zones...</span>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-[70vh] rounded shadow border" />
          {popup && !sidebarZone && (
            <div
              className="absolute bg-white border rounded px-3 py-2 text-xs shadow z-10 pointer-events-none"
              style={{ left: popup.x + 10, top: popup.y + 10 }}
            >
              <div><b>Zone:</b> {popup.zone.zone_id}</div>
            </div>
          )}
          {scannerOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                <h2 className="text-lg font-bold mb-2">Scan Zone QR</h2>
                <video ref={videoRef} className="w-64 h-48 bg-black mb-4 rounded" />
                <button onClick={handleFakeScan} className="mb-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Fake Scan (Demo)</button>
                <button onClick={() => setScannerOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600">Close Scanner</button>
              </div>
            </div>
          )}
          {sidebarZone && (
            <div className="fixed top-20 right-8 w-80 bg-white border rounded-lg shadow-lg p-6 z-30 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Zone {sidebarZone.zone_id}</h2>
                <button onClick={() => setSidebarZone(null)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
              </div>
              <div className="mb-2"><b>SKU count:</b> {sidebarZone.sku_count}</div>
              <div className="mb-2"><b>Demand:</b> <span className={
                sidebarZone.demand_level === 'hot' ? 'text-red-600 font-bold' :
                sidebarZone.demand_level === 'warm' ? 'text-yellow-600 font-bold' :
                'text-green-600 font-bold'
              }>{sidebarZone.demand_level}</span></div>
              <div className="mb-2"><b>Last restocked:</b> {sidebarZone.restock_date ? new Date(sidebarZone.restock_date).toLocaleDateString() : 'N/A'}</div>
            </div>
          )}
        </div>
      </main>
    </ProtectedLayout>
  );
}
