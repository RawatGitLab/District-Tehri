import { MongoClient } from "mongodb";
import proj4 from "proj4";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION;

const UTM_44N = "+proj=utm +zone=44 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const INDIA_LCC_CUSTOM = "+proj=lcc +lat_1=12.472944444 +lat_2=35.147111111 +lat_0=3.98 +lon_0=80 +x_0=4000000 +y_0=1748300 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const WGS_84 = "+proj=longlat +datum=WGS84 +no_defs";

const utmConverter = proj4(UTM_44N, WGS_84);
const lccConverter = proj4(INDIA_LCC_CUSTOM, WGS_84);

function projectCoordinates(coordinates) {
  if (!Array.isArray(coordinates)) {
    return coordinates;
  }
  
  if ((coordinates.length === 2 || coordinates.length === 3) && typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    const x = coordinates[0];
    const y = coordinates[1];
    
    if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 1e10 || Math.abs(y) > 1e10) {
      return [78.4161, 30.3615];
    }
    
    if (Math.abs(x) > 1000 || Math.abs(y) > 1000) {
      try {
        let lng, lat;
        if (Math.abs(x) > 1000000) {
          [lng, lat] = lccConverter.forward([x, y]);
        } else {
          [lng, lat] = utmConverter.forward([x, y]);
        }
        
        if (isFinite(lng) && isFinite(lat)) {
          if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
            return [78.4161, 30.3615];
          }
          return [lng, lat];
        }
      } catch (e) {
        // console.error("Error", e);
      }
      return [78.4161, 30.3615];
    }
    return coordinates;
  }
  
  return coordinates.map(projectCoordinates);
}

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const collection = db.collection(MONGODB_COLLECTION);
  
  const docs = await collection.find({}).toArray();
  
  console.log("Analyzing projected coordinate ranges...");
  
  let globalMinLng = Infinity, globalMaxLng = -Infinity, globalMinLat = Infinity, globalMaxLat = -Infinity;
  const layerBounds = {};
  
  docs.forEach(doc => {
    const name = doc.name || doc.Layer || doc.layer || "Unassigned";
    let coords = null;
    if (Array.isArray(doc.features) && doc.features.length > 0) {
      coords = doc.features.flatMap(f => f.geometry?.coordinates || []);
    } else if (doc.geometry) {
      coords = doc.geometry.coordinates;
    } else if (doc.coordinates) {
      coords = doc.coordinates;
    }
    
    if (!coords) return;
    
    const projected = projectCoordinates(coords);
    
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    
    function extract(c) {
      if (!Array.isArray(c)) return;
      if (typeof c[0] === "number" && typeof c[1] === "number") {
        const lng = c[0];
        const lat = c[1];
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        
        if (lng < globalMinLng) globalMinLng = lng;
        if (lng > globalMaxLng) globalMaxLng = lng;
        if (lat < globalMinLat) globalMinLat = lat;
        if (lat > globalMaxLat) globalMaxLat = lat;
        return;
      }
      c.forEach(extract);
    }
    
    extract(projected);
    layerBounds[name] = { minLng, maxLng, minLat, maxLat };
  });
  
  console.log(`Global Projected Bounding Box:`);
  console.log(`  Lng Range: [${globalMinLng}, ${globalMaxLng}]`);
  console.log(`  Lat Range: [${globalMinLat}, ${globalMaxLat}]`);
  
  console.log("\nLayers with extreme/outlier projected bounds:");
  Object.keys(layerBounds).forEach(name => {
    const b = layerBounds[name];
    // Check if bounds are outside standard Tehri region (roughly [77.5, 79.5] and [29.8, 31.0])
    if (b.minLng < 77.0 || b.maxLng > 80.0 || b.minLat < 29.5 || b.maxLat > 31.5) {
      console.log(`  ${name}:`);
      console.log(`    Lng Range: [${b.minLng}, ${b.maxLng}]`);
      console.log(`    Lat Range: [${b.minLat}, ${b.maxLat}]`);
    }
  });
  
  await client.close();
}
run();
