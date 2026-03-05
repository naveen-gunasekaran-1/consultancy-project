# Feature Implementation Tasks for Teammates

This document contains 2 feature implementation tasks that can be assigned to team members. Each task includes complete requirements, technical specifications, and acceptance criteria.

---

## 🎯 TASK 1: Create Add/Edit Guide Screens (Stock Management)

### **Overview**
Implement complete Add and Edit screens for the Guide (Stock) Management module. Users should be able to add new guides/books to inventory and edit existing ones with full form validation.

### **Priority**: 🔴 Critical (Phase 1 MVP)

### **Estimated Time**: 4-6 hours

---

### **Technical Requirements**

#### **Files to Create**
1. `frontend/src/screens/AddGuideScreen.tsx`
2. `frontend/src/screens/EditGuideScreen.tsx`

#### **Files to Modify**
- `frontend/src/screens/StockScreen.tsx` - Wire up navigation to Add/Edit screens
- `frontend/src/navigation/AppNavigator.tsx` - Add new screen routes

---

### **Feature Specifications**

#### **Form Fields Required**
```typescript
interface GuideForm {
  name: string;              // Guide/Book name (required, min 3 chars)
  class: string;             // Class (e.g., "10th", "12th") (required)
  subject: string;           // Subject (e.g., "Mathematics") (required)
  price: number;             // Price per unit (required, min 1)
  quantity: number;          // Stock quantity (required, min 0)
  publisher: string;         // Publisher name (optional)
}
```

#### **API Integration**
**Existing API endpoints to use** (already implemented in `frontend/src/services/api.ts`):

```typescript
// For Add Screen
await guideAPI.createGuide(formData);

// For Edit Screen
const guide = await guideAPI.getGuideById(guideId);  // Load existing data
await guideAPI.updateGuide(guideId, formData);       // Save changes
```

---

### **UI/UX Requirements**

#### **Add Guide Screen**
1. **Header**: "Add New Guide" with back button
2. **Form Layout**: Scrollable form with labeled input fields
3. **Input Fields**:
   - Text inputs for: name, class, subject, publisher
   - Numeric inputs for: price, quantity
   - All required fields should have asterisk (*)
4. **Buttons**:
   - "Save Guide" (primary button) - Green background
   - "Cancel" (secondary button) - Gray background
5. **Validation**:
   - Show red error text below each field on validation failure
   - Disable save button while submitting
6. **Success Behavior**: Navigate back to Stock screen after successful save

#### **Edit Guide Screen**
1. **Header**: "Edit Guide" with back button
2. **Form Layout**: Same as Add screen but pre-filled with existing data
3. **Loading State**: Show spinner while fetching guide data
4. **Buttons**: Same as Add screen
5. **Success Behavior**: Navigate back to Stock screen after successful update

---

### **Implementation Guide**

#### **Step 1: Update Navigation**
Add new screens to `frontend/src/navigation/AppNavigator.tsx`:

```typescript
// Inside MainStackNavigator, add these screen definitions:
<Stack.Screen 
  name="AddGuide" 
  component={AddGuideScreen}
  options={{ title: 'Add New Guide' }}
/>
<Stack.Screen 
  name="EditGuide" 
  component={EditGuideScreen}
  options={{ title: 'Edit Guide' }}
/>
```

#### **Step 2: Wire Up Stock Screen**
In `frontend/src/screens/StockScreen.tsx`, implement the empty handlers:

```typescript
// Add this to the "Add Guide" button onPress
navigation.navigate('AddGuide');

// For each guide item's edit button
<TouchableOpacity 
  onPress={() => navigation.navigate('EditGuide', { guideId: item._id })}
>
  {/* Edit icon */}
</TouchableOpacity>
```

#### **Step 3: Create AddGuideScreen.tsx**
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { guideAPI } from '../services/api';

export default function AddGuideScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    subject: '',
    price: '',
    quantity: '',
    publisher: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!formData.class) {
      newErrors.class = 'Class is required';
    }
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.price || Number(formData.price) < 1) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.quantity || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await guideAPI.createGuide({
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      });
      
      Alert.alert('Success', 'Guide added successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add guide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Name Field */}
        <Text style={styles.label}>Guide Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter guide name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* Class Field */}
        <Text style={styles.label}>Class *</Text>
        <TextInput
          style={[styles.input, errors.class && styles.inputError]}
          value={formData.class}
          onChangeText={(text) => setFormData({ ...formData, class: text })}
          placeholder="e.g., 10th, 12th"
        />
        {errors.class && <Text style={styles.errorText}>{errors.class}</Text>}

        {/* Subject Field */}
        <Text style={styles.label}>Subject *</Text>
        <TextInput
          style={[styles.input, errors.subject && styles.inputError]}
          value={formData.subject}
          onChangeText={(text) => setFormData({ ...formData, subject: text })}
          placeholder="e.g., Mathematics, Physics"
        />
        {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}

        {/* Price Field */}
        <Text style={styles.label}>Price (₹) *</Text>
        <TextInput
          style={[styles.input, errors.price && styles.inputError]}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          placeholder="Enter price"
          keyboardType="numeric"
        />
        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

        {/* Quantity Field */}
        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={[styles.input, errors.quantity && styles.inputError]}
          value={formData.quantity}
          onChangeText={(text) => setFormData({ ...formData, quantity: text })}
          placeholder="Enter quantity"
          keyboardType="numeric"
        />
        {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}

        {/* Publisher Field */}
        <Text style={styles.label}>Publisher</Text>
        <TextInput
          style={styles.input}
          value={formData.publisher}
          onChangeText={(text) => setFormData({ ...formData, publisher: text })}
          placeholder="Enter publisher name (optional)"
        />

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Guide</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3333',
  },
  errorText: {
    color: '#ff3333',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
```

#### **Step 4: Create EditGuideScreen.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { guideAPI } from '../services/api';

export default function EditGuideScreen({ route, navigation }: any) {
  const { guideId } = route.params;
  
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    subject: '',
    price: '',
    quantity: '',
    publisher: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadGuide();
  }, []);

  const loadGuide = async () => {
    try {
      const guide = await guideAPI.getGuideById(guideId);
      setFormData({
        name: guide.name,
        class: guide.class,
        subject: guide.subject,
        price: guide.price.toString(),
        quantity: guide.quantity.toString(),
        publisher: guide.publisher || '',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load guide details');
      navigation.goBack();
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!formData.class) {
      newErrors.class = 'Class is required';
    }
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.price || Number(formData.price) < 1) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.quantity || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await guideAPI.updateGuide(guideId, {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      });
      
      Alert.alert('Success', 'Guide updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update guide');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading guide...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Use same form structure as AddGuideScreen */}
        {/* Copy all form fields from AddGuideScreen.tsx */}
        
        {/* Name Field */}
        <Text style={styles.label}>Guide Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter guide name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* ... Copy all other fields from AddGuideScreen ... */}

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Update Guide</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Copy styles from AddGuideScreen.tsx, then add:
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  // ... rest of styles from AddGuideScreen
});
```

---

### **Acceptance Criteria**

#### **Functional Requirements**
- [ ] User can navigate from Stock screen to Add Guide screen
- [ ] User can fill out the form and create a new guide
- [ ] Form validation prevents invalid data submission
- [ ] Success message shows after successful creation
- [ ] User returns to Stock screen after adding guide
- [ ] Newly added guide appears in the Stock list
- [ ] User can tap edit button on any guide to open Edit screen
- [ ] Edit screen loads existing guide data correctly
- [ ] User can modify guide details and save changes
- [ ] Updated guide data reflects in the Stock list

#### **UI/UX Requirements**
- [ ] All form fields have clear labels
- [ ] Required fields marked with asterisk (*)
- [ ] Error messages display below respective fields
- [ ] Save button disabled during API call
- [ ] Loading spinner shows during submission
- [ ] Back button works correctly
- [ ] Keyboard dismisses when scrolling form

#### **Technical Requirements**
- [ ] TypeScript types are properly defined
- [ ] API calls use existing `guideAPI` from services
- [ ] Error handling displays user-friendly messages
- [ ] Navigation parameters properly typed
- [ ] Code follows existing project patterns
- [ ] No console errors or warnings

---

### **Testing Steps**

1. **Add Guide Flow**:
   - Open app → Navigate to Stock screen
   - Tap "Add Guide" button
   - Fill form with valid data → Tap "Save Guide"
   - Verify success message and return to Stock screen
   - Confirm new guide appears in list

2. **Validation Testing**:
   - Leave required fields empty → Verify error messages
   - Enter negative price/quantity → Verify error messages
   - Enter name with < 3 characters → Verify error message

3. **Edit Guide Flow**:
   - Tap edit button on any guide
   - Verify form pre-fills with correct data
   - Modify some fields → Tap "Update Guide"
   - Verify success message and return to Stock screen
   - Confirm changes reflected in list

4. **Error Handling**:
   - Test with backend offline → Verify error alert displays
   - Test with invalid guideId → Verify graceful failure

---

### **Resources**

- **Existing Code Reference**: `frontend/src/screens/LoginScreen.tsx` (for form patterns)
- **API Documentation**: Check `frontend/src/services/api.ts` for `guideAPI` methods
- **Navigation**: See `frontend/src/navigation/AppNavigator.tsx` for navigation patterns
- **Backend Endpoint**: `POST /api/guides` and `PUT /api/guides/:id` (already implemented)

---

### **Questions or Blockers?**

If you encounter issues:
1. Check backend is running on `http://localhost:5000`
2. Verify API endpoints in `backend/src/routes/guideRoutes.ts`
3. Test API calls directly with Postman first
4. Check [QUICK_START.md](QUICK_START.md) for common issues

---
---

## 🎯 TASK 2: Complete Billing Screen with Invoice Generation

### **Overview**
Transform the placeholder Billing screen into a fully functional invoice creation interface. Users should be able to select a client (school), add multiple guide items with quantities, see real-time total calculation, and generate invoices.

### **Priority**: 🔴 Critical (Phase 1 MVP)

### **Estimated Time**: 8-12 hours

---

### **Technical Requirements**

#### **Files to Modify**
- `frontend/src/screens/BillingScreen.tsx` - Complete implementation
- `backend/src/controllers/invoiceController.ts` - Add stock deduction logic

#### **Files to Reference**
- `frontend/src/services/api.ts` - API methods already exist
- `backend/src/models/Invoice.ts` - Invoice schema
- `backend/src/models/Guide.ts` - Guide schema

---

### **Feature Specifications**

#### **Screen Components**

**1. Client Selector**
```typescript
interface ClientSelection {
  clientId: string;
  clientName: string;
  schoolName: string;
  contactPerson: string;
}
```
- Searchable dropdown/modal to select client
- Display: School name + Contact person
- Load clients from API

**2. Item Picker**
```typescript
interface InvoiceItem {
  guideId: string;
  name: string;        // Guide name
  class: string;       // Class
  subject: string;     // Subject
  price: number;       // Unit price
  quantity: number;    // Selected quantity
  subtotal: number;    // price * quantity
}
```
- Searchable list of available guides
- For each guide: Show name, class, subject, price, available stock
- User enters quantity (validate against available stock)
- Add button to add item to invoice
- Show low stock warning if quantity < 10

**3. Invoice Summary**
```typescript
interface InvoiceSummary {
  items: InvoiceItem[];
  subtotal: number;
  tax: number;          // Optional: 0% for now
  discount: number;     // Optional: 0 for now
  totalAmount: number;
}
```
- List of selected items with quantities
- Remove item button for each row
- Display running total
- Generate Invoice button

---

### **API Integration**

#### **Frontend API Calls**
```typescript
// Load clients for dropdown
const clients = await clientAPI.getAll();

// Load guides for item picker
const guides = await guideAPI.getAll();

// Create invoice
const invoice = await invoiceAPI.create({
  clientId: selectedClient._id,
  items: selectedItems.map(item => ({
    guideId: item.guideId,
    quantity: item.quantity,
    price: item.price,
  })),
  totalAmount: calculatedTotal,
});
```

#### **Backend Logic to Implement**
In `backend/src/controllers/invoiceController.ts`, update `createInvoice` function:

```typescript
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { clientId, items, totalAmount } = req.body;

    // Validation
    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client and items are required',
      });
    }

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Validate stock availability and calculate total
    let calculatedTotal = 0;
    for (const item of items) {
      const guide = await Guide.findById(item.guideId);
      
      if (!guide) {
        return res.status(404).json({
          success: false,
          message: `Guide not found: ${item.guideId}`,
        });
      }

      if (guide.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${guide.name}. Available: ${guide.quantity}, Requested: ${item.quantity}`,
        });
      }

      calculatedTotal += guide.price * item.quantity;
    }

    // Generate invoice number
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNo.split('-')[1]) : 0;
    const invoiceNo = `INV-${String(lastNumber + 1).padStart(5, '0')}`;

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNo,
      clientId,
      items: items.map((item: any) => ({
        guideId: item.guideId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: calculatedTotal,
      status: 'PENDING',
    });

    // Deduct stock quantities
    for (const item of items) {
      await Guide.findByIdAndUpdate(
        item.guideId,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Populate invoice with guide and client details
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('clientId')
      .populate('items.guideId');

    res.status(201).json({
      success: true,
      data: populatedInvoice,
      message: 'Invoice created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating invoice',
    });
  }
};
```

---

### **UI/UX Requirements**

#### **Screen Layout**
```
┌─────────────────────────────────┐
│  Billing Screen                  │
├─────────────────────────────────┤
│                                  │
│  Select Client *                 │
│  [Dropdown: Select School...]    │
│                                  │
│  ──────────────────────────      │
│                                  │
│  Add Items to Invoice            │
│  [Button: + Add Item]            │
│                                  │
│  Selected Items:                 │
│  ┌────────────────────────────┐ │
│  │ Guide Name | Qty | ₹Price  │ │
│  │ Class 10 Math | 5 | ₹500   │ │
│  │                      [Remove]│ │
│  └────────────────────────────┘ │
│                                  │
│  Subtotal: ₹500                  │
│  Tax (0%): ₹0                    │
│  ──────────────────────────      │
│  Total: ₹500                     │
│                                  │
│  [Generate Invoice Button]       │
│                                  │
└─────────────────────────────────┘
```

#### **Client Selector Modal**
- Modal overlay with search bar
- List of clients showing: School name, Contact person
- Filter clients as user types
- Tap to select

#### **Item Picker Modal**
- Modal overlay with search bar
- List showing: Guide name, Class, Subject, Price, Available stock
- Quantity input field
- Stock warning if low
- "Add to Invoice" button

---

### **Implementation Guide**

#### **Step 1: Update BillingScreen.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { clientAPI, guideAPI, invoiceAPI } from '../services/api';

interface Client {
  _id: string;
  schoolName: string;
  contactPerson: string;
  phone: string;
}

interface Guide {
  _id: string;
  name: string;
  class: string;
  subject: string;
  price: number;
  quantity: number;
  publisher?: string;
}

interface InvoiceItem {
  guideId: string;
  name: string;
  class: string;
  subject: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function BillingScreen({ navigation }: any) {
  const [clients, setClients] = useState<Client[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  
  const [showClientModal, setShowClientModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [itemQuantity, setItemQuantity] = useState<{ [key: string]: string }>({});
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
    loadGuides();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientAPI.getAll();
      setClients(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const loadGuides = async () => {
    try {
      const data = await guideAPI.getAll();
      setGuides(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load guides');
    }
  };

  const filteredClients = clients.filter(client =>
    client.schoolName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredGuides = guides.filter(guide =>
    guide.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    guide.class.toLowerCase().includes(itemSearch.toLowerCase()) ||
    guide.subject.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(false);
    setClientSearch('');
  };

  const handleAddItem = (guide: Guide) => {
    const qty = parseInt(itemQuantity[guide._id] || '1');
    
    if (qty <= 0) {
      Alert.alert('Invalid Quantity', 'Quantity must be greater than 0');
      return;
    }
    
    if (qty > guide.quantity) {
      Alert.alert(
        'Insufficient Stock',
        `Only ${guide.quantity} units available for ${guide.name}`
      );
      return;
    }

    // Check if item already added
    const existingIndex = invoiceItems.findIndex(item => item.guideId === guide._id);
    
    if (existingIndex >= 0) {
      // Update existing item
      const updated = [...invoiceItems];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].subtotal = updated[existingIndex].price * updated[existingIndex].quantity;
      setInvoiceItems(updated);
    } else {
      // Add new item
      const newItem: InvoiceItem = {
        guideId: guide._id,
        name: guide.name,
        class: guide.class,
        subject: guide.subject,
        price: guide.price,
        quantity: qty,
        subtotal: guide.price * qty,
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }

    setItemQuantity({ ...itemQuantity, [guide._id]: '1' });
    Alert.alert('Success', `Added ${guide.name} to invoice`);
  };

  const handleRemoveItem = (guideId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.guideId !== guideId));
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedClient) {
      Alert.alert('Error', 'Please select a client');
      return;
    }

    if (invoiceItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    setSubmitting(true);
    try {
      const invoiceData = {
        clientId: selectedClient._id,
        items: invoiceItems.map(item => ({
          guideId: item.guideId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
      };

      const invoice = await invoiceAPI.create(invoiceData);
      
      Alert.alert(
        'Success',
        `Invoice ${invoice.invoiceNo} generated successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedClient(null);
              setInvoiceItems([]);
              // Optionally navigate to invoice list
              // navigation.navigate('Invoices');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to generate invoice'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Client Selection */}
        <Text style={styles.sectionTitle}>Select Client *</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowClientModal(true)}
        >
          <Text style={styles.selectorText}>
            {selectedClient
              ? `${selectedClient.schoolName} - ${selectedClient.contactPerson}`
              : 'Select a school...'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Add Item Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowItemModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>

        {/* Selected Items List */}
        {invoiceItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Selected Items</Text>
            {invoiceItems.map((item) => (
              <View key={item.guideId} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.class} - {item.subject}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {item.quantity} × ₹{item.price} = ₹{item.subtotal}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.guideId)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Invoice Summary */}
        {invoiceItems.length > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>₹{calculateTotal()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (0%):</Text>
              <Text style={styles.summaryValue}>₹0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Generate Invoice Button */}
      <TouchableOpacity
        style={[
          styles.generateButton,
          (!selectedClient || invoiceItems.length === 0 || submitting) &&
            styles.disabledButton,
        ]}
        onPress={handleGenerateInvoice}
        disabled={!selectedClient || invoiceItems.length === 0 || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Invoice</Text>
        )}
      </TouchableOpacity>

      {/* Client Selection Modal */}
      <Modal
        visible={showClientModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Client</Text>
              <TouchableOpacity onPress={() => setShowClientModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search schools or contact person..."
              value={clientSearch}
              onChangeText={setClientSearch}
            />

            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => handleSelectClient(item)}
                >
                  <Text style={styles.listItemTitle}>{item.schoolName}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {item.contactPerson} • {item.phone}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No clients found</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Item Selection Modal */}
      <Modal
        visible={showItemModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowItemModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Item</Text>
              <TouchableOpacity onPress={() => setShowItemModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search guides..."
              value={itemSearch}
              onChangeText={setItemSearch}
            />

            <FlatList
              data={filteredGuides}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.guideItem}>
                  <View style={styles.guideInfo}>
                    <Text style={styles.guideTitle}>{item.name}</Text>
                    <Text style={styles.guideSubtitle}>
                      {item.class} - {item.subject}
                    </Text>
                    <Text style={styles.guidePrice}>
                      ₹{item.price} • Stock: {item.quantity}
                      {item.quantity < 10 && (
                        <Text style={styles.lowStock}> (Low Stock!)</Text>
                      )}
                    </Text>
                  </View>
                  <View style={styles.guideActions}>
                    <TextInput
                      style={styles.quantityInput}
                      keyboardType="numeric"
                      placeholder="Qty"
                      value={itemQuantity[item._id] || '1'}
                      onChangeText={(text) =>
                        setItemQuantity({ ...itemQuantity, [item._id]: text })
                      }
                    />
                    <TouchableOpacity
                      style={styles.addItemButton}
                      onPress={() => handleAddItem(item)}
                    >
                      <Text style={styles.addItemButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No guides found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  selector: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#ff3333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9e9e9e',
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  guideItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  guideSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  guidePrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  lowStock: {
    color: '#ff9800',
    fontWeight: '600',
  },
  guideActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    width: 60,
    padding: 8,
    textAlign: 'center',
  },
  addItemButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
});
```

#### **Step 2: Update Backend Invoice Controller**

Replace the TODO placeholder in `backend/src/controllers/invoiceController.ts` with the implementation provided in the "Backend Logic to Implement" section above.

---

### **Acceptance Criteria**

#### **Functional Requirements**
- [ ] User can open client selector modal
- [ ] User can search and select a client
- [ ] Selected client displays in the main screen
- [ ] User can open item picker modal
- [ ] User can search guides by name/class/subject
- [ ] User can enter quantity for each guide
- [ ] System validates quantity against available stock
- [ ] User can add multiple items to invoice
- [ ] Duplicate items increase quantity instead of creating new row
- [ ] User can remove items from invoice
- [ ] Running total updates automatically
- [ ] Generate Invoice button disabled until client + items added
- [ ] Invoice creation deducts stock from database
- [ ] Success message displays with invoice number
- [ ] Form resets after successful invoice generation

#### **Validation Requirements**
- [ ] Cannot create invoice without client
- [ ] Cannot create invoice without items
- [ ] Quantity must be > 0
- [ ] Quantity cannot exceed available stock
- [ ] Stock deduction is atomic (all or nothing)
- [ ] Backend validates stock availability again before creation

#### **UI/UX Requirements**
- [ ] Low stock warning (< 10 units) shows in item picker
- [ ] Loading spinner during invoice generation
- [ ] Clear error messages for all failure cases
- [ ] Modals have smooth slide-up animation
- [ ] Search is case-insensitive and responsive
- [ ] Generate button changes to loading state when submitting

---

### **Testing Steps**

1. **Client Selection**:
   - Tap "Select Client" → Modal opens
   - Type in search → List filters correctly
   - Select a client → Modal closes, client name displays

2. **Add Items**:
   - Tap "+ Add Item" → Modal opens
   - Search for a guide → Filtered correctly
   - Enter quantity → Tap "Add"
   - Verify item appears in list with correct subtotal

3. **Stock Validation**:
   - Try adding quantity > available stock
   - Verify error alert displays
   - Add valid quantity → Should succeed

4. **Remove Items**:
   - Tap "Remove" on any item
   - Verify item removed and total recalculates

5. **Generate Invoice**:
   - Select client + add items
   - Tap "Generate Invoice"
   - Verify success alert with invoice number
   - Check backend: Stock deducted correctly
   - Verify form resets after success

6. **Error Cases**:
   - Try generating without client → Error
   - Try generating without items → Error
   - Stop backend → Verify error handling

---

### **Resources**

- **API Endpoints**: Check `frontend/src/services/api.ts`
- **Backend Models**: `backend/src/models/Invoice.ts`, `Guide.ts`, `Client.ts`
- **Backend Route**: `POST /api/invoices` in `backend/src/routes/invoiceRoutes.ts`
- **Reference Screen**: `frontend/src/screens/LoginScreen.tsx` for modal patterns

---

### **Questions or Blockers?**

If you encounter issues:
1. Test API endpoints with Postman first
2. Check MongoDB for actual data (clients and guides must exist)
3. Verify backend validation messages are user-friendly
4. Review [QUICK_START.md](QUICK_START.md) for common setup issues

---

## 📝 Submission Checklist

When you complete a task, ensure:
- [ ] Code compiles without errors
- [ ] All TypeScript types properly defined
- [ ] API calls handle errors gracefully
- [ ] Loading states implemented
- [ ] User-friendly error messages
- [ ] Navigation works correctly
- [ ] All acceptance criteria met
- [ ] Manual testing completed
- [ ] No console errors/warnings
- [ ] Code follows project patterns

---

## 🤝 Need Help?

- **Setup Issues**: See [QUICK_START.md](QUICK_START.md)
- **Architecture Questions**: Check individual README files in `backend/` and `frontend/`
- **API Reference**: Review `frontend/src/services/api.ts` and backend route files
- **More Tasks**: See [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) for additional features
- **Simpler Tasks**: Check [SIMPLE_FRONTEND_TASKS.md](SIMPLE_FRONTEND_TASKS.md) for quick 1-3 hour improvements

---

**Good luck! 🚀**
