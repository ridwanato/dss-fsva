'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PRIORITY_LABELS } from '@/lib/fsva/constants';

interface MapViewProps {
  geoJsonData: any;
  activeLayer: string;
  onPolygonClick: (properties: any) => void;
}

export default function MapView({ geoJsonData, activeLayer, onPolygonClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !map.current.getLayer('fsva-fill')) return;
    
    // Update fill color based on selected layer
    map.current.setPaintProperty('fsva-fill', 'fill-color', [
      'match',
      ['get', activeLayer],
      1, PRIORITY_LABELS[1].fill,
      2, PRIORITY_LABELS[2].fill,
      3, PRIORITY_LABELS[3].fill,
      4, PRIORITY_LABELS[4].fill,
      5, PRIORITY_LABELS[5].fill,
      6, PRIORITY_LABELS[6].fill,
      '#cccccc' // fallback
    ]);
  }, [activeLayer, mapLoaded]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    const styleUrl = mapTilerKey 
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [106.01, -6.02], // Default Cilegon
      zoom: 11
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-left');
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-left');

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('fsva', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Fill layer
      map.current.addLayer({
        id: 'fsva-fill',
        type: 'fill',
        source: 'fsva',
        paint: {
          'fill-color': [
            'match',
            ['get', activeLayer],
            1, PRIORITY_LABELS[1].fill,
            2, PRIORITY_LABELS[2].fill,
            3, PRIORITY_LABELS[3].fill,
            4, PRIORITY_LABELS[4].fill,
            5, PRIORITY_LABELS[5].fill,
            6, PRIORITY_LABELS[6].fill,
            '#cccccc' // fallback
          ],
          'fill-opacity': 0.7
        }
      });

      // Line layer for borders
      map.current.addLayer({
        id: 'fsva-borders',
        type: 'line',
        source: 'fsva',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1
        }
      });

      // Highlight layer
      map.current.addLayer({
        id: 'fsva-highlight',
        type: 'line',
        source: 'fsva',
        paint: {
          'line-color': '#000000',
          'line-width': 3,
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0
          ]
        }
      });

      let hoveredStateId: string | number | null = null;

      map.current.on('mousemove', 'fsva-fill', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        
        map.current.getCanvas().style.cursor = 'pointer';
        
        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'fsva', id: hoveredStateId },
            { hover: false }
          );
        }
        
        hoveredStateId = e.features[0].id || e.features[0].properties.kode_bps;
        if (hoveredStateId !== null) {
            map.current.setFeatureState(
            { source: 'fsva', id: hoveredStateId },
            { hover: true }
            );
        }
      });

      map.current.on('mouseleave', 'fsva-fill', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'fsva', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = null;
      });

      map.current.on('click', 'fsva-fill', (e) => {
        if (e.features && e.features.length > 0) {
          onPolygonClick(e.features[0].properties);
        }
      });
      
      setMapLoaded(true);
    });
  }, [onPolygonClick]);

  // Update data when geoJsonData changes OR map finishes loading
  useEffect(() => {
    if (mapLoaded && map.current && geoJsonData) {
      const source = map.current.getSource('fsva') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(geoJsonData);
      }
    }
  }, [geoJsonData, mapLoaded]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
