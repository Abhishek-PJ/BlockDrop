import dotenv from 'dotenv'
import express from "express"
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import blockchainRoutes from './routes/blockchain.js'
import cors from "cors";
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express();
const port = 8080;
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use('/blockchain', blockchainRoutes)

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`)
});