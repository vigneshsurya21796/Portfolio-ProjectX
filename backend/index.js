const app = require("./app");
const dotenv = require("dotenv");

dotenv.config({ path: `.env` });

const { logger } = require("./src/utils/logger");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server started`, {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});
