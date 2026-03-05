export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

export const validateGuideForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Guide name is required' });
  } else if (data.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Guide name must be at least 3 characters' });
  }

  if (!data.class || data.class.trim().length === 0) {
    errors.push({ field: 'class', message: 'Class is required' });
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push({ field: 'subject', message: 'Subject is required' });
  }

  if (!data.price) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else if (isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0) {
    errors.push({ field: 'price', message: 'Price must be a positive number' });
  }

  if (!data.quantity) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (isNaN(parseInt(data.quantity)) || parseInt(data.quantity) < 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be zero or a positive number' });
  }

  return errors;
};

export const validateClientForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Client name is required' });
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  }

  return errors;
};

export const validateWorkerForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Worker name is required' });
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!data.salary || isNaN(parseFloat(data.salary))) {
    errors.push({ field: 'salary', message: 'Valid salary is required' });
  } else if (parseFloat(data.salary) < 0) {
    errors.push({ field: 'salary', message: 'Salary must be a positive number' });
  }

  return errors;
};
