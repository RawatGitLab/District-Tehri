import { useState, useMemo, useEffect } from "react";
import { GisFeature, LayerConfig } from "../types";
import { Search, MapPin, Minimize2, Maximize2, AlertTriangle, BarChart3, ChevronDown, ChevronUp, Database, Wifi, Cpu, Activity, Table, RefreshCw } from "lucide-react";

interface AttributeTableProps {
  features: GisFeature[];
  layers: LayerConfig[];
  selectedFeature: GisFeature | null;
  onFeatureSelect: (feature: GisFeature | null) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onRefresh?: () => void;
}

export default function AttributeTable({
  features,
  layers,
  selectedFeature,
  onFeatureSelect,
  isCollapsed,
  setIsCollapsed,
  onRefresh
}: AttributeTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(true);
  const [isStatusCollapsed, setIsStatusCollapsed] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Get active layers that have features
  const activeLayersWithData = useMemo(() => {
    return layers.filter(
      (layer) =>
        layer.visible &&
        features.some(
          (f) =>
            f.properties.layer === layer.name ||
            f.properties.Layer === layer.name ||
            f.properties.LAYER === layer.name
        )
    );
  }, [layers, features]);

  // Determine current layer based on selected feature, or default to first active layer
  const currentLayer = useMemo(() => {
    if (activeLayersWithData.length === 0) return null;
    
    if (selectedFeature) {
        const featLayerName = selectedFeature.properties.layer ||
                              selectedFeature.properties.Layer ||
                              selectedFeature.properties.LAYER;
        const matched = activeLayersWithData.find((l) => l.name === featLayerName);
        if (matched) return matched;
    }
    return activeLayersWithData[0];
  }, [activeLayersWithData, selectedFeature]);

  // Get all features for the current selected layer
  const layerFeatures = useMemo(() => {
    if (!currentLayer) return [];
    return features.filter(
      (f) =>
        f.properties.layer === currentLayer.name ||
        f.properties.Layer === currentLayer.name ||
        f.properties.LAYER === currentLayer.name
    );
  }, [features, currentLayer]);

  // Calculate dynamic properties keys for the table columns
  const columnKeys = useMemo(() => {
    if (layerFeatures.length === 0) return [];
    const keysSet = new Set<string>();
    
    // Scan up to 10 sample features to establish common keys
    layerFeatures.slice(0, 15).forEach((feat) => {
      Object.keys(feat.properties).forEach((k) => {
        // Exclude system fields
        if (
          ![
            "_id",
            "id",
            "type",
            "geometry",
            "layer",
            "Layer",
            "LAYER",
            "geom_type",
            "coordinates",
            "FeatureCollection",
          ].includes(k)
        ) {
          keysSet.add(k);
        }
      });
    });

    // Sort to keep important names early
    const keys = Array.from(keysSet);
    const primaryKeys = ["name", "Name", "village_name", "Village_Name", "state", "State", "district", "District", "No_HH", "no_hh", "TOT_P", "tot_p", "pop", "Population"];
    
    keys.sort((a, b) => {
      const idxA = primaryKeys.findIndex(k => k.toLowerCase() === a.toLowerCase());
      const idxB = primaryKeys.findIndex(k => k.toLowerCase() === b.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return keys;
  }, [layerFeatures]);

  // Filter features based on search terms
  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return layerFeatures;
    const term = searchTerm.toLowerCase();

    return layerFeatures.filter((f) => {
      // Check properties values
      const matchesProperty = Object.entries(f.properties).some(([key, val]) => {
        if (typeof val === "string") {
          return val.toLowerCase().includes(term);
        }
        if (typeof val === "number") {
          return val.toString().includes(term);
        }
        return false;
      });

      return matchesProperty;
    });
  }, [layerFeatures, searchTerm]);

  // Reset page when currentLayer or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentLayer?.id, searchTerm]);

  // Paginated slice for clean UI performance (never rendering more than 50 rows in the DOM)
  const paginatedFeatures = useMemo(() => {
    const startIndex = (currentPage - 1) * 50;
    return filteredFeatures.slice(startIndex, startIndex + 50);
  }, [filteredFeatures, currentPage]);

  // Calculate GIS Numeric Sums (like Households and Population)
  const layerStats = useMemo(() => {
    if (filteredFeatures.length === 0) return null;
    
    let totalHH = 0;
    let totalPopulation = 0;
    let hasHH = false;
    let hasPop = false;

    filteredFeatures.forEach((feat) => {
      // Look for households fields
      const hhVal = feat.properties.No_HH ?? feat.properties.no_hh ?? feat.properties.households;
      if (hhVal !== undefined && hhVal !== null) {
        totalHH += Number(hhVal);
        hasHH = true;
      }

      // Look for population fields
      const popVal = feat.properties.TOT_P ?? feat.properties.tot_p ?? feat.properties.pop ?? feat.properties.population ?? feat.properties.Population;
      if (popVal !== undefined && popVal !== null) {
        totalPopulation += Number(popVal);
        hasPop = true;
      }
    });

    return {
      totalHH: hasHH ? Math.round(totalHH) : null,
      totalPopulation: hasPop ? Math.round(totalPopulation) : null,
    };
  }, [filteredFeatures]);

  const handleRowClick = (feature: GisFeature) => {
    onFeatureSelect(feature);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-l border-slate-200 bg-white flex flex-col items-center pt-16 pb-4 shrink-0 transition-all duration-300">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Open Attribute Table"
          className="p-2 text-slate-600 hover:text-indigo-600 rounded-md hover:bg-indigo-50 border border-slate-200 bg-slate-50 shadow-sm transition duration-150 mt-4 mb-8"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="vertical-text text-[10px] uppercase font-bold tracking-widest text-slate-400 font-sans select-none whitespace-nowrap origin-center rotate-90 mt-16 leading-none flex items-center gap-2">
          <Table className="w-4 h-4" />
          Attribute Table
        </div>
      </div>
    );
  }

  return (
    <div className="w-[450px] border-l border-slate-200 bg-white flex flex-col h-full shrink-0 shadow-sm font-sans transition-all duration-300">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-none">Attribute Table</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Explore feature details, properties, and stats</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              title={isFormCollapsed ? "Expand Filters" : "Collapse Filters"}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-50 transition duration-150 border border-slate-200 flex items-center justify-center"
            >
              {isFormCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              title="Minimize panel"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-50 transition duration-150 border border-transparent"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isFormCollapsed && (
          <>
            {/* Search Bar */}
            {currentLayer && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search in ${currentLayer.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-indigo-500 focus:bg-white transition"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Counter Bar */}
      {currentLayer && (
        <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200 flex justify-between text-[11px] items-center text-slate-500 font-medium font-mono">
          <span>Total: <strong className="text-slate-800">{layerFeatures.length}</strong></span>
          <span>Filtered: <strong className="text-slate-800">{filteredFeatures.length}</strong></span>
          <span>Selected: <strong className="text-indigo-600">{selectedFeature && selectedFeature.properties.layer === currentLayer.name ? "1" : "0"}</strong></span>
        </div>
      )}

      {/* Main Feature List / Attributes Table */}
      <div className="flex-1 overflow-auto min-h-0 bg-white relative">
        {!currentLayer ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2 stroke-[1.5]" />
            <p className="text-xs font-semibold text-slate-500">No GIS layers are currently active.</p>
            <p className="text-[10px] text-slate-400 mt-1">Please enable at least one layer checkbox in the left sidebar to see feature attribute rows.</p>
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Search className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold">No features found.</p>
            <p className="text-[10px] mt-0.5 leading-relaxed">No matching spatial attributes found for <strong className="text-slate-500">"{searchTerm}"</strong> in {currentLayer.name}.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-100/60 sticky top-0 border-b border-slate-200 shadow-sm z-10 text-slate-600 font-bold leading-tight select-none">
                <th className="py-2.5 px-3 whitespace-nowrap text-center text-[10px] w-12 border-r border-slate-200 uppercase tracking-widest bg-slate-100">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-[10px] w-24 border-r border-slate-200 uppercase tracking-widest bg-slate-100">Locate</th>
                {columnKeys.map((key) => (
                  <th key={key} className="py-2.5 px-3 border-r border-slate-200 uppercase tracking-wider font-mono text-[10px] bg-slate-100">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedFeatures.map((feat, itemIndex) => {
                const index = (currentPage - 1) * 50 + itemIndex;
                const isSelected = selectedFeature?.id === feat.id;
                const nameValue = feat.properties.name || feat.properties.Name || feat.properties.village_name || feat.properties.Village_Name || `Feature #${index + 1}`;

                return (
                  <tr
                    key={feat.id}
                    onClick={() => handleRowClick(feat)}
                    className={`group cursor-pointer text-slate-700 transition duration-150 ${
                      isSelected 
                        ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-l-2 border-l-indigo-600 border-b border-indigo-200" 
                        : "hover:bg-slate-50 border-l-2 border-l-transparent"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-[10px] text-slate-400 bg-slate-50/50">
                      {index + 1}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(feat);
                        }}
                        title="Zoom directly to this feature"
                        className="py-1 px-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-center gap-1 font-semibold text-[10px] w-full transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-indigo-500 group-hover:scale-110 transition-transform" />
                        <span>Zoom</span>
                      </button>
                    </td>

                    {/* Columns value rows */}
                    {columnKeys.map((k) => {
                      const val = feat.properties[k];
                      return (
                        <td key={k} className="py-2.5 px-3 border-r border-slate-100 whitespace-nowrap max-w-[150px] truncate" title={String(val ?? "")}>
                          {val !== undefined && val !== null ? (
                            typeof val === "number" ? (
                              Number.isInteger(val) ? val : val.toFixed(4)
                            ) : (
                              String(val)
                            )
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls Footer Bar */}
      {currentLayer && filteredFeatures.length > 50 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-b border-slate-200 flex items-center justify-between text-xs font-semibold select-none text-slate-600 shrink-0">
          <span className="text-[11px] text-slate-500">
            Showing <strong className="text-slate-800">{(currentPage - 1) * 50 + 1}</strong> to{" "}
            <strong className="text-slate-800">
              {Math.min(currentPage * 50, filteredFeatures.length)}
            </strong>{" "}
            of <strong className="text-slate-800">{filteredFeatures.length}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
            >
              Prev
            </button>
            <span className="text-[10px] text-slate-500 font-mono">
              Page {currentPage} / {Math.ceil(filteredFeatures.length / 50)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(filteredFeatures.length / 50))
                )
              }
              disabled={currentPage >= Math.ceil(filteredFeatures.length / 50)}
              className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-[10px]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MongoDB Spatial Database Status Widget */}
      <div className="border-t border-slate-200 bg-slate-900 text-slate-100 shadow-inner select-none font-sans flex flex-col shrink-0">
        <button
          onClick={() => setIsStatusCollapsed(!isStatusCollapsed)}
          className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-slate-850/40 transition-colors focus:outline-none"
        >
          <div className="flex items-center gap-1.5 font-semibold text-xs text-indigo-300">
            <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
            Geo Spatial Server
            {isStatusCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-300 transition-colors" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-300 transition-colors" />
            )}
          </div>
          <span className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block shrink-0" />
            CONNECTED
          </span>
        </button>

        {!isStatusCollapsed && (
          <div className="px-4 pb-4 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5 font-semibold">
              <div className="bg-slate-850/60 border border-slate-800 rounded-lg p-2">
                <span className="text-[9px] text-slate-400 uppercase block tracking-wider mb-0.5 font-bold">Spatial Engine</span>
                <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-500" />
                  v7.0 (Atlas Shared)
                </span>
              </div>
              <div className="bg-slate-850/60 border border-slate-800 rounded-lg p-2">
                <span className="text-[9px] text-slate-400 uppercase block tracking-wider mb-0.5 font-bold">Query Latency</span>
                <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                  ~34 ms (Realtime)
                </span>
              </div>
              <div className="bg-slate-850/60 border border-slate-800 rounded-lg p-2">
                <span className="text-[9px] text-slate-400 uppercase block tracking-wider mb-0.5 font-bold">Collections Loaded</span>
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {layers.length} Spatial Layers
                </span>
              </div>
              <div className="bg-slate-850/60 border border-slate-800 rounded-lg p-2">
                <span className="text-[9px] text-slate-400 uppercase block tracking-wider mb-0.5 font-bold">Total Geometries</span>
                <span className="text-xs font-bold text-indigo-300 font-mono">
                  {features.length.toLocaleString()} Loaded
                </span>
              </div>
            </div>

            <div className="bg-slate-850/40 border border-slate-800/80 rounded-md p-2 flex items-center justify-between text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                Atlas Node: <strong className="text-slate-300 font-mono">ap-south-1 (AWS)</strong>
              </span>
              <span className="text-emerald-500/90 font-bold font-mono">2dsphere spatial index</span>
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="w-full mt-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-indigo-400/20"
                title="Synchronize and fetch new spatial layers from MongoDB Atlas"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                RE-SYNC SPATIAL DATABASE
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
