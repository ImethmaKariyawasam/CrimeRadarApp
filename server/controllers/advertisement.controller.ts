import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import advertisementModel from '../models/advertisement.model';


export const createAdvertisement = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      targetAudience,
      startDate,
      endDate,
      pricingInformation,
      agreeTerms
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const newAdvertisement = new advertisementModel({
      title,
      description,
      category,
      targetAudience,
      startDate,
      endDate,
      pricingInformation,
      agreeTerms: agreeTerms === 'true',
      imageUrl: files.image ? files.image[0].path : undefined,
      pdfUrl: files.pdf ? files.pdf[0].path : undefined
    });

    await newAdvertisement.save();
    res.status(201).json({ message: 'Advertisement created successfully', advertisement: newAdvertisement });
  } catch (error) {
    res.status(500).json({ message: 'Error creating advertisement', error });
  }
};

export const getAdvertisements = async (req: Request, res: Response) => {
  try {
    const advertisements = await advertisementModel.find();
    res.status(200).json(advertisements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching advertisements', error });
  }
};


const transporter = nodemailer.createTransport({
  // Configure your email service here
  // For example, using Gmail:
  service: 'gmail',
  auth: {
    user: 'kavithanjali515@gmail.com',
    pass: 'gcil zvza uraw iieg'
  }
});

export const createAdvertisementwithEmail = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      targetAudience,
      startDate,
      endDate,
      pricingInformation,
      agreeTerms,
      email // Email is now expected in the form data
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Generate a unique code
    const uniqueCode = crypto.randomBytes(6).toString('hex');

    const newAdvertisement = new advertisementModel({
      title,
      description,
      category,
      targetAudience,
      startDate,
      endDate,
      pricingInformation,
      agreeTerms: agreeTerms === 'true',
      imageUrl: files.image ? files.image[0].path : undefined,
      pdfUrl: files.pdf ? files.pdf[0].path : undefined,
      uniqueCode,
      email
    });

    await newAdvertisement.save();

    // Send email with the unique code
    const mailOptions = {
      from: 'kavithanjali515@gmail.com',
      to: email,
      subject: 'Your Advertisement Code',
      text: `Your unique code for updating or deleting your advertisement is: ${uniqueCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'Advertisement created successfully', advertisement: newAdvertisement });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({ message: 'Error creating advertisement', error });
  }
};



export const updateAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { uniqueCode, ...updateData } = req.body;

    const advertisement = await advertisementModel.findById(id);

    if (!advertisement) {
       res.status(404).json({ message: 'Advertisement not found' });
       return;
    }

    if (advertisement.uniqueCode !== uniqueCode) {
       res.status(403).json({ message: 'Invalid unique code' });
        return;
    }

    const updatedAdvertisement = await advertisementModel.findByIdAndUpdate(id, updateData, { new: true });
     res.status(200).json({ message: 'Advertisement updated successfully', advertisement: updatedAdvertisement });
  } catch (error) {
     res.status(500).json({ message: 'Error updating advertisement', error });
  }
};

export const deleteAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { uniqueCode } = req.body;
    
    console.log('Received uniqueCode:', uniqueCode);

    const advertisement = await advertisementModel.findById(id);
    
    if (!advertisement) {
      res.status(404).json({ message: 'Advertisement not found' });
      return;
    }
    
    console.log('Stored uniqueCode:', advertisement.uniqueCode);
    console.log('Comparison result:', advertisement.uniqueCode !== uniqueCode);

    if (advertisement.uniqueCode !== uniqueCode) {
      res.status(403).json({ message: 'Invalid unique code' });
      return;
    }

    await advertisementModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error deleting advertisement', error });
  }
};
