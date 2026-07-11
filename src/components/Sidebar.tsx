import React, { useState, useMemo } from "react";
import { Layers, Globe, Sliders, CheckSquare, Square, Check, RotateCcw, Database, ChevronDown, ChevronRight, Minimize2, Maximize2, Ruler, Trash2, Undo, GraduationCap, BookOpen, Heart, Shield, Waves, Compass, Vote, Droplet, HeartHandshake, Home, Briefcase, Building, Award, Landmark, Wine, Mail, Sprout, Zap, Factory, Wrench } from "lucide-react";
import { LayerConfig, BaseMap } from "../types";

interface SidebarProps {
  layers: LayerConfig[];
  toggleLayer: (id: string) => void;
  updateLayerOpacity: (id: string, opacity: number) => void;
  updateLayerColor: (id: string, color: string) => void;
  activeBaseMap: string;
  setBaseMap: (id: string) => void;
  baseMaps: BaseMap[];
  onReset: () => void;
  totalFeatures: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onZoomToLayer: (name: string) => void;
  toggleAllLayers: (visible: boolean) => void;
  
  // Measurement state passing
  measureMode: "none" | "distance" | "area";
  setMeasureMode: (mode: "none" | "distance" | "area") => void;
  measurePoints: { lat: number; lng: number }[];
  setMeasurePoints: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }[]>>;
}

const ORIGINAL_LAYERS = new Set([
  "district-boundary",
  "block-boundary",
  "tehsil-boundary",
  "roads",
  "river-perennial(1965)",
  "river-perennial  (1965)",
  "river-non-perennial(1965)",
  "river-non-perennial  (1965)",
  "villages",
  "education-all-schools",
  "education-gov-girls-high-school",
  "education-gov-girls-inter-collages",
  "education-gov-high-schools",
  "education-gov-inter-collages",
  "education-higher-education",
  "education-junior-high-schools",
  "education-primary-schools",
  "health-additional-primary-health-centres",
  "health-allopathic-centres",
  "health-anm-centres",
  "health-base-hospitals",
  "health-civil-hospitals",
  "health-community-health-centres",
  "health-district-hospitals",
  "health-homopathic-centres",
  "health-primary-health-centres",
  "health-women-hospitals",
  "police-barriers",
  "police-chauki",
  "police-headquaters",
  "police-line",
  "police-outpost",
  "police-stations",
  "police-thana-headquaters",
  "village-under-police-jurisdiction"
]);



export default function Sidebar({
  layers,
  toggleLayer,
  updateLayerOpacity,
  updateLayerColor,
  activeBaseMap,
  setBaseMap,
  baseMaps,
  onReset,
  totalFeatures,
  isCollapsed,
  setIsCollapsed,
  onZoomToLayer,
  toggleAllLayers,
  measureMode,
  setMeasureMode,
  measurePoints,
  setMeasurePoints
}: SidebarProps) {
  const [isLayersCollapsed, setIsLayersCollapsed] = useState<boolean>(false);
  const [isBaseMapCollapsed, setIsBaseMapCollapsed] = useState<boolean>(true);
  const [isMeasureCollapsed, setIsMeasureCollapsed] = useState<boolean>(true);
  const [isAdminCollapsed, setIsAdminCollapsed] = useState<boolean>(false);
  const [isEducationCollapsed, setIsEducationCollapsed] = useState<boolean>(true);
  const [isHealthCollapsed, setIsHealthCollapsed] = useState<boolean>(true);
  const [isPoliceCollapsed, setIsPoliceCollapsed] = useState<boolean>(true);
  const [isRiverCollapsed, setIsRiverCollapsed] = useState<boolean>(true);
  const [isVillagesCollapsed, setIsVillagesCollapsed] = useState<boolean>(true);
  const [isUrbanDevelopmentCollapsed, setIsUrbanDevelopmentCollapsed] = useState<boolean>(true);
  const [isBankCollapsed, setIsBankCollapsed] = useState<boolean>(true);
  const [isExciseCollapsed, setIsExciseCollapsed] = useState<boolean>(true);
  const [isJalSansthanCollapsed, setIsJalSansthanCollapsed] = useState<boolean>(true);
  const [isPostalCollapsed, setIsPostalCollapsed] = useState<boolean>(true);
  const [isHorticultureCollapsed, setIsHorticultureCollapsed] = useState<boolean>(true);
  const [isUPCCollapsed, setIsUPCCollapsed] = useState<boolean>(true);
  const [isIndustryCollapsed, setIsIndustryCollapsed] = useState<boolean>(true);
  const [isHandpumpCollapsed, setIsHandpumpCollapsed] = useState<boolean>(true);
  const [isOtherLayersCollapsed, setIsOtherLayersCollapsed] = useState<boolean>(true);

  const anyLayerActive = useMemo(() => {
    return layers.some((l) => l.visible);
  }, [layers]);

  const bankLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("bank") ||
        lower === "boi" ||
        lower === "pnb" ||
        lower === "sbi" ||
        lower === "ubi" ||
        lower === "ucb" ||
        lower === "ugb" ||
        lower === "cbi" ||
        lower === "dcb" ||
        lower === "hdfc" ||
        lower === "idbi" ||
        lower === "obc"
      );
    });
  }, [layers]);

  const exciseLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower === "bar" ||
        lower.includes("wine") ||
        lower.includes("excise") ||
        lower === "godwon"
      );
    });
  }, [layers]);

  const jalSansthanLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        (lower.includes("jal") || 
         lower.includes("sansthan") || 
         lower.includes("unit office") || 
         lower.includes("unit_office") || 
         lower.includes("division_devprayag")) &&
        !lower.includes("handpump") &&
        !lower.includes("hand_pump") &&
        !lower.includes("hand-pump")
      );
    });
  }, [layers]);

  const handpumpLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("handpump") ||
        lower.includes("hand_pump") ||
        lower.includes("hand-pump") ||
        lower === "tehri"
      );
    });
  }, [layers]);

  const postalLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("post") ||
        lower.includes("mail") ||
        lower.includes("postal") ||
        lower.includes("saving")
      );
    });
  }, [layers]);

  const horticultureLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("horticulture") ||
        lower.includes("canning") ||
        lower.includes("garden") ||
        lower.includes("mobile_team") ||
        lower.includes("mobile-team") ||
        lower === "office"
      );
    });
  }, [layers]);

  const upcLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("tranformer") ||
        lower.includes("transformer") ||
        lower === "offices"
      );
    });
  }, [layers]);

  const industryLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("industry") ||
        lower.includes("industries")
      );
    });
  }, [layers]);

  const villageLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return lower === "villages" || lower === "village-boundary";
    });
  }, [layers]);

  const administrativeLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      const hasOriginal = ORIGINAL_LAYERS.has(lower) || ORIGINAL_LAYERS.has(lower.replace(/_/g, "-"));
      if (!hasOriginal) return false;

      const isPolice = lower.includes("police");
      const isHealth = (
        lower.includes("health") ||
        lower.includes("hospital") ||
        lower.includes("dispensary") ||
        lower.includes("dispenceries") ||
        lower.includes("ayurvedic") ||
        lower.includes("ayush") ||
        lower.includes("anm") ||
        lower.includes("cmo") ||
        lower.includes("medical") ||
        lower.includes("clinic")
      );
      const isRiver = lower.includes("river") || lower.includes("stream") || lower.includes("dam") || lower.includes("canal");
      const isEducation = lower.includes("education") || lower.includes("school") || lower.includes("collage") || lower.includes("agandadi") || lower.includes("anganwadi");
      
      if (isPolice || isHealth || isEducation || isRiver) return false;

      return (
        lower.includes("boundary") ||
        lower.includes("district") ||
        lower.includes("block") ||
        lower.includes("tehsil") ||
        lower.includes("tahsil") ||
        lower.includes("kotwali") ||
        lower.includes("thans")
      );
    });
  }, [layers]);

  const educationLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("education") ||
        lower.includes("school") ||
        lower.includes("collage") ||
        lower.includes("college") ||
        lower.includes("agandadi") ||
        lower.includes("anganwadi") ||
        lower === "ps"
      );
    });
  }, [layers]);

  const polySainikLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("polytecnic") ||
        lower.includes("polytechnic") ||
        lower.includes("esm") ||
        lower.includes("sainik") ||
        lower.includes("widow") ||
        lower.includes("orphan")
      );
    });
  }, [layers]);

  const urbanDevelopmentLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("nagar") ||
        lower.includes("panchyat") ||
        lower.includes("panchayat") ||
        lower.includes("palika") ||
        lower.includes("parishad")
      );
    });
  }, [layers]);

  const healthLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return (
        lower.includes("health") ||
        lower.includes("hospital") ||
        lower.includes("dispensary") ||
        lower.includes("dispenceries") ||
        lower.includes("ayurvedic") ||
        lower.includes("ayush") ||
        lower.includes("anm") ||
        lower.includes("cmo") ||
        lower.includes("medical") ||
        lower.includes("clinic") ||
        lower.includes("homeopathic") ||
        lower.includes("homopathic")
      );
    });
  }, [layers]);

  const policeLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return lower.includes("police");
    });
  }, [layers]);

  const riverLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      return lower.includes("river") || lower.includes("stream") || lower.includes("dam") || lower.includes("canal");
    });
  }, [layers]);

  const otherLayers = useMemo(() => {
    return layers.filter(layer => {
      const lower = layer.name.toLowerCase();
      
      const isPolice = lower.includes("police");
      const isHealth = (
        lower.includes("health") ||
        lower.includes("hospital") ||
        lower.includes("dispensary") ||
        lower.includes("dispenceries") ||
        lower.includes("ayurvedic") ||
        lower.includes("ayush") ||
        lower.includes("anm") ||
        lower.includes("cmo") ||
        lower.includes("medical") ||
        lower.includes("clinic") ||
        lower.includes("homeopathic") ||
        lower.includes("homopathic")
      );
      const isRiver = lower.includes("river") || lower.includes("stream") || lower.includes("dam") || lower.includes("canal");
      const isPolling = lower.includes("polling") || lower.includes("booth");
      const isIrrigation = lower.includes("lift-scheme") || lower.includes("tubewell") || lower.includes("tube-well") || lower.includes("irrigation");
      const isMinority = (
        lower.includes("minority") ||
        lower.includes("kabristhan") ||
        lower.includes("madarasa") ||
        lower.includes("masjid") ||
        lower.includes("dargah")
      );
      const isEducation = (
        lower.includes("education") ||
        lower.includes("school") ||
        lower.includes("collage") ||
        lower.includes("college") ||
        lower.includes("agandadi") ||
        lower.includes("anganwadi") ||
        lower === "ps"
      );

      const isAdministrative = (
        lower.includes("boundary") ||
        lower.includes("district") ||
        lower.includes("block") ||
        lower.includes("tehsil") ||
        lower.includes("tahsil") ||
        lower.includes("kotwali") ||
        lower.includes("thans")
      );

      const isVillage = lower === "villages" || lower === "village-boundary";
      const isEmployment = lower.includes("employment");
      const isTown = lower.includes("town");
      const isTourist = lower.includes("tourist");
      const isPolySainik = (
        lower.includes("polytecnic") ||
        lower.includes("polytechnic") ||
        lower.includes("esm") ||
        lower.includes("sainik") ||
        lower.includes("widow") ||
        lower.includes("orphan")
      );

      const isUrbanDevelopment = (
        lower.includes("nagar") ||
        lower.includes("panchyat") ||
        lower.includes("panchayat") ||
        lower.includes("palika") ||
        lower.includes("parishad")
      );

      const isBank = (
        lower.includes("bank") ||
        lower === "boi" ||
        lower === "pnb" ||
        lower === "sbi" ||
        lower === "ubi" ||
        lower === "ucb" ||
        lower === "ugb" ||
        lower === "cbi" ||
        lower === "dcb" ||
        lower === "hdfc" ||
        lower === "idbi" ||
        lower === "obc"
      );

      const isExcise = (
        lower === "bar" ||
        lower.includes("wine") ||
        lower.includes("excise") ||
        lower === "godwon"
      );

      const isJalSansthan = (
        (lower.includes("jal") || 
         lower.includes("sansthan") || 
         lower.includes("unit office") || 
         lower.includes("unit_office") || 
         lower.includes("division_devprayag")) &&
        !lower.includes("handpump") &&
        !lower.includes("hand_pump") &&
        !lower.includes("hand-pump")
      );

      const isHandpump = (
        lower.includes("handpump") ||
        lower.includes("hand_pump") ||
        lower.includes("hand-pump") ||
        lower === "tehri"
      );

      const isPostal = (
        lower.includes("post") ||
        lower.includes("mail") ||
        lower.includes("postal") ||
        lower.includes("saving")
      );

      const isHorticulture = (
        lower.includes("horticulture") ||
        lower.includes("canning") ||
        lower.includes("garden") ||
        lower.includes("mobile_team") ||
        lower.includes("mobile-team") ||
        lower === "office"
      );

      const isUPC = (
        lower.includes("tranformer") ||
        lower.includes("transformer") ||
        lower === "offices"
      );

      const isIndustry = (
        lower.includes("industry") ||
        lower.includes("industries")
      );

      if (isPolice || isHealth || isRiver || isEducation || isAdministrative || isPolling || isIrrigation || isMinority || isVillage || isEmployment || isTown || isTourist || isPolySainik || isUrbanDevelopment || isBank || isExcise || isJalSansthan || isPostal || isHorticulture || isUPC || isIndustry || isHandpump) {
        return false;
      }

      // If it is not one of the original 33 layers, it is a custom uploaded layer.
      // Any uploaded layer should show in Other Layers!
      const hasOriginal = ORIGINAL_LAYERS.has(lower) || ORIGINAL_LAYERS.has(lower.replace(/_/g, "-"));
      if (!hasOriginal) return true;

      return !isAdministrative && !isEducation && !isHealth && !isPolice && !isRiver && !isPolling && !isIrrigation && !isMinority && !isVillage && !isEmployment && !isTown && !isTourist && !isPolySainik && !isUrbanDevelopment && !isBank && !isExcise && !isJalSansthan && !isPostal && !isHorticulture && !isUPC && !isIndustry && !isHandpump;
    });
  }, [layers]);

  const renderLayerItem = (layer: LayerConfig) => (
    <div key={layer.id} className="p-3 flex flex-col gap-2 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Interactive toggle */}
          <button
            onClick={() => toggleLayer(layer.id)}
            className={`p-1 rounded-md transition duration-150 ${
              layer.visible 
                ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" 
                : "text-slate-400 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            {layer.visible ? (
              <CheckSquare className="w-3.5 h-3.5" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Dynamic Geometry Indicator & Name */}
          <div className="flex items-center space-x-1.5 min-w-0">
            {/* Legend Badge representation */}
            {layer.type === "point" && (
              <span 
                className="w-3 h-3 rounded-full border border-white inline-block shadow-sm shrink-0" 
                style={{ backgroundColor: layer.color }}
              />
            )}
            {layer.type === "linestring" && (
              <span 
                className="w-4 h-1 rounded inline-block shrink-0" 
                style={{ backgroundColor: layer.color }}
              />
            )}
            {layer.type === "polygon" && (
              <span 
                className="w-3.5 h-3.5 rounded border shadow-inner inline-block shrink-0" 
                style={{ 
                  borderColor: layer.color, 
                  backgroundColor: `${layer.fillColor}${Math.round(layer.fillOpacity * 255).toString(16).padStart(2, '0')}` 
                }}
              />
            )}
            {layer.type === "unknown" && (
              <span className="w-3 h-3 bg-slate-300 border border-slate-400 inline-block shrink-0" />
            )}

            <span className={`text-xs font-semibold ${layer.visible ? 'text-slate-800' : 'text-slate-400'} truncate`} title={layer.name}>
              {layer.name}
            </span>
          </div>
        </div>

        {/* Locate/zoom button */}
        <button
          onClick={() => onZoomToLayer(layer.name)}
          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition duration-150 shrink-0"
          title={`Zoom map to ${layer.name}`}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sub-controls: Color & Opacity (only when layer is enabled) */}
      {layer.visible && (
        <div className="flex items-center gap-3 pl-8 pb-1 pt-0.5">
          {/* Color Picker Indicator */}
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="color"
              id={`color-${layer.id}`}
              value={layer.color}
              onChange={(e) => updateLayerColor(layer.id, e.target.value)}
              className="w-4 h-4 rounded cursor-pointer border border-slate-300 p-0 block bg-transparent"
              title="Change layer color"
            />
          </div>

          {/* Opacity slider */}
          <div className="flex items-center gap-1.5 flex-1 select-none">
            <Sliders className="w-3 h-3 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layer.opacity}
              onChange={(e) => updateLayerOpacity(layer.id, parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              title="Adjust transparency"
            />
            <span className="text-[9px] text-slate-500 font-mono w-6 text-right">
              {Math.round(layer.opacity * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Pure JS Haversine distance helper (meters)
  const getHaversineDistance = (p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const lat1 = p1.lat * Math.PI / 180;
    const lat2 = p2.lat * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Cumulative distance calculator
  const totalDistanceMeters = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      total += getHaversineDistance(measurePoints[i], measurePoints[i + 1]);
    }
    return total;
  }, [measurePoints]);

  // Shoelace planar polygon area projection calculation (square meters)
  const polygonAreaSqMeters = useMemo(() => {
    if (measurePoints.length < 3) return 0;
    
    // Find centroid
    let avgLat = 0;
    let avgLng = 0;
    measurePoints.forEach(p => {
      avgLat += p.lat;
      avgLng += p.lng;
    });
    const refLat = (avgLat / measurePoints.length) * Math.PI / 180;
    
    const R = 6371000;
    const projected = measurePoints.map(p => {
      const x = p.lng * Math.PI / 180 * R * Math.cos(refLat);
      const y = p.lat * Math.PI / 180 * R;
      return { x, y };
    });
    
    let area = 0;
    const n = projected.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += projected[i].x * projected[j].y;
      area -= projected[j].x * projected[i].y;
    }
    
    return Math.abs(area) / 2;
  }, [measurePoints]);

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters.toFixed(1)} meters`;
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatArea = (sqMeters: number) => {
    if (sqMeters < 100000) return `${sqMeters.toFixed(1)} m²`;
    const hectares = sqMeters / 10000;
    const sqKm = sqMeters / 1000000;
    return `${sqKm.toFixed(3)} km² (${hectares.toFixed(1)} Ha)`;
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center pt-16 pb-4 h-full shrink-0 shadow-sm font-sans transition-all duration-300">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Open Map Controller"
          className="p-2 text-slate-600 hover:text-indigo-600 rounded-md hover:bg-indigo-50 border border-slate-200 bg-white shadow-sm transition duration-150 mt-4 mb-8 cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="vertical-text text-[10px] uppercase font-bold tracking-widest text-slate-400 font-sans select-none whitespace-nowrap origin-center rotate-90 mt-16 leading-none flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          Basemaps & Layers
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col h-full shrink-0 shadow-sm font-sans">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-indigo-600 animate-pulse" />
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">Geo Spatial Server</h1>
            <span className="text-[10px] text-slate-500 font-medium">MongoDB Database</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleAllLayers(!anyLayerActive)}
            title={anyLayerActive ? "Deactivate All Layers" : "Activate All Layers"}
            className={`p-1.5 rounded-md transition duration-150 border border-transparent cursor-pointer ${
              anyLayerActive
                ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            {anyLayerActive ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            title="Minimize Panel"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition duration-150 border border-transparent cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Layer Manager */}
        <div className="space-y-3">
          <button
            onClick={() => setIsLayersCollapsed(!isLayersCollapsed)}
            className="flex items-center justify-between pt-1 w-full text-left bg-transparent border-0 p-0 focus:outline-none group cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
              <Layers className="w-4 h-4 text-indigo-500" />
              LAYERS ({layers.length})
              {isLayersCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              )}
            </span>
            {!isLayersCollapsed && (
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                {totalFeatures} Geometries Loaded
              </span>
            )}
          </button>

          {!isLayersCollapsed && (
            <div className="space-y-4">
              {/* Collapsible Administrative Layer Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                <button
                  onClick={() => setIsAdminCollapsed(!isAdminCollapsed)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    Administrative Layer ({administrativeLayers.length})
                  </span>
                  {isAdminCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
                
                {!isAdminCollapsed && (
                  <div className="bg-white divide-y divide-slate-100">
                    {administrativeLayers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No administrative layers loaded.
                      </div>
                    ) : (
                      administrativeLayers.map((layer) => renderLayerItem(layer))
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible Education Layer Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                <button
                  onClick={() => setIsEducationCollapsed(!isEducationCollapsed)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    Education Layer ({educationLayers.length})
                  </span>
                  {isEducationCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
                
                {!isEducationCollapsed && (
                  <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {educationLayers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No education layers loaded.
                      </div>
                    ) : (
                      educationLayers.map((layer) => renderLayerItem(layer))
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible Health Layer Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                <button
                  onClick={() => setIsHealthCollapsed(!isHealthCollapsed)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Health Layer ({healthLayers.length})
                  </span>
                  {isHealthCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
                
                {!isHealthCollapsed && (
                  <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {healthLayers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No health layers loaded.
                      </div>
                    ) : (
                      healthLayers.map((layer) => renderLayerItem(layer))
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible Police Layer Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                <button
                  onClick={() => setIsPoliceCollapsed(!isPoliceCollapsed)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    Police Layer ({policeLayers.length})
                  </span>
                  {isPoliceCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
                
                {!isPoliceCollapsed && (
                  <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {policeLayers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No police layers loaded.
                      </div>
                    ) : (
                      policeLayers.map((layer) => renderLayerItem(layer))
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible River Layer Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                <button
                  onClick={() => setIsRiverCollapsed(!isRiverCollapsed)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Waves className="w-3.5 h-3.5 text-cyan-500" />
                    River Layer ({riverLayers.length})
                  </span>
                  {isRiverCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
                
                {!isRiverCollapsed && (
                  <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {riverLayers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No river layers loaded.
                      </div>
                    ) : (
                      riverLayers.map((layer) => renderLayerItem(layer))
                    )}
                  </div>
                )}
              </div>



              {/* Collapsible URBAN- DEVELOPMENT Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                <button
                  onClick={() => setIsUrbanDevelopmentCollapsed(!isUrbanDevelopmentCollapsed)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Building className="w-3.5 h-3.5 text-rose-500" />
                    URBAN- DEVELOPMENT ({urbanDevelopmentLayers.length})
                  </span>
                  {isUrbanDevelopmentCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
                
                {!isUrbanDevelopmentCollapsed && (
                  <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {urbanDevelopmentLayers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No URBAN- DEVELOPMENT layers loaded.
                      </div>
                    ) : (
                      urbanDevelopmentLayers.map((layer) => renderLayerItem(layer))
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible Villages Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                <button
                  onClick={() => setIsVillagesCollapsed(!isVillagesCollapsed)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Home className="w-3.5 h-3.5 text-indigo-600" />
                    Villages ({villageLayers.length})
                  </span>
                  {isVillagesCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
                
                {!isVillagesCollapsed && (
                  <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {villageLayers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No village layers loaded.
                      </div>
                    ) : (
                      villageLayers.map((layer) => renderLayerItem(layer))
                    )}
                  </div>
                )}
              </div>



              {/* Collapsible BANK Section */}
              {bankLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsBankCollapsed(!isBankCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                      BANK ({bankLayers.length})
                    </span>
                    {isBankCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isBankCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {bankLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Excise-Department Section */}
              {exciseLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsExciseCollapsed(!isExciseCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Wine className="w-3.5 h-3.5 text-amber-600" />
                      Excise-Department ({exciseLayers.length})
                    </span>
                    {isExciseCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isExciseCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {exciseLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible JAL SANSTHAN OFFICE Section */}
              {jalSansthanLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsJalSansthanCollapsed(!isJalSansthanCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                      JAL SANSTHAN OFFICE ({jalSansthanLayers.length})
                    </span>
                    {isJalSansthanCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isJalSansthanCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {jalSansthanLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Handpump Section */}
              {handpumpLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsHandpumpCollapsed(!isHandpumpCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Wrench className="w-3.5 h-3.5 text-sky-600" />
                      Handpump ({handpumpLayers.length})
                    </span>
                    {isHandpumpCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isHandpumpCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {handpumpLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Postal-Department Section */}
              {postalLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsPostalCollapsed(!isPostalCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Mail className="w-3.5 h-3.5 text-red-500" />
                      Postal-Department ({postalLayers.length})
                    </span>
                    {isPostalCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isPostalCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {postalLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Horticulture-Department Section */}
              {horticultureLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsHorticultureCollapsed(!isHorticultureCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      Horticulture-Department ({horticultureLayers.length})
                    </span>
                    {isHorticultureCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isHorticultureCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {horticultureLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Uttarakhand Power Corporation Section */}
              {upcLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsUPCCollapsed(!isUPCCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Uttarakhand Power Corporation ({upcLayers.length})
                    </span>
                    {isUPCCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isUPCCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {upcLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}



              {/* Collapsible Industry Section */}
              {industryLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsIndustryCollapsed(!isIndustryCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Factory className="w-3.5 h-3.5 text-orange-600" />
                      Industry ({industryLayers.length})
                    </span>
                    {isIndustryCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isIndustryCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {industryLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}



              {/* Collapsible OTHER LAYERS Section */}
              {otherLayers.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 shadow-sm">
                  <button
                    onClick={() => setIsOtherLayersCollapsed(!isOtherLayersCollapsed)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100/80 hover:bg-slate-200/60 transition-colors text-left font-sans focus:outline-none border-b border-slate-200/60 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      OTHER LAYERS ({otherLayers.length})
                    </span>
                    {isOtherLayersCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  
                  {!isOtherLayersCollapsed && (
                    <div className="bg-white divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {otherLayers.map((layer) => renderLayerItem(layer))}
                    </div>
                  )}
                </div>
              )}

              {layers.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 font-medium bg-white border border-slate-200 rounded-lg shadow-sm">
                  No layers found in database.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Base Map Gallery */}
        <div className="space-y-3">
          <button
            onClick={() => setIsBaseMapCollapsed(!isBaseMapCollapsed)}
            className="flex items-center justify-between w-full text-left bg-transparent border-0 p-0 focus:outline-none group cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pt-2 hover:text-emerald-600 transition-colors">
              <Globe className="w-4 h-4 text-emerald-500" />
              BASE MAP GALLERY
              {isBaseMapCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              )}
            </span>
          </button>

          {!isBaseMapCollapsed && (
            <div className="grid grid-cols-2 gap-2">
              {baseMaps.map((map) => {
                const isSelected = activeBaseMap === map.id;
                return (
                  <button
                    key={map.id}
                    onClick={() => setBaseMap(map.id)}
                    className={`group relative text-left rounded-lg overflow-hidden border p-2 transition-all duration-200 ${
                      isSelected 
                        ? "border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/50" 
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {/* Styled Thumbnail representation (No external asset dependency) */}
                    <div className="h-14 w-full rounded-md mb-1.5 overflow-hidden border border-slate-100 flex items-center justify-center relative">
                      {/* Simulated visual textures */}
                      {map.id === "osm" && (
                        <div className="absolute inset-0 bg-sky-50 grid grid-cols-4 grid-rows-4 opacity-75">
                          <div className="border-b border-r border-emerald-100/40 bg-emerald-50"></div>
                          <div className="border-b border-r border-emerald-100/40"></div>
                          <div className="border-b border-r border-emerald-100/40"></div>
                          <div className="border-b border-emerald-100/40 bg-sky-100"></div>
                          <div className="border-b border-r border-emerald-100/40"></div>
                          <div className="border-b border-r border-teal-50 bg-indigo-50"></div>
                          <div className="border-b border-r border-emerald-100/40"></div>
                          <div className="border-b border-emerald-100/40"></div>
                          <div className="border-r border-emerald-100/40"></div>
                          <div className="border-r border-emerald-100/40 bg-emerald-50"></div>
                          <div className="border-r border-emerald-100/40"></div>
                          <div className="bg-sky-50"></div>
                        </div>
                      )}
                      {map.id === "light" && <div className="absolute inset-0 bg-slate-50 border-r border-b border-slate-100" />}
                      {map.id === "dark" && <div className="absolute inset-0 bg-slate-900 border-r border-b border-slate-800" />}
                      {map.id === "satellite" && (
                        <div className="absolute inset-0 bg-emerald-950 flex flex-col">
                          <div className="flex-1 bg-emerald-900/60" />
                          <div className="h-4 bg-sky-900/40" />
                        </div>
                      )}
                      {map.id === "terrain" && (
                        <div className="absolute inset-0 bg-stone-100 flex items-center justify-center opacity-90 overflow-hidden">
                          <span className="text-stone-300 text-[8px] font-mono select-none">〽️ Contour Lines</span>
                        </div>
                      )}
                      {map.id === "bhuvan" && (
                        <div className="absolute inset-0 bg-white flex flex-col justify-between overflow-hidden opacity-90">
                          <div className="h-4 bg-amber-500/70" />
                          <div className="flex-1 bg-white flex items-center justify-center">
                            <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest font-sans select-none">🇮🇳 ISRO</span>
                          </div>
                          <div className="h-4 bg-emerald-600/70" />
                        </div>
                      )}
                      
                      {/* Tick mark */}
                      {isSelected && (
                        <span className="absolute top-1 right-1 bg-indigo-600 text-white p-0.5 rounded-full shadow-md z-10 transition duration-150">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        </span>
                      )}

                      {/* Indicator Icon */}
                      <span className="text-[10px] font-mono leading-none font-bold text-slate-400 absolute bottom-1 right-1.5 bg-white/80 dark:bg-black/40 px-1 py-0.5 rounded">
                        {map.id.toUpperCase()}
                      </span>
                    </div>

                    <span className={`text-[11px] font-bold block truncate leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {map.name}
                    </span>
                    <p className="text-[9px] text-slate-400 line-clamp-1 leading-snug">
                      {map.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Sidebar Footer Banner */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="bg-slate-50 border border-slate-100 rounded-md p-2 flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
          <div className="flex justify-between">
            <span>State Code (Uttarakhand):</span>
            <span className="font-mono text-slate-700 font-bold">05</span>
          </div>
          <div className="flex justify-between">
            <span>District (Tehri):</span>
            <span className="font-mono text-slate-700 font-bold">059</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
