'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PRIORITY_LABELS, STUNTING_PRIORITY_LABELS } from '@/lib/fsva/constants';

interface MapViewProps {
  geoJsonData: any;
  activeLayer: string;
  opacity: number;
  showLabels: boolean;
  onPolygonClick: (properties: any) => void;
  onMapReady?: (map: maplibregl.Map) => void;
}

export default function MapView({ geoJsonData, activeLayer, opacity, showLabels, onPolygonClick, onMapReady }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !map.current.getLayer('fsva-fill')) return;
    
    // Update fill color based on selected layer
    const isStunting = activeLayer === 'p_stunting';
    const fillColors = isStunting ? [
      'match',
      ['get', activeLayer],
      1, STUNTING_PRIORITY_LABELS[1].fill,
      2, STUNTING_PRIORITY_LABELS[2].fill,
      3, STUNTING_PRIORITY_LABELS[3].fill,
      4, STUNTING_PRIORITY_LABELS[4].fill,
      '#cccccc' // fallback
    ] : [
      'match',
      ['get', activeLayer],
      1, PRIORITY_LABELS[1].fill,
      2, PRIORITY_LABELS[2].fill,
      3, PRIORITY_LABELS[3].fill,
      4, PRIORITY_LABELS[4].fill,
      5, PRIORITY_LABELS[5].fill,
      6, PRIORITY_LABELS[6].fill,
      '#cccccc' // fallback
    ];

    map.current.setPaintProperty('fsva-fill', 'fill-color', fillColors as any);
    
    // Update opacity (0% transparency = 1.0 opacity)
    map.current.setPaintProperty('fsva-fill', 'fill-opacity', 1 - (opacity / 100));
    
    // Update labels visibility
    if (map.current.getLayer('fsva-labels')) {
      map.current.setLayoutProperty('fsva-labels', 'visibility', showLabels ? 'visible' : 'none');
    }
  }, [activeLayer, opacity, showLabels, mapLoaded]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    const styleUrl = mapTilerKey 
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`
      : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [106.01, -6.02], // Default Cilegon
      zoom: 11,
      attributionControl: false,
      // @ts-ignore
      preserveDrawingBuffer: true // Required for exporting to image
    });

    if (onMapReady) {
      onMapReady(map.current);
    }


    map.current.addControl(new maplibregl.AttributionControl({
      customAttribution: '© RidwanS'
    }), 'bottom-right');

    map.current.addControl(new maplibregl.ScaleControl({
      maxWidth: 150,
      unit: 'metric'
    }), 'bottom-left');

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('fsva', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Fill layer
      const isStunting = activeLayer === 'p_stunting';
      const fillColors = isStunting ? [
        'match',
        ['get', activeLayer],
        1, STUNTING_PRIORITY_LABELS[1].fill,
        2, STUNTING_PRIORITY_LABELS[2].fill,
        3, STUNTING_PRIORITY_LABELS[3].fill,
        4, STUNTING_PRIORITY_LABELS[4].fill,
        '#cccccc' // fallback
      ] : [
        'match',
        ['get', activeLayer],
        1, PRIORITY_LABELS[1].fill,
        2, PRIORITY_LABELS[2].fill,
        3, PRIORITY_LABELS[3].fill,
        4, PRIORITY_LABELS[4].fill,
        5, PRIORITY_LABELS[5].fill,
        6, PRIORITY_LABELS[6].fill,
        '#cccccc' // fallback
      ];

      map.current.addLayer({
        id: 'fsva-fill',
        type: 'fill',
        source: 'fsva',
        paint: {
          'fill-color': fillColors as any,
          'fill-opacity': 1
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

      // Labels layer
      map.current.addLayer({
        id: 'fsva-labels',
        type: 'symbol',
        source: 'fsva',
        layout: {
          'text-field': ['get', 'nama_desa'],
          'text-size': 8.5,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#111827',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
          'text-halo-blur': 0.5
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
        
        // Auto-fit bounds (Otomatis zoom ke tengah kabupaten apapun)
        if (geoJsonData.features && geoJsonData.features.length > 0) {
          let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
          
          geoJsonData.features.forEach((feature: any) => {
            if (!feature.geometry || !feature.geometry.coordinates) return;
            // Handle MultiPolygon and Polygon
            const coords = feature.geometry.type === 'MultiPolygon' 
              ? feature.geometry.coordinates.flat(2) 
              : feature.geometry.coordinates.flat(1);
              
            coords.forEach((coord: [number, number]) => {
              if (coord[0] < minLng) minLng = coord[0];
              if (coord[0] > maxLng) maxLng = coord[0];
              if (coord[1] < minLat) minLat = coord[1];
              if (coord[1] > maxLat) maxLat = coord[1];
            });
          });

          if (minLng < maxLng && minLat < maxLat) {
            map.current.fitBounds([
              [minLng, minLat],
              [maxLng, maxLat]
            ], { padding: 40, duration: 1000 });
          }
        }
      }
    }
  }, [geoJsonData, mapLoaded]);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full min-h-[500px]" />;
}
