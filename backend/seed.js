import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// seed.js

const mongoUri ="mongodb+srv://ebraheem:Ebraheem03@cluster0.egj1hc1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
if (!mongoUri) {
  console.error("❌ MONGODB_URI is not defined in .env file");
  process.exit(1);
}

// === MongoDB Connection ===
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// === Define Schema ===
const applicationSchema = new mongoose.Schema({
  university: String,
  degree: String,
  priority: Number,
  semesters: Number,
  applicationPortal: String,
  city: String,
  country: String,
  location: String,
  status: String,
  tuitionFees: Number,
  livingExpenses: Number,
  startingSemester: String,
});

const Application = mongoose.model("Application", applicationSchema);

// === Sample Data ===
const seedData = [
  {
    university: "University of Toronto",
    degree: "MSc Computer Science",
    priority: 1,
    semesters: 4,
    applicationPortal: "https://future.utoronto.ca",
    city: "Toronto",
    country: "Canada",
    location: "Downtown Campus",
    status: "In Progress",
    tuitionFees: 25000,
    livingExpenses: 15000,
    startingSemester: "Fall 2025",
  },
  {
    university: "Technical University of Munich",
    degree: "MSc Data Engineering",
    priority: 2,
    semesters: 4,
    applicationPortal: "https://www.tum.de",
    city: "Munich",
    country: "Germany",
    location: "Main Campus",
    status: "Submitted",
    tuitionFees: 3000,
    livingExpenses: 12000,
    startingSemester: "Winter 2025",
  },
  {
    university: "MIT",
    degree: "PhD in AI",
    priority: 1,
    semesters: 8,
    applicationPortal: "https://gradadmissions.mit.edu",
    city: "Cambridge",
    country: "USA",
    location: "MIT Main Campus",
    status: "Accepted",
    tuitionFees: 55000,
    livingExpenses: 20000,
    startingSemester: "Fall 2026",
  },
];

// === Insert Data ===
const seedDB = async () => {
  try {
    await Application.deleteMany({});
    await Application.insertMany(seedData);
    console.log("🌱 Database seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding DB:", err);
    mongoose.connection.close();
  }
};

seedDB();
