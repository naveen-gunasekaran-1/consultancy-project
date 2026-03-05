# Simple Frontend Tasks for Teammates

This document contains easy frontend tasks perfect for beginners or quick wins. Each task takes 1-3 hours and helps improve the user experience.

---

## 🎯 TASK 1: Add Icons to Bottom Tab Navigation

### **Overview**
Add visual icons to the bottom navigation tabs to improve user experience and make navigation more intuitive.

### **Priority**: ⭐ Easy Win (Visual Improvement)

### **Estimated Time**: 1-2 hours

---

### **What You'll Do**
Replace text-only tab navigation with icons using Expo's `@expo/vector-icons` (already installed).

### **Files to Modify**
- `frontend/src/navigation/AppNavigator.tsx`

---

### **Icon Choices**

```typescript
Dashboard  → Ionicons: "stats-chart"
Stock      → Ionicons: "cube"
Billing    → Ionicons: "receipt"
Payment    → Ionicons: "cash"
Worker     → Ionicons: "people"
Client     → Ionicons: "business"
Reports    → Ionicons: "document-text"
```

---

### **Implementation**

#### **Step 1: Import Icons**
At the top of `frontend/src/navigation/AppNavigator.tsx`, add:

```typescript
import { Ionicons } from '@expo/vector-icons';
```

#### **Step 2: Add screenOptions to BottomTabNavigator**

Find the `<Tab.Navigator>` component and update it:

```typescript
<Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName: keyof typeof Ionicons.glyphMap;

      switch (route.name) {
        case 'Dashboard':
          iconName = 'stats-chart';
          break;
        case 'Stock':
          iconName = 'cube';
          break;
        case 'Billing':
          iconName = 'receipt';
          break;
        case 'Payment':
          iconName = 'cash';
          break;
        case 'Worker':
          iconName = 'people';
          break;
        case 'Client':
          iconName = 'business';
          break;
        case 'Reports':
          iconName = 'document-text';
          break;
        default:
          iconName = 'help-circle';
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#2196F3',
    tabBarInactiveTintColor: '#666',
    headerShown: false,
  })}
>
  {/* Existing Tab.Screen components */}
</Tab.Navigator>
```

---

### **Acceptance Criteria**

- [ ] All navigation tabs show appropriate icons
- [ ] Icons change color when tab is active (blue)
- [ ] Icons are gray when inactive
- [ ] Tab labels still display below icons
- [ ] No TypeScript errors
- [ ] Icons render on both iOS and Android

---

### **Testing**

1. Run the app: `npm start`
2. Navigate to each tab
3. Verify icon displays correctly
4. Check active/inactive color changes
5. Test on different screen sizes

---

### **Before/After**

**Before:**
```
[Dashboard] [Stock] [Billing] [Payment]
```

**After:**
```
[📊] [📦] [🧾] [💰]
Dashboard  Stock  Billing  Payment
```

---

## 🎯 TASK 2: Add Pull-to-Refresh on Stock Screen

### **Overview**
Add pull-to-refresh functionality so users can reload the stock list by pulling down on the screen.

### **Priority**: ⚡ Quick Enhancement

### **Estimated Time**: 1 hour

---

### **What You'll Do**
Replace `FlatList` with `RefreshControl` to enable pull-to-refresh gesture.

### **Files to Modify**
- `frontend/src/screens/StockScreen.tsx`

---

### **Implementation**

#### **Step 1: Import RefreshControl**
Add to imports at the top:

```typescript
import { RefreshControl } from 'react-native';
```

#### **Step 2: Add Refresh State**
Inside the `StockScreen` component, add state:

```typescript
const [refreshing, setRefreshing] = useState(false);
```

#### **Step 3: Create Refresh Handler**
Add this function:

```typescript
const onRefresh = async () => {
  setRefreshing(true);
  try {
    const data = await guideAPI.getAll();
    setGuides(data);
  } catch (error) {
    Alert.alert('Error', 'Failed to refresh stock list');
  } finally {
    setRefreshing(false);
  }
};
```

#### **Step 4: Add RefreshControl to FlatList**
Find the `<FlatList>` and add the `refreshControl` prop:

```typescript
<FlatList
  data={guides}
  keyExtractor={(item) => item._id}
  renderItem={renderGuideItem}
  contentContainerStyle={styles.list}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#2196F3']}
      tintColor="#2196F3"
    />
  }
/>
```

---

### **Acceptance Criteria**

- [ ] User can pull down on the list to refresh
- [ ] Loading spinner appears during refresh
- [ ] List updates with latest data after refresh
- [ ] Works smoothly on both iOS and Android
- [ ] Error handling if API fails

---

### **Testing**

1. Open Stock screen
2. Pull down on the list
3. Verify spinner appears
4. Check list reloads with fresh data
5. Test error case (backend offline)

---

## 🎯 TASK 3: Create a Confirmation Dialog Component

### **Overview**
Build a reusable confirmation dialog component for actions like delete, logout, etc.

### **Priority**: 🔧 Reusable Component

### **Estimated Time**: 2 hours

---

### **What You'll Do**
Create a reusable `ConfirmDialog` component that can be used across multiple screens.

### **Files to Create**
- `frontend/src/components/ConfirmDialog.tsx`

### **Files to Modify**
- `frontend/src/screens/StockScreen.tsx` - Use for delete confirmation

---

### **Implementation**

#### **Step 1: Create Component**

Create new file: `frontend/src/components/ConfirmDialog.tsx`

```typescript
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '#ff3333',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

#### **Step 2: Use in StockScreen**

In `frontend/src/screens/StockScreen.tsx`:

**Add import:**
```typescript
import ConfirmDialog from '../components/ConfirmDialog';
```

**Add state:**
```typescript
const [deleteDialog, setDeleteDialog] = useState({
  visible: false,
  guideId: '',
  guideName: '',
});
```

**Update delete button handler:**
```typescript
const handleDeletePress = (guide: any) => {
  setDeleteDialog({
    visible: true,
    guideId: guide._id,
    guideName: guide.name,
  });
};
```

**Add confirm delete function:**
```typescript
const handleConfirmDelete = async () => {
  try {
    await guideAPI.deleteGuide(deleteDialog.guideId);
    setGuides(guides.filter((g) => g._id !== deleteDialog.guideId));
    Alert.alert('Success', 'Guide deleted successfully');
  } catch (error) {
    Alert.alert('Error', 'Failed to delete guide');
  } finally {
    setDeleteDialog({ visible: false, guideId: '', guideName: '' });
  }
};
```

**Add dialog component before closing View tag:**
```typescript
<ConfirmDialog
  visible={deleteDialog.visible}
  title="Delete Guide"
  message={`Are you sure you want to delete "${deleteDialog.guideName}"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  confirmColor="#ff3333"
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteDialog({ visible: false, guideId: '', guideName: '' })}
/>
```

**Update delete button in renderGuideItem:**
```typescript
<TouchableOpacity 
  onPress={() => handleDeletePress(item)}
  style={styles.deleteButton}
>
  <Text style={styles.deleteButtonText}>Delete</Text>
</TouchableOpacity>
```

---

### **Acceptance Criteria**

- [ ] ConfirmDialog component created and working
- [ ] Dialog shows when delete button pressed
- [ ] Dialog displays guide name in message
- [ ] Cancel button closes dialog without action
- [ ] Confirm button deletes the guide
- [ ] Dialog has smooth fade animation
- [ ] Component is reusable for other screens
- [ ] Works on both iOS and Android

---

### **Testing**

1. Open Stock screen
2. Tap delete on any guide
3. Verify dialog appears with guide name
4. Tap "Cancel" → Dialog closes, guide not deleted
5. Tap delete again → Tap "Confirm" → Guide deleted
6. Verify success message appears

---

### **Bonus**: Use this component for other delete actions (Workers, Clients, etc.)

---

## 🎯 TASK 4: Add Search Functionality to Stock Screen

### **Overview**
Add a search bar to filter guides by name, class, or subject in real-time.

### **Priority**: ✨ User Experience

### **Estimated Time**: 2-3 hours

---

### **What You'll Do**
Add a search input that filters the stock list as the user types.

### **Files to Modify**
- `frontend/src/screens/StockScreen.tsx`

---

### **Implementation**

#### **Step 1: Add Search State**
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

#### **Step 2: Create Filter Function**
```typescript
const filteredGuides = guides.filter((guide) => {
  const query = searchQuery.toLowerCase();
  return (
    guide.name.toLowerCase().includes(query) ||
    guide.class.toLowerCase().includes(query) ||
    guide.subject.toLowerCase().includes(query)
  );
});
```

#### **Step 3: Add Search Bar UI**
Add this before the FlatList:

```typescript
<View style={styles.searchContainer}>
  <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
  <TextInput
    style={styles.searchInput}
    placeholder="Search by name, class, or subject..."
    value={searchQuery}
    onChangeText={setSearchQuery}
    autoCapitalize="none"
    autoCorrect={false}
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity onPress={() => setSearchQuery('')}>
      <Ionicons name="close-circle" size={20} color="#666" />
    </TouchableOpacity>
  )}
</View>
```

#### **Step 4: Update FlatList**
Change `data={guides}` to `data={filteredGuides}`:

```typescript
<FlatList
  data={filteredGuides}
  keyExtractor={(item) => item._id}
  renderItem={renderGuideItem}
  contentContainerStyle={styles.list}
  ListEmptyComponent={
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No guides found' : 'No guides available'}
      </Text>
    </View>
  }
/>
```

#### **Step 5: Add Styles**
```typescript
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 12,
  marginHorizontal: 16,
  marginVertical: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},
searchIcon: {
  marginRight: 8,
},
searchInput: {
  flex: 1,
  fontSize: 16,
  color: '#333',
},
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 40,
},
emptyText: {
  fontSize: 16,
  color: '#999',
  textAlign: 'center',
},
```

#### **Step 6: Import TextInput**
Make sure `TextInput` is imported from 'react-native' at the top.

---

### **Acceptance Criteria**

- [ ] Search bar appears at top of Stock screen
- [ ] Typing filters list in real-time
- [ ] Search works for guide name, class, and subject
- [ ] Search is case-insensitive
- [ ] Clear button (X) appears when typing
- [ ] Clear button resets search and shows all guides
- [ ] Empty state shows when no results found
- [ ] Search icon displayed on left side

---

### **Testing**

1. Open Stock screen
2. Type "math" → Verify only math guides show
3. Type "10th" → Verify only 10th class guides show
4. Type nonsense → Verify "No guides found" message
5. Tap X button → Verify search clears
6. Test with uppercase/lowercase variants

---

### **Bonus Features** (Optional)

- Add debouncing (wait 300ms before filtering)
- Highlight matching text in results
- Add filter chips (by class, by subject)

---

## 🎯 TASK 5: Add Loading Indicators to All Screens

### **Overview**
Add consistent loading states to screens that fetch data from the API.

### **Priority**: 🎯 Polish

### **Estimated Time**: 2 hours

---

### **What You'll Do**
Add loading spinners to screens during initial data fetch.

### **Screens to Update**
- `StockScreen.tsx`
- `PaymentScreen.tsx`
- `WorkerScreen.tsx`
- `ClientScreen.tsx`
- `ReportsScreen.tsx`

---

### **Implementation Pattern**

For each screen, follow this pattern:

#### **Step 1: Add Loading State**
```typescript
const [loading, setLoading] = useState(true);
```

#### **Step 2: Update Load Function**
```typescript
const loadData = async () => {
  setLoading(true);
  try {
    const data = await someAPI.getAll();
    setData(data);
  } catch (error) {
    Alert.alert('Error', 'Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

#### **Step 3: Add Loading UI**
Before the main content, add:

```typescript
if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}
```

#### **Step 4: Add Styles**
```typescript
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
```

---

### **Acceptance Criteria**

- [ ] All 5 screens show loading indicator on first load
- [ ] Loading spinner is centered on screen
- [ ] Loading text appears below spinner
- [ ] Content appears after data loads
- [ ] No flash of empty state before loading
- [ ] Works consistently across all screens

---

### **Testing**

1. Clear app data/cache
2. Open each screen
3. Verify loading spinner appears briefly
4. Check content loads after spinner
5. Test with slow network (throttle in dev tools)

---

## 📝 Submission Checklist

When you complete a task:
- [ ] Code runs without errors
- [ ] No TypeScript warnings
- [ ] Tested on iOS or Android
- [ ] UI looks clean and professional
- [ ] Follows existing code patterns
- [ ] All acceptance criteria met

---

## 🤝 Need Help?

- **Setup Issues**: See [QUICK_START.md](QUICK_START.md)
- **API Questions**: Check `frontend/src/services/api.ts`
- **More Complex Tasks**: See [TEAMMATE_TASKS.md](TEAMMATE_TASKS.md)
- **Project Overview**: See [README.md](README.md)

---

**Good luck! These small improvements make a big difference! ✨**
