import { Request, Response } from 'express';
import Client from '../models/Client';

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);
const isValidPhone = (phone: string): boolean => /^[0-9+\-()\s]{7,20}$/.test(phone);
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }
    
    const client = await Client.findById(id);
    
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client', error });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolName = String(req.body.schoolName || '').trim();
    const contactPerson = String(req.body.contactPerson || '').trim();
    const phone = String(req.body.phone || '').trim();
    const address = String(req.body.address || '').trim();
    const email = req.body.email ? String(req.body.email).trim() : undefined;

    if (!schoolName || !contactPerson || !phone || !address) {
      res.status(400).json({ message: 'School name, contact person, phone, and address are required' });
      return;
    }

    if (!isValidPhone(phone)) {
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }

    if (email && !isValidEmail(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const client = await Client.create({
      schoolName,
      contactPerson,
      phone,
      address,
      email,
    });
    
    res.status(201).json({
      success: true,
      message: 'Client added successfully',
      data: client,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating client', error });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: Record<string, unknown> = {};

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }

    if (req.body.schoolName !== undefined) updateData.schoolName = String(req.body.schoolName).trim();
    if (req.body.contactPerson !== undefined) updateData.contactPerson = String(req.body.contactPerson).trim();
    if (req.body.phone !== undefined) updateData.phone = String(req.body.phone).trim();
    if (req.body.address !== undefined) updateData.address = String(req.body.address).trim();
    if (req.body.email !== undefined) {
      updateData.email = req.body.email ? String(req.body.email).trim() : undefined;
    }

    if (typeof updateData.phone === 'string' && !isValidPhone(updateData.phone)) {
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }

    if (typeof updateData.email === 'string' && updateData.email && !isValidEmail(updateData.email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }
    
    const client = await Client.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating client', error });
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }
    
    const client = await Client.findByIdAndDelete(id);
    
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error });
  }
};
