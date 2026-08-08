import dotenv from "dotenv";
import app from "./app.js";
import { testDBConnection } from "./config/db.js";
import { seedDefaultCategories } from "./config/seedCategories.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testDBConnection();
  await seedDefaultCategories();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
