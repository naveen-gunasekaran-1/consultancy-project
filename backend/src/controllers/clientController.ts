import { Request, Response } from 'express';
import Client from '../models/Client';
import { logger } from '../utils/logger';

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);
const isValidPhone = (phone: string): boolean => /^[0-9+\-()\s]{7,20}$/.test(phone);
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('client.get_all', { requestId: req.requestId });
    const clients = await Client.find().sort({ createdAt: -1 });
    logger.info('client.get_all.success', { requestId: req.requestId, count: clients.length });
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (error) {
    logger.error('client.get_all.error', { requestId: req.requestId, error });
    res.status(500).json({ message: 'Error fetching clients', error });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('client.get_by_id', { requestId: req.requestId, clientId: id });
    if (!isValidObjectId(id)) {
      logger.warn('client.get_by_id.invalid_id', { requestId: req.requestId, clientId: id });
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }
    const client = await Client.findById(id);
    if (!client) {
      logger.warn('client.get_by_id.not_found', { requestId: req.requestId, clientId: id });
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    logger.error('client.get_by_id.error', { requestId: req.requestId, error });
    res.status(500).json({ message: 'Error fetching client', error });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address, city, state, zipCode, country, companyName, notes } = req.body;
    logger.info('client.create', { requestId: req.requestId, email });

    if (!name || !email || !phone || !address || !city || !state || !zipCode) {
      logger.warn('client.create.validation_failed', { requestId: req.requestId, reason: 'missing_required_fields' });
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    if (!isValidEmail(email)) {
      logger.warn('client.create.validation_failed', { requestId: req.requestId, reason: 'invalid_email' });
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }
    if (!isValidPhone(phone)) {
      logger.warn('client.create.validation_failed', { requestId: req.requestId, reason: 'invalid_phone' });
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }

    const existingClient = await Client.findOne({ email: email.toLowerCase() });
    if (existingClient) {
      logger.warn('client.create.failed', { requestId: req.requestId, reason: 'email_exists' });
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const client = await Client.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      city,
      state,
      zipCode,
      country: country || 'India',
      companyName,
      notes,
    });

    logger.info('client.create.success', { requestId: req.requestId, clientId: client._id, email });
    res.status(201).json({ success: true, message: 'Client created successfully', data: client });
  } catch (error) {
    logger.error('client.create.error', { requestId: req.requestId, error });
    res.status(500).json({ message: 'Error creating client', error });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('client.update', { requestId: req.requestId, clientId: id });

    if (!isValidObjectId(id)) {
      logger.warn('client.update.invalid_id', { requestId: req.requestId, clientId: id });
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }

    const client = await Client.findById(id);
    if (!client) {
      logger.warn('client.update.not_found', { requestId: req.requestId, clientId: id });
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    const { name, email, phone, address, city, state, zipCode, country, companyName, notes } = req.body;

    if (phone && !isValidPhone(phone)) {
      logger.warn('client.update.validation_failed', { requestId: req.requestId, reason: 'invalid_phone' });
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }
    if (email && !isValidEmail(email)) {
      logger.warn('client.update.validation_failed', { requestId: req.requestId, reason: 'invalid_email' });
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { name, email: email ? email.toLowerCase() : client.email, phone, address, city, state, zipCode, country: country || client.country, companyName, notes },
      { new: true, runValidators: true }
    );

    logger.info('client.update.success', { requestId: req.requestId, clientId: id });
    res.status(200).json({ success: true, message: 'Client updated successfully', data: updatedClient });
  } catch (error) {
    logger.error('client.update.error', { requestId: req.requestId, clientId: req.params.id, error });
    res.status(500).json({ message: 'Error updating client', error });
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('client.delete', { requestId: req.requestId, clientId: id });

    if (!isValidObjectId(id)) {
      logger.warn('client.delete.invalid_id', { requestId: req.requestId, clientId: id });
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }

    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      logger.warn('client.delete.not_found', { requestId: req.requestId, clientId: id });
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    logger.info('client.delete.success', { requestId: req.requestId, clientId: id });
    res.status(200).json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    logger.error('client.delete.error', { requestId: req.requestId, clientId: req.params.id, error });
    res.status(500).json({ message: 'Error deleting client', error });
  }
};
