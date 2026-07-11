export interface GeoJsonGeometry {
  type: string;
  coordinates: any;
}

export interface GisFeature {
  id: string;
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: Record<string, any>;
}

export interface BaseMap {
  id: string;
  name: string;
  url: string;
  attribution: string;
  thumbnail: string;
  desc: string;
}

export interface LayerStyle {
  color: string;
  fillColor: string;
  weight: number;
  opacity: number;
  fillOpacity: number;
  radius?: number; // for point layers
}

export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  type: "point" | "linestring" | "polygon" | "unknown";
  color: string;
  fillColor: string;
  opacity: number;
  fillOpacity: number;
  weight: number;
  itemCount: number;
}
