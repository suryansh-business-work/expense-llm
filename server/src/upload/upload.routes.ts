// Core Modules
import express from 'express'

// Controllers
import { imageKitUpload } from './upload.controller'

// Initialization
const router = express.Router()

router.post('/imagekit/upload', imageKitUpload)

export default router
