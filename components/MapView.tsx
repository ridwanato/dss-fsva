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
  showDistrictLabels?: boolean;
  onPolygonClick: (properties: any) => void;
  onMapReady?: (map: maplibregl.Map) => void;
}

// Helper function to calculate exact geometric centroid per kecamatan
function computeKecamatanCentroids(data: any) {
  if (!data || !data.features || data.features.length === 0) {
    return { type: 'FeatureCollection' as const, features: [] };
  }

  const groups: Record<string, { sumLng: number; sumLat: number; count: number }> = {};

  data.features.forEach((feature: any) => {
    const name = feature.properties?.nama_kecamatan;
    if (!name || typeof name !== 'string') return;
    const cleanName = name.trim();
    if (!cleanName) return;

    if (!groups[cleanName]) {
      groups[cleanName] = { sumLng: 0, sumLat: 0, count: 0 };
    }

    const geom = feature.geometry;
    if (!geom || !geom.coordinates) return;

    const extractCoords = (coords: any) => {
      if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        groups[cleanName].sumLng += coords[0];
        groups[cleanName].sumLat += coords[1];
        groups[cleanName].count += 1;
      } else if (Array.isArray(coords)) {
        coords.forEach(extractCoords);
      }
    };

    extractCoords(geom.coordinates);
  });

  const features = Object.entries(groups)
    .filter(([_, d]) => d.count > 0)
    .map(([namaKec, d]) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [d.sumLng / d.count, d.sumLat / d.count]
      },
      properties: {
        nama_kecamatan: namaKec
      }
    }));

  return {
    type: 'FeatureCollection' as const,
    features
  };
}

// Helper function to calculate exact geometric centroid per village
function computeVillageCentroids(data: any) {
  if (!data || !data.features || data.features.length === 0) {
    return { type: 'FeatureCollection' as const, features: [] };
  }

  const groups: Record<string, { nama_desa: string; sumLng: number; sumLat: number; count: number }> = {};

  data.features.forEach((feature: any) => {
    const name = feature.properties?.nama_desa;
    if (!name || typeof name !== 'string') return;
    const cleanName = name.trim();
    if (!cleanName) return;

    const key = feature.properties?.kode_bps || 
      `${feature.properties?.nama_kecamatan || ''}_${cleanName}`;

    if (!groups[key]) {
      groups[key] = { nama_desa: cleanName, sumLng: 0, sumLat: 0, count: 0 };
    }

    const geom = feature.geometry;
    if (!geom || !geom.coordinates) return;

    const extractCoords = (coords: any) => {
      if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        groups[key].sumLng += coords[0];
        groups[key].sumLat += coords[1];
        groups[key].count += 1;
      } else if (Array.isArray(coords)) {
        coords.forEach(extractCoords);
      }
    };

    extractCoords(geom.coordinates);
  });

  const features = Object.entries(groups)
    .filter(([_, d]) => d.count > 0)
    .map(([key, d]) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [d.sumLng / d.count, d.sumLat / d.count]
      },
      properties: {
        kode_bps: key,
        nama_desa: d.nama_desa
      }
    }));

  return {
    type: 'FeatureCollection' as const,
    features
  };
}

export default function MapView({ geoJsonData, activeLayer, opacity, showLabels, showDistrictLabels = true, onPolygonClick, onMapReady }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // Queue geoJson data that arrived before map was ready
  const pendingGeoData = useRef<any>(null);
  const onPolygonClickRef = useRef(onPolygonClick);
  const onMapReadyRef = useRef(onMapReady);

  // Keep refs up-to-date without triggering re-init
  useEffect(() => { onPolygonClickRef.current = onPolygonClick; }, [onPolygonClick]);
  useEffect(() => { onMapReadyRef.current = onMapReady; }, [onMapReady]);

  // Update paint/layout properties when options change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    try {
      if (!map.current.isStyleLoaded() || !map.current.getLayer('fsva-fill')) return;

      const isStunting = activeLayer === 'p_stunting';
      const fillColors = isStunting ? [
        'match',
        ['get', activeLayer],
        1, STUNTING_PRIORITY_LABELS[1].fill,
        2, STUNTING_PRIORITY_LABELS[2].fill,
        3, STUNTING_PRIORITY_LABELS[3].fill,
        4, STUNTING_PRIORITY_LABELS[4].fill,
        '#cccccc'
      ] : [
        'match',
        ['get', activeLayer],
        1, PRIORITY_LABELS[1].fill,
        2, PRIORITY_LABELS[2].fill,
        3, PRIORITY_LABELS[3].fill,
        4, PRIORITY_LABELS[4].fill,
        5, PRIORITY_LABELS[5].fill,
        6, PRIORITY_LABELS[6].fill,
        '#cccccc'
      ];

      map.current.setPaintProperty('fsva-fill', 'fill-color', fillColors as any);
      map.current.setPaintProperty('fsva-fill', 'fill-opacity', 1 - (opacity / 100));

      if (map.current.getLayer('fsva-labels')) {
        map.current.setLayoutProperty('fsva-labels', 'visibility', showLabels ? 'visible' : 'none');
      }

      if (map.current.getLayer('fsva-kecamatan-labels')) {
        map.current.setLayoutProperty('fsva-kecamatan-labels', 'visibility', showDistrictLabels ? 'visible' : 'none');
      }
    } catch (e) {
      // Map may be in transition; silently ignore
    }
  }, [activeLayer, opacity, showLabels, showDistrictLabels, mapLoaded]);

  // Map initialization — re-runs only when mapContainer is available
  useEffect(() => {
    if (!mapContainer.current) return;
    // Prevent double-init if already mounted
    if (map.current) return;

    const styleUrl = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [106.01, -6.02],
      zoom: 11,
      attributionControl: false,
      // @ts-ignore
      preserveDrawingBuffer: true
    });
    map.current = instance;

    instance.addControl(new maplibregl.AttributionControl({
      customAttribution: '© RidwanS'
    }), 'bottom-right');

    instance.addControl(new maplibregl.ScaleControl({
      maxWidth: 150,
      unit: 'metric'
    }), 'bottom-left');

    instance.on('load', () => {
      if (!map.current) return;

      // Notify parent that map is ready (after style loaded)
      if (onMapReadyRef.current) {
        onMapReadyRef.current(instance);
      }

      map.current.addSource('fsva', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addSource('fsva-kecamatan-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addSource('fsva-village-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      const isStunting = activeLayer === 'p_stunting';
      const fillColors = isStunting ? [
        'match', ['get', activeLayer],
        1, STUNTING_PRIORITY_LABELS[1].fill,
        2, STUNTING_PRIORITY_LABELS[2].fill,
        3, STUNTING_PRIORITY_LABELS[3].fill,
        4, STUNTING_PRIORITY_LABELS[4].fill,
        '#cccccc'
      ] : [
        'match', ['get', activeLayer],
        1, PRIORITY_LABELS[1].fill,
        2, PRIORITY_LABELS[2].fill,
        3, PRIORITY_LABELS[3].fill,
        4, PRIORITY_LABELS[4].fill,
        5, PRIORITY_LABELS[5].fill,
        6, PRIORITY_LABELS[6].fill,
        '#cccccc'
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

      map.current.addLayer({
        id: 'fsva-borders',
        type: 'line',
        source: 'fsva',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1
        }
      });

      map.current.addLayer({
        id: 'fsva-labels',
        type: 'symbol',
        source: 'fsva-village-points',
        layout: {
          'text-field': ['get', 'nama_desa'],
          'text-size': 8.5,
          'text-anchor': 'center',
          'visibility': showLabels ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#111827',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
          'text-halo-blur': 0.5
        }
      });

      map.current.addLayer({
        id: 'fsva-kecamatan-labels',
        type: 'symbol',
        source: 'fsva-kecamatan-points',
        layout: {
          'text-field': ['get', 'nama_kecamatan'],
          'text-size': 9.5,
          'text-transform': 'uppercase',
          'text-anchor': 'center',
          'visibility': showDistrictLabels ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#042f2e',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.5,
          'text-halo-blur': 0.5
        }
      });

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
          map.current.setFeatureState({ source: 'fsva', id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = e.features[0].id ?? e.features[0].properties?.kode_bps ?? null;
        if (hoveredStateId !== null) {
          map.current.setFeatureState({ source: 'fsva', id: hoveredStateId }, { hover: true });
        }
      });

      map.current.on('mouseleave', 'fsva-fill', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
          map.current.setFeatureState({ source: 'fsva', id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = null;
      });

      map.current.on('click', 'fsva-fill', (e) => {
        if (e.features && e.features.length > 0) {
          onPolygonClickRef.current(e.features[0].properties);
        }
      });

      setMapLoaded(true);

      // Apply any GeoJSON data that arrived before map was ready
      if (pendingGeoData.current) {
        applyGeoData(pendingGeoData.current);
        pendingGeoData.current = null;
      }
    });

    // Cleanup: remove map instance on unmount so it reinitializes on SPA re-mount
    return () => {
      try {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      } catch (e) {
        // ignore cleanup errors
      }
      setMapLoaded(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: apply geoJson data + fit bounds with smooth animation
  const applyGeoData = (data: any) => {
    if (!map.current) return;
    try {
      const source = map.current.getSource('fsva') as maplibregl.GeoJSONSource;
      if (!source) return;

      source.setData(data);

      const kecSource = map.current.getSource('fsva-kecamatan-points') as maplibregl.GeoJSONSource;
      if (kecSource) {
        const kecPoints = computeKecamatanCentroids(data);
        kecSource.setData(kecPoints);
      }

      const villageSource = map.current.getSource('fsva-village-points') as maplibregl.GeoJSONSource;
      if (villageSource) {
        const villagePoints = computeVillageCentroids(data);
        villageSource.setData(villagePoints);
      }

      if (data.features && data.features.length > 0) {
        let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;

        data.features.forEach((feature: any) => {
          if (!feature.geometry?.coordinates) return;
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
          map.current.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            { padding: 40, duration: 850, essential: true }
          );
        }
      }
    } catch (e) {
      // ignore transient errors
    }
  };

  // Update data when geoJsonData changes — queue if map not yet loaded
  useEffect(() => {
    if (!geoJsonData) return;
    if (mapLoaded && map.current) {
      applyGeoData(geoJsonData);
    } else {
      // Store for later application once map loads
      pendingGeoData.current = geoJsonData;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJsonData, mapLoaded]);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full min-h-[500px]" />;
}
