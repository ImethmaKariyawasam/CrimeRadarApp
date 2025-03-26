import e, { Router } from "express";
import multer from "multer";
import path from "path";
import { createAdvertisement, createAdvertisementwithEmail, deleteAdvertisement, getAdvertisements, updateAdvertisement } from "../controllers/advertisement.controller";

const router = Router();



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  
  router.post('/create', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]), createAdvertisement);
  
  router.get('/', getAdvertisements);
  router.post('/createwithemail', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), createAdvertisementwithEmail);

  router.put('/:id', upload.fields([ { name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 } ]), updateAdvertisement);
 router.delete('/delete/:id', deleteAdvertisement);



export default router;