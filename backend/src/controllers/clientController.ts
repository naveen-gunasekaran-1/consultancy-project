import { Request, Response } from 'express';
import clientRepository from '../repositories/clientRepository';
import { logger } from '../utils/logger';

const isValidPhone = (phone: string): boolean => /^[0-9+\-()\s]{7,20}$/.test(phone);
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const parseId = (id: string): number | null => {
  const value = parseInt(id, 10);
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }
  return value;
};

const mapClient = (client: any) => ({
  ...client,
  _id: String(client.id),
  isActive: Boolean(client.isActive),
});

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  logger.info('client.get_all', { requestId: req.requestId });
  const clients = clientRepository.findAll().map(mapClient);
  logger.info('client.get_all.success', { requestId: req.requestId, count: clients.length });
  res.status(200).json({ success: true, count: clients.length, data: clients });
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  logger.info('client.get_by_id', { requestId: req.requestId, clientId: id });
  const clientId = parseId(id);
  if (!clientId) {
    res.status(400).json({ message: 'Invalid client ID format' });
    return;
  }

  const client = clientRepository.findById(clientId);
  if (!client) {
    logger.warn('client.get_by_id.not_found', { requestId: req.requestId, clientId: id });
    res.status(404).json({ message: 'Client not found' });
    return;
  }
  res.status(200).json({ success: true, data: mapClient(client) });
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
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

  const existingClient = clientRepository.findByEmail(email.toLowerCase());
  if (existingClient) {
    logger.warn('client.create.failed', { requestId: req.requestId, reason: 'email_exists' });
    res.status(400).json({ message: 'Email already registered' });
    return;
  }

  const client = clientRepository.create({
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

  logger.info('client.create.success', { requestId: req.requestId, clientId: client.id, email });
  res.status(201).json({ success: true, message: 'Client created successfully', data: mapClient(client) });
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  logger.info('client.update', { requestId: req.requestId, clientId: id });

  const clientId = parseId(id);
  if (!clientId) {
    res.status(400).json({ message: 'Invalid client ID format' });
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

  const client = clientRepository.findById(clientId);
  if (!client) {
    logger.warn('client.update.not_found', { requestId: req.requestId, clientId: id });
    res.status(404).json({ message: 'Client not found' });
    return;
  }

  const updatedClient = clientRepository.update(clientId, {
    name, 
    email: email ? email.toLowerCase() : client.email, 
    phone, 
    address, 
    city, 
    state, 
    zipCode, 
    country: country || client.country, 
    companyName, 
    notes 
  });

  logger.info('client.update.success', { requestId: req.requestId, clientId: id });
  res.status(200).json({ success: true, message: 'Client updated successfully', data: updatedClient ? mapClient(updatedClient) : null });
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  logger.info('client.delete', { requestId: req.requestId, clientId: id });

  const clientId = parseId(id);
  if (!clientId) {
    res.status(400).json({ message: 'Invalid client ID format' });
    return;
  }

  const client = clientRepository.findById(clientId);
  if (!client) {
    logger.warn('client.delete.not_found', { requestId: req.requestId, clientId: id });
    res.status(404).json({ message: 'Client not found' });
    return;
  }

  clientRepository.delete(clientId);
  logger.info('client.delete.success', { requestId: req.requestId, clientId: id });
  res.status(200).json({ success: true, message: 'Client deleted successfully' });
};
