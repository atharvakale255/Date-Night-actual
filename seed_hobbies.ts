import { db } from "./server/db";
import { questions } from "./shared/schema";

const hobbiesQuestions = [
  {
    category: "quiz",
    text: "Free time?",
    options: ["Music", "Movies", "Reading", "Scrolling"]
  },
  {
    category: "quiz",
    text: "Weekend plan?",
    options: ["Sleep", "Outing", "Netflix", "Family"]
  },
  {
    category: "quiz",
    text: "Travel mood?",
    options: ["Mountains", "Beach", "City", "Home"]
  },
  {
    category: "quiz",
    text: "Fun activity?",
    options: ["Cooking", "Gaming", "Dancing", "Talking"]
  },
  {
    category: "quiz",
    text: "Creative side?",
    options: ["Art", "Writing", "Singing", "None"]
  },
  {
    category: "quiz",
    text: "Sports vibe?",
    options: ["Playing", "Watching", "Both", "None"]
  },
  {
    category: "quiz",
    text: "Favorite snack?",
    options: ["Chips", "Chocolate", "Cookies", "Fruit"]
  },
  {
    category: "quiz",
    text: "Comfort food?",
    options: ["Pizza", "Momos", "Burger", "Pasta"]
  },
  {
    category: "quiz",
    text: "Sweet craving?",
    options: ["Cake", "Ice-cream", "Gulabjamun", "Chocolate"]
  },
  {
    category: "quiz",
    text: "Drink choice?",
    options: ["Tea", "Coffee", "Juice", "Shake"]
  },
  {
    category: "quiz",
    text: "Street food love?",
    options: ["Pani-puri", "Chaat", "Momos", "Fries"]
  },
  {
    category: "quiz",
    text: "Late-night hunger?",
    options: ["Maggi", "Snacks", "Sweets", "Nothing"]
  },
  {
    category: "quiz",
    text: "Music mood?",
    options: ["Romantic", "Sad", "Chill", "Energetic"]
  },
  {
    category: "quiz",
    text: "Movie choice?",
    options: ["Rom-com", "Action", "Drama", "Thriller"]
  },
  {
    category: "quiz",
    text: "Series type?",
    options: ["Sitcom", "Anime", "K-drama", "Reality"]
  },
  {
    category: "quiz",
    text: "Background sound?",
    options: ["Music", "Silence", "TV", "Nature"]
  }
];

async function seed() {
  console.log("Seeding new quiz questions...");
  try {
    await db.insert(questions).values(hobbiesQuestions);
    console.log("Successfully seeded questions!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding questions:", err);
    process.exit(1);
  }
}

seed();
