import { Request, Response } from 'express';
import Client from '../models/Client';

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
    const { schoolName, contactPerson, phone, address, email } = req.body;
    
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
    const updateData = req.body;
    
    const client = await Client.findByIdAndUpdate(id, updateData, { new: true });
    
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
