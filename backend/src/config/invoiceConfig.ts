// Invoice/Shop configuration for PDF generation
export const invoiceConfig = {
  shopName: process.env.SHOP_NAME || 'VJN Way To Success',
  shopAddress: process.env.SHOP_ADDRESS || '123 Business Street',
  shopCity: process.env.SHOP_CITY || 'Bangalore',
  shopState: process.env.SHOP_STATE || 'Karnataka',
  shopPostalCode: process.env.SHOP_POSTAL_CODE || '560001',
  shopPhone: process.env.SHOP_PHONE || '+91-9876543210',
  shopEmail: process.env.SHOP_EMAIL || 'contact@vjn.com',
  shopGSTIN: process.env.SHOP_GSTIN || '29AABCT1234R1Z0',
  shopRegistration: process.env.SHOP_REGISTRATION || 'TN29AABCT1234R1Z0',
  bankName: process.env.BANK_NAME || 'State Bank of India',
  bankAccount: process.env.BANK_ACCOUNT || '123456789',
  bankIFSC: process.env.BANK_IFSC || 'SBIN0001234',
};
