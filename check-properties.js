import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION;

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const collection = db.collection(MONGODB_COLLECTION);
  
  const docs = await collection.find({}).toArray();
  console.log("Total docs:", docs.length);
  
  docs.forEach((doc) => {
    const layerName = doc.name || doc.Layer || doc.layer || "Unassigned";
    let featureCount = 0;
    let sampleGeom = null;
    let sampleProps = null;
    
    if (Array.isArray(doc.features)) {
      featureCount = doc.features.length;
      if (featureCount > 0) {
        sampleGeom = doc.features[0].geometry?.type;
        sampleProps = doc.features[0].properties;
      }
    } else if (doc.geometry) {
      featureCount = 1;
      sampleGeom = doc.geometry.type;
      sampleProps = doc.properties || doc;
    }
    
    console.log(`Layer: "${layerName}" | count: ${featureCount} | type: ${sampleGeom} | hasFeatures: ${Array.isArray(doc.features)}`);
    if (sampleProps) {
      console.log(`   Sample Properties: ${JSON.stringify(Object.keys(sampleProps))}`);
    }
  });
  
  await client.close();
}
run();
