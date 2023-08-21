import { MongoClient, ObjectId } from 'mongodb';

interface CharacterSheet {
  _id?: ObjectId;
  name: string;
  stats: object;
  visibleTo: string[]; // Array of user IDs who can view the sheet
  editableBy: string[]; // Array of user IDs who can edit the sheet
}

const uri = process.env.MONGODB_URI; // Replace with your connection string
if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local',
  );
}
const client = new MongoClient(uri);

// Function to create a character sheet
async function createCharacterSheet(sheet: CharacterSheet) {
  const db = client.db('fate');
  const characterSheets = db.collection<CharacterSheet>('characterSheets');
  return characterSheets.insertOne(sheet);
}

// Function to update a character sheet
async function updateCharacterSheet(sheet: CharacterSheet) {
  const db = client.db('fate');
  const characterSheets = db.collection<CharacterSheet>('characterSheets');
  return characterSheets.updateOne({ _id: sheet._id }, { $set: sheet });
}

// Function to fetch character sheets with visibility control
async function fetchCharacterSheets(userId: string) {
  const db = client.db('fate');
  const characterSheets = db.collection<CharacterSheet>('characterSheets');
  return characterSheets.find({ visibleTo: userId }).toArray();
}

export {
  client,
  createCharacterSheet,
  updateCharacterSheet,
  fetchCharacterSheets,
};
