import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Department from "./models/Department.js";
import WorkSession from "./models/WorkSession.js";
import Workflow from "./models/Workflow.js";
import Log from "./models/Log.js"; // optional, wenn du Logs als Model anlegst

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB verbunden");

  // Departments
  await Department.deleteMany({});
  await Department.insertMany([
    { name: "IT" },
    { name: "HR" },
    { name: "Einkauf" },
    { name: "Trainer" },
    { name: "Öko Bosoter" }
  ]);
  console.log("Departments eingefügt");



  // WorkSessions
  await WorkSession.deleteMany({});
  await WorkSession.insertMany([
    {
      user_id: adminUser._id,
      start_time: new Date("2025-10-18T08:00:00Z"),
      end_time: new Date("2025-10-18T16:00:00Z"),
      date_today: new Date("2025-10-18")
    }
  ]);
  console.log("WorkSessions eingefügt");

  // Workflow
  await Workflow.deleteMany({});
  await Workflow.insertMany([
    { task: "asd", status: "open", created_at: new Date("2025-10-18T16:32:29Z"), user_id: adminUser._id },
    { task: "m", status: "open", created_at: new Date("2025-10-18T19:51:41Z"), user_id: adminUser._id },
    { task: "Neu", status: "open", created_at: new Date("2025-10-20T19:14:00Z"), user_id: adminUser._id },
    { task: "shaWorkflow", status: "open", created_at: new Date("2025-10-20T19:16:21Z"), user_id: adminUser._id }
  ]);
  console.log("Workflow eingefügt");

  // Optional: Logs
  await Log.deleteMany({});
  await Log.insertMany([
    { message: "Login fehlgeschlagen", level: "WARN", created_at: new Date("2025-09-25T14:20:00Z") },
    { message: "DB Verbindung verloren", level: "ERROR", created_at: new Date("2025-09-26T08:45:00Z") },
    { message: "Ungültige Eingabe im Formular", level: "INFO", created_at: new Date("2025-09-26T10:10:00Z") }
  ]);
  console.log("Logs eingefügt");

  mongoose.disconnect();
  console.log("Seeding abgeschlossen, MongoDB getrennt");
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
