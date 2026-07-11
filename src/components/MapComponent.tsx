import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { GisFeature, LayerConfig, BaseMap } from "../types";
import { Maximize2, Move, Search, X, MapPin } from "lucide-react";

interface MapComponentProps {
  features: GisFeature[];
  layers: LayerConfig[];
  activeBaseMap: string;
  baseMaps: BaseMap[];
  selectedFeature: GisFeature | null;
  onFeatureSelect: (feature: GisFeature | null) => void;
  hoveredFeature: GisFeature | null;
  setHoveredFeature: (feature: GisFeature | null) => void;
  isTableCollapsed: boolean;
  setIsTableCollapsed: (collapsed: boolean) => void;
  isSidebarCollapsed: boolean;
  measureMode: "none" | "distance" | "area";
  measurePoints: { lat: number; lng: number }[];
  setMeasurePoints: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }[]>>;
  zoomToLayerName: string | null;
  clearZoomToLayer: () => void;
  toggleLayer: (id: string) => void;
}

const isLatLngValid = (latlng: any): boolean => {
  if (!latlng) return false;
  const lat = latlng.lat !== undefined ? latlng.lat : (Array.isArray(latlng) ? latlng[0] : null);
  const lng = latlng.lng !== undefined ? latlng.lng : (Array.isArray(latlng) ? latlng[1] : null);
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

const isBoundsValid = (bounds: L.LatLngBounds | null | undefined): boolean => {
  if (!bounds || typeof bounds.isValid !== "function" || !bounds.isValid()) {
    return false;
  }
  try {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return isLatLngValid(sw) && isLatLngValid(ne);
  } catch (e) {
    return false;
  }
};

// Safe Leaflet Canvas overrides to prevent "Cannot read properties of undefined (reading 'clearRect')" during fast state/layer updates or unmounts
if (typeof window !== "undefined" && L && (L as any).Canvas) {
  const CanvasProto = (L as any).Canvas.prototype;
  
  if (CanvasProto._clear) {
    const originalClear = CanvasProto._clear;
    CanvasProto._clear = function (this: any) {
      if (!this._map || !this._ctx) {
        return;
      }
      try {
        originalClear.call(this);
      } catch (e) {
        console.warn("Guarded Leaflet Canvas _clear error:", e);
      }
    };
  }

  if (CanvasProto._redraw) {
    const originalRedraw = CanvasProto._redraw;
    CanvasProto._redraw = function (this: any) {
      if (!this._map || !this._ctx) {
        return;
      }
      try {
        originalRedraw.call(this);
      } catch (e) {
        console.warn("Guarded Leaflet Canvas _redraw error:", e);
      }
    };
  }

  if (CanvasProto._updatePath) {
    const originalUpdatePath = CanvasProto._updatePath;
    CanvasProto._updatePath = function (this: any, layer: any) {
      if (!this._map || !this._ctx) {
        return;
      }
      try {
        originalUpdatePath.call(this, layer);
      } catch (e) {
        console.warn("Guarded Leaflet Canvas _updatePath error:", e);
      }
    };
  }
}

export default function MapComponent({
  features,
  layers,
  activeBaseMap,
  baseMaps,
  selectedFeature,
  onFeatureSelect,
  hoveredFeature,
  setHoveredFeature,
  isTableCollapsed,
  setIsTableCollapsed,
  isSidebarCollapsed,
  measureMode,
  measurePoints,
  setMeasurePoints,
  zoomToLayerName,
  clearZoomToLayer,
  toggleLayer
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayersRef = useRef<Record<string, L.GeoJSON>>({});
  const selectionHighlightRef = useRef<L.Layer | null>(null);
  const measureGroupRef = useRef<L.FeatureGroup | null>(null);
  const latRef = useRef<HTMLSpanElement>(null);
  const lngRef = useRef<HTMLSpanElement>(null);
  const measureModeRef = useRef(measureMode);

  useEffect(() => {
    measureModeRef.current = measureMode;
  }, [measureMode]);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(9);

  // Search feature state
  const [mapSearchQuery, setMapSearchQuery] = useState<string>("");
  const [showMapSuggestions, setShowMapSuggestions] = useState<boolean>(false);

  // Compute suggestions from loaded GIS features
  const filteredSearchFeatures = useMemo(() => {
    if (!mapSearchQuery.trim()) return [];
    const query = mapSearchQuery.toLowerCase();
    const matches: GisFeature[] = [];
    const seenNames = new Set<string>();

    for (const feat of features) {
      const name = feat.properties.name || feat.properties.Name || feat.properties.village_name || feat.properties.Village_Name || "";
      if (name && typeof name === "string") {
        const lowerName = name.toLowerCase();
        if (lowerName.includes(query) && !seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          matches.push(feat);
          if (matches.length >= 8) break;
        }
      }
    }
    return matches;
  }, [features, mapSearchQuery]);

  // Pre-group features by layer case-insensitively for fast rendering lookups
  const featuresByLayer = useMemo(() => {
    const grouped: Record<string, GisFeature[]> = {};
    features.forEach((feat) => {
      const layerName = 
        feat.properties.layer || 
        feat.properties.Layer || 
        feat.properties.LAYER || 
        "General Feature";
      const key = layerName.toLowerCase();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(feat);
    });
    return grouped;
  }, [features]);

  // 1. Initialize Map Instance (Only Once)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Tehri, Uttarakhand, India (Tehri: 30.465, 78.486)
    const map = L.map(mapContainerRef.current, {
      center: [30.465, 78.486],
      zoom: 10,
      zoomControl: false, // Custom position
      preferCanvas: true, // Render vectors on canvas for ultimate performance
    });

    L.control.zoom({ position: "topright" }).addTo(map);
    L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

    mapInstanceRef.current = map;
    setZoomLevel(map.getZoom());

    // Event listener for mousemove (show geographic coordinates)
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      const latVal = Number(e.latlng.lat.toFixed(5));
      const lngVal = Number(e.latlng.lng.toFixed(5));

      if (latRef.current) latRef.current.textContent = latVal.toString();
      if (lngRef.current) lngRef.current.textContent = lngVal.toString();

      if (measureModeRef.current !== "none") {
        setMouseCoords({
          lat: latVal,
          lng: lngVal,
        });
      }
    });

    map.on("zoomend", () => {
      setZoomLevel(map.getZoom());
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Update Basemap Tile Layer dynamically when activeBaseMap changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const currentBase = baseMaps.find((b) => b.id === activeBaseMap);
    if (currentBase) {
      const tile = L.tileLayer(currentBase.url, {
        attribution: currentBase.attribution,
        maxZoom: 19,
      });
      tile.addTo(map);
      tileLayerRef.current = tile;
    }
  }, [activeBaseMap, baseMaps]);

  // 3. Populate and styling GIS layers from database
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Identify active visible layers in the state
    const visibleLayerIds = new Set(layers.filter(l => l.visible).map(l => l.id));

    // 2. Remove layers that are no longer visible
    Object.keys(geojsonLayersRef.current).forEach((layerId) => {
      if (!visibleLayerIds.has(layerId)) {
        map.removeLayer(geojsonLayersRef.current[layerId]);
        delete geojsonLayersRef.current[layerId];
      }
    });

    // 3. Add or update visible layers
    layers.forEach((layerConf) => {
      if (!layerConf.visible) return;

      const existingLayer = geojsonLayersRef.current[layerConf.id];

      if (existingLayer) {
        // Update styling of existing layer (if color, opacity, or weight changed)
        try {
          existingLayer.setStyle({
            color: layerConf.color,
            fillColor: layerConf.fillColor || layerConf.color,
            weight: layerConf.weight,
            opacity: layerConf.opacity,
            fillOpacity: layerConf.fillOpacity * layerConf.opacity,
          });
        } catch (styleErr) {
          console.warn(`Could not update style for existing layer ${layerConf.name}:`, styleErr);
        }
        return;
      }

      // If the layer doesn't exist on the map yet, create it
      const rawLayerFeatures = featuresByLayer[layerConf.name.toLowerCase()] || [];
      
      // Filter out invalid/empty geometries to prevent Leaflet Canvas crashes
      const layerFeatures = rawLayerFeatures.filter((feat) => {
        if (!feat || !feat.geometry) return false;
        const geom = feat.geometry;
        if (!geom.type) return false;
        if (!geom.coordinates) return false;
        if (!Array.isArray(geom.coordinates)) return false;
        if (geom.coordinates.length === 0) return false;
        return true;
      });

      if (layerFeatures.length === 0) return;

      // Group these into a single Leaflet GeoJSON layer
      const geoJsonData: any = {
        type: "FeatureCollection",
        features: layerFeatures,
      };

      try {
        const geoJsonLayer = L.geoJSON(geoJsonData, {
          interactive: measureMode === "none",
          style: (feature: any) => {
            return {
              color: layerConf.color,
              fillColor: layerConf.fillColor || layerConf.color,
              weight: layerConf.weight,
              opacity: layerConf.opacity,
              fillOpacity: layerConf.fillOpacity * layerConf.opacity,
            };
          },
          pointToLayer: (feature: any, latlng: L.LatLng) => {
            return L.circleMarker(latlng, {
              radius: layerConf.name.toLowerCase().includes("village") ? 4.5 : 6,
              color: "#ffffff",
              fillColor: layerConf.color,
              weight: 1.2,
              opacity: 1,
              fillOpacity: layerConf.opacity,
            });
          },
          onEachFeature: (feature: any, layer: L.Layer) => {
            // Binding standard tooltips / popups safely
            const props = feature.properties || {};
            const name = props.name || props.Name || props.village_name || props.Village_Name || "Unlabeled Feature";
            
            layer.bindTooltip(`
              <div class="px-2 py-1 font-sans text-xs">
                <strong class="text-indigo-900 block">${name}</strong>
                <span class="text-[10px] text-slate-500 font-mono">${layerConf.name}</span>
              </div>
            `, { sticky: true, opacity: 0.9 });

            // Mouse Hover styling
            layer.on({
              mouseover: () => {
                setHoveredFeature(feature);
                if (layer instanceof L.Path) {
                  try {
                    layer.setStyle({
                      weight: layerConf.weight + 1.5,
                      color: "#eab308", // Golden cursor border highlight
                    });
                  } catch (e) {}
                }
              },
              mouseout: () => {
                setHoveredFeature(null);
                if (geojsonLayersRef.current[layerConf.id]) {
                  try {
                    geojsonLayersRef.current[layerConf.id].resetStyle(layer);
                  } catch (e) {}
                }
              },
              click: (e: L.LeafletMouseEvent) => {
                onFeatureSelect(feature);
                setIsTableCollapsed(false);
                L.DomEvent.stopPropagation(e);
              },
            });
          },
        });

        geoJsonLayer.addTo(map);
        geojsonLayersRef.current[layerConf.id] = geoJsonLayer;
      } catch (err) {
        console.error(`Error loading or adding layer ${layerConf.name} (${layerConf.id}):`, err);
      }
    });

    // Make map bounds responsive to features loaded (ONLY ON INITIAL LOAD to avoid jarring auto-zooming on toggling checkboxes)
    if (features.length > 0 && isInitialLoadRef.current) {
      let timeoutId: any = null;
      const tryFitBounds = () => {
        try {
          // Calculate bounds from ALL loaded features to center the entire district reliably
          const tempLayer = L.geoJSON({
            type: "FeatureCollection",
            features: features,
          } as any);
          const bounds = tempLayer.getBounds();
          const size = map.getSize();
          if (isBoundsValid(bounds)) {
            if (size.x > 0 && size.y > 0) {
              const calculatedZoom = map.getBoundsZoom(bounds, false, [30, 30]);
              if (isFinite(calculatedZoom) && !isNaN(calculatedZoom)) {
                map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
                isInitialLoadRef.current = false; // Only run initial load once
                return true;
              }
            }
            // Fallback to center of bounds if map is not fully laid out yet
            const center = bounds.getCenter();
            if (isLatLngValid(center)) {
              map.setView(center, 10);
              isInitialLoadRef.current = false;
              return true;
            }
          }
        } catch (err) {
          console.warn("Could not calculate bounds safely inside tryFitBounds:", err);
        }
        return false;
      };

      // Try immediately
      const succeeded = tryFitBounds();
      if (!succeeded) {
        // If it failed (e.g., bounds not ready or size is 0), retry with a small delay
        timeoutId = setTimeout(() => {
          map.invalidateSize();
          tryFitBounds();
        }, 150);
      }
      
      if (timeoutId) {
        return () => clearTimeout(timeoutId);
      }
    }
  }, [features, layers, onFeatureSelect, setHoveredFeature, measureMode]);

  // 3.5 Zoom to specific layer when zoomToLayerName changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !zoomToLayerName) return;

    try {
      const matchedLayerConf = layers.find(l => l.name === zoomToLayerName);
      if (matchedLayerConf) {
        // If the layer is not visible, turn it on!
        if (!matchedLayerConf.visible) {
          toggleLayer(matchedLayerConf.id);
        }

        // Wait a small timeout to let the state update and layer render, or calculate from features directly (safer and instant)
        const layerFeatures = featuresByLayer[zoomToLayerName.toLowerCase()] || [];
        if (layerFeatures.length > 0) {
          const tempLayer = L.geoJSON({
            type: "FeatureCollection",
            features: layerFeatures
          } as any);
          const bounds = tempLayer.getBounds();
          const size = map.getSize();
          if (isBoundsValid(bounds) && size.x > 0 && size.y > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
          }
        }
      }
    } catch (err) {
      console.warn("Failed to zoom to layer safely:", err);
    } finally {
      clearZoomToLayer();
    }
  }, [zoomToLayerName, layers, featuresByLayer, clearZoomToLayer, toggleLayer]);

  // 4. Handle Programmatic Highlighting when selectedFeature changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectionHighlightRef.current) {
      map.removeLayer(selectionHighlightRef.current);
      selectionHighlightRef.current = null;
    }

    if (!selectedFeature) {
      setMapSearchQuery("");
      return;
    }

    // Update spatial search input to match active selected element
    const label = selectedFeature.properties.name || selectedFeature.properties.Name || selectedFeature.properties.village_name || selectedFeature.properties.Village_Name || "";
    setMapSearchQuery(label);

    try {
      // Find the geometry and create a high contrast flashing highlight above it
      const highlightLayer = L.geoJSON(selectedFeature as any, {
        style: {
          color: "#dc2626", // Deep Red
          fillColor: "#fecaca",
          weight: 4,
          opacity: 1,
          fillOpacity: 0.5,
        },
        pointToLayer: (feature: any, latlng: L.LatLng) => {
          return L.circle(latlng, {
            radius: 80, // larger indicator circle
            color: "#dc2626",
            fillColor: "#ef4444",
            weight: 3,
            fillOpacity: 0.4,
          });
        },
      });

      highlightLayer.addTo(map);
      selectionHighlightRef.current = highlightLayer;

      // Pan to selected item safely
      const bounds = highlightLayer.getBounds();
      const size = map.getSize();
      if (isBoundsValid(bounds) && size.x > 0 && size.y > 0) {
        const center = bounds.getCenter();
        if (isLatLngValid(center)) {
          if (selectedFeature.geometry.type === "Point") {
            const currentZoom = map.getZoom();
            const targetZoom = isFinite(currentZoom) && !isNaN(currentZoom) ? Math.max(currentZoom, 12) : 12;
            map.setView(center, targetZoom, { animate: true });
          } else {
            const calculatedZoom = map.getBoundsZoom(bounds, false, [100, 100]);
            if (isFinite(calculatedZoom) && !isNaN(calculatedZoom)) {
              map.fitBounds(bounds, { padding: [100, 100], maxZoom: 13, animate: true });
            } else {
              map.setView(center, 12, { animate: true });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to highlight feature safely:", err);
    }
  }, [selectedFeature]);

  // 4.1 Render active measurement polylines/polygons/points
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Create the measurement group if it doesn't exist
    if (!measureGroupRef.current) {
      measureGroupRef.current = L.featureGroup().addTo(map);
    } else {
      measureGroupRef.current.clearLayers();
    }

    const group = measureGroupRef.current;
    if (measureMode === "none") return;

    const latlngs = measurePoints.map((p) => L.latLng(p.lat, p.lng));

    // 1. Draw connecting line segments/polygons
    if (latlngs.length > 0) {
      if (measureMode === "distance") {
        // Draw polyline
        const polylinePoints = [...latlngs];
        if (mouseCoords) {
          polylinePoints.push(L.latLng(mouseCoords.lat, mouseCoords.lng));
        }
        
        if (polylinePoints.length >= 2) {
          L.polyline(polylinePoints, {
            color: "#e11d48", // rose-600
            dashArray: "6, 8",
            weight: 3.5,
            opacity: 0.9,
          }).addTo(group);
        }
      } else if (measureMode === "area") {
        // Draw polygon
        const polygonPoints = [...latlngs];
        if (mouseCoords) {
          polygonPoints.push(L.latLng(mouseCoords.lat, mouseCoords.lng));
        }
        
        if (polygonPoints.length >= 2) {
          L.polygon(polygonPoints, {
            color: "#059669", // emerald-600
            fillColor: "#10b981", // emerald-500
            fillOpacity: 0.25,
            dashArray: "6, 8",
            weight: 3.5,
            opacity: 0.9,
          }).addTo(group);
        }
      }

      // 2. Add markers at each vertex with custom numbered tooltips
      latlngs.forEach((latlng, idx) => {
        const marker = L.circleMarker(latlng, {
          radius: 7,
          color: "#ffffff",
          fillColor: measureMode === "distance" ? "#e11d48" : "#059669",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(group);

        // Bind informative tooltips/labels
        let tooltipText = "";
        if (measureMode === "distance") {
          if (idx === 0) {
            tooltipText = "<b>Start</b>";
          } else {
            // Find haversine distance up to this point
            let subDistance = 0;
            for (let i = 0; i < idx; i++) {
              subDistance += latlngs[i].distanceTo(latlngs[i + 1]);
            }
            const displayDist = subDistance < 1000 
              ? `${subDistance.toFixed(1)} m`
              : `${(subDistance / 1000).toFixed(2)} km`;
            
            tooltipText = `<b>Pt ${idx + 1}:</b> +${displayDist}`;
          }
        } else {
          tooltipText = `<b>Vertex ${idx + 1}</b>`;
        }

        marker.bindTooltip(tooltipText, {
          permanent: true,
          direction: "top",
          className: "bg-white text-slate-800 font-sans text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 shadow-sm select-none",
          offset: [0, -5],
        });
      });

      // 3. For Area, draw a dynamic center metric tooltip if we have at least 3 points
      if (measureMode === "area" && latlngs.length >= 3) {
        // Flat planar centroid calculation
        let totalLat = 0;
        let totalLng = 0;
        latlngs.forEach((ll) => {
          totalLat += ll.lat;
          totalLng += ll.lng;
        });
        const centroid = L.latLng(totalLat / latlngs.length, totalLng / latlngs.length);

        // Compute area using the formula
        let avgLat = 0;
        latlngs.forEach(ll => avgLat += ll.lat);
        const refLat = (avgLat / latlngs.length) * Math.PI / 180;
        
        const R = 6371000;
        const projected = latlngs.map(ll => {
          const x = ll.lng * Math.PI / 180 * R * Math.cos(refLat);
          const y = ll.lat * Math.PI / 180 * R;
          return { x, y };
        });
        
        // Shoelace
        let area = 0;
        const n = projected.length;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          area += projected[i].x * projected[j].y;
          area -= projected[j].x * projected[i].y;
        }
        const areaSqMeters = Math.abs(area) / 2;
        const displayArea = areaSqMeters < 100000
          ? `${areaSqMeters.toFixed(1)} m²`
          : `${(areaSqMeters / 1000000).toFixed(2)} km²`;

        // Render central area overlay
        L.marker(centroid, {
          icon: L.divIcon({
            className: "bg-transparent border-0 flex items-center justify-center pointer-events-none",
            html: `
              <div class="bg-emerald-950/90 text-emerald-100 font-sans text-[10px] font-bold py-1 px-2 rounded border border-emerald-500 shadow-md whitespace-nowrap min-w-0 select-none">
                📐 Area: ${displayArea}
              </div>
            `,
            iconSize: [120, 24],
          }),
        }).addTo(group);
      }
    }
  }, [measurePoints, measureMode, mouseCoords]);

  // 4.2 Listener for adding measurement points on map click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (measureMode === "none") return;
      
      const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
      setMeasurePoints((prev) => [...prev, newPoint]);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [measureMode, setMeasurePoints]);

  // 5. Invalidate map layout size dynamically on container state toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    // Invalidate immediately
    map.invalidateSize();
    
    // Invalidate size once transitions wrap up
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 320);

    return () => clearTimeout(timer);
  }, [isTableCollapsed, isSidebarCollapsed]);

  // Map Controls: Pan to district bounds safely
  const handleZoomToDistrict = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      if (features.length > 0) {
        // Calculate bounds from ALL loaded features to encompass the entire district
        const tempLayer = L.geoJSON({
          type: "FeatureCollection",
          features: features,
        } as any);
        const bounds = tempLayer.getBounds();
        const size = map.getSize();
        if (isBoundsValid(bounds) && size.x > 0 && size.y > 0) {
          const calculatedZoom = map.getBoundsZoom(bounds, false, [40, 40]);
          if (isFinite(calculatedZoom) && !isNaN(calculatedZoom)) {
            map.fitBounds(bounds, { padding: [40, 40], animate: true });
            return;
          }
        }
      }
    } catch (e) {
      console.warn("handleZoomToDistrict fitBounds error", e);
    }

    // Fallback static center of Tehri
    map.setView([30.465, 78.486], 10, { animate: true });
  };

  return (
    <div className="relative flex-1 bg-slate-100 flex flex-col h-full min-w-0">
      {/* Map Element */}
      <div id="gis-map" ref={mapContainerRef} className={`flex-1 w-full h-full z-0 pointer-events-auto ${measureMode !== "none" ? "cursor-crosshair" : ""}`} />

      {/* Floating Coordinate Status Bar */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-3 py-1.5 rounded-md flex items-center gap-4 text-xs font-mono text-slate-600">
        <div className="flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-slate-400" />
          <span>X (Lng): <strong ref={lngRef} className="text-slate-800">---</strong></span>
          <span className="text-slate-300">|</span>
          <span>Y (Lat): <strong ref={latRef} className="text-slate-800">---</strong></span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div className="text-[11px] font-semibold text-slate-500">
          Zoom: <span className="text-indigo-600">{zoomLevel}</span>
        </div>
      </div>

      {/* Map Action Overlay Button */}
      <div className="absolute top-4 right-14 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleZoomToDistrict}
          title="Zoom to Full District Extent"
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-lg shadow-sm font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-150"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Fit District Extent</span>
        </button>
      </div>

      {/* Floating Spatial Search Bar */}
      <div className="absolute top-4 left-4 z-[1001] w-80 font-sans">
        <div className="relative flex items-center bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-md transition-shadow duration-200 focus-within:shadow-lg focus-within:border-indigo-400">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            className="w-full text-xs pl-9 pr-8 py-2.5 bg-transparent rounded-lg text-slate-700 placeholder-slate-400 font-semibold focus:outline-none"
            placeholder="Search villages / boundaries..."
            value={mapSearchQuery}
            onChange={(e) => {
              setMapSearchQuery(e.target.value);
              setShowMapSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (mapSearchQuery.length > 0) {
                setShowMapSuggestions(true);
              }
            }}
          />
          {mapSearchQuery ? (
            <button
              onClick={() => {
                setMapSearchQuery("");
                setShowMapSuggestions(false);
              }}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-3 text-[9px] font-bold text-slate-300 pointer-events-none tracking-widest font-mono select-none">GIS</span>
          )}
        </div>

        {/* Suggestion Dropdown Panel */}
        {showMapSuggestions && filteredSearchFeatures.length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto z-[1002] divide-y divide-slate-100">
            {filteredSearchFeatures.map((feat) => {
              const name = feat.properties.name || feat.properties.Name || feat.properties.village_name || feat.properties.Village_Name || "Unlabeled";
              const layerName = feat.properties.layer || feat.properties.Layer || feat.properties.LAYER || "Boundary";
              
              return (
                <button
                  key={feat.id}
                  onClick={() => {
                    setMapSearchQuery(name);
                    setShowMapSuggestions(false);
                    onFeatureSelect(feat);
                    setIsTableCollapsed(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/70 active:bg-indigo-100 text-xs text-slate-700 font-medium transition-colors flex items-center justify-between gap-1 border-none bg-transparent cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate text-slate-800 font-semibold">{name}</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider bg-slate-100 text-slate-400 font-bold px-1.5 py-0.5 rounded font-mono shrink-0">
                    {layerName.replace("USN-", "").replace("Almora-", "").replace("-Boundary", "")}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
