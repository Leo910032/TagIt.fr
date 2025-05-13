'use client';
///app/components/store$ ls firebase-utils.js 
import { fireApp, appStorage } from "@important/firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateUniqueId } from "@lib/utilities";

// Collection references
const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  CARDS: "cards",
  CART_ITEMS: "cart_items",
  CUSTOMIZATIONS: "customizations"
};

/**
 * Get all products from the database
 */
export const getProducts = async () => {
  try {
    const productsRef = collection(fireApp, COLLECTIONS.PRODUCTS);
    const productsQuery = query(productsRef, orderBy("sortOrder", "asc"));
    const querySnapshot = await getDocs(productsQuery);
    
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (productId) => {
  try {
    const productRef = doc(fireApp, COLLECTIONS.PRODUCTS, productId);
    const docSnap = await getDoc(productRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

/**
 * Add an item to a user's cart
 */
export const addToCart = async (userId, productId, quantity, customization = {}) => {
  try {
    // Check if item already exists in cart
    const cartRef = collection(fireApp, COLLECTIONS.CART_ITEMS);
    const q = query(cartRef, 
      where("userId", "==", userId),
      where("productId", "==", productId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing cart item
      const cartItemDoc = querySnapshot.docs[0];
      await updateDoc(doc(fireApp, COLLECTIONS.CART_ITEMS, cartItemDoc.id), {
        quantity: cartItemDoc.data().quantity + quantity,
        lastUpdated: serverTimestamp()
      });
      return cartItemDoc.id;
    } else {
      // Add new cart item
      const newCartItem = {
        userId,
        productId,
        quantity,
        customization,
        addedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(fireApp, COLLECTIONS.CART_ITEMS), newCartItem);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

/**
 * Get cart items for a user
 */
export const getCartItems = async (userId) => {
  try {
    const cartRef = collection(fireApp, COLLECTIONS.CART_ITEMS);
    const q = query(cartRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const cartItems = [];
    for (const cartItemDoc of querySnapshot.docs) {
      const cartItem = {
        id: cartItemDoc.id,
        ...cartItemDoc.data()
      };
      
      // Get product details
      try {
        const productData = await getProductById(cartItem.productId);
        cartItem.product = productData;
      } catch (error) {
        console.error(`Error fetching product ${cartItem.productId}:`, error);
        cartItem.product = { name: "Product not found", price: 0 };
      }
      
      cartItems.push(cartItem);
    }
    
    return cartItems;
  } catch (error) {
    console.error("Error getting cart items:", error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartItemId) => {
  try {
    await updateDoc(doc(fireApp, COLLECTIONS.CART_ITEMS, cartItemId), {
      isDeleted: true,
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    await updateDoc(doc(fireApp, COLLECTIONS.CART_ITEMS, cartItemId), {
      quantity,
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw error;
  }
};

/**
 * Save a card design customization
 */
export const saveCardCustomization = async (userId, customizationData) => {
  try {
    // Upload any images first
    let processedData = { ...customizationData };
    
    // Handle logo upload if it's a data URL
    if (customizationData.logo && customizationData.logo.startsWith('data:')) {
      const logoFile = await dataURLtoFile(customizationData.logo, `logo-${generateUniqueId()}.png`);
      const logoUrl = await uploadCardImage(logoFile, userId, 'logos');
      processedData.logo = logoUrl;
    }
    
    // Handle design upload if it's a data URL
    if (customizationData.design && customizationData.design.startsWith('data:')) {
      const designFile = await dataURLtoFile(customizationData.design, `design-${generateUniqueId()}.png`);
      const designUrl = await uploadCardImage(designFile, userId, 'designs');
      processedData.design = designUrl;
    }
    
    // Add timestamp and user ID
    processedData.userId = userId;
    processedData.createdAt = serverTimestamp();
    processedData.lastUpdated = serverTimestamp();
    
    const docRef = await addDoc(collection(fireApp, COLLECTIONS.CUSTOMIZATIONS), processedData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving card customization:", error);
    throw error;
  }
};

/**
 * Upload a card image (logo or design)
 */
const uploadCardImage = async (file, userId, folder) => {
  try {
    const fileId = generateUniqueId();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${fileId}.${fileExtension}`;
    
    const storageRef = ref(appStorage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Convert a data URL to a File object
 */
const dataURLtoFile = (dataurl, filename) => {
  return new Promise((resolve) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    const file = new File([u8arr], filename, { type: mime });
    resolve(file);
  });
};

/**
 * Create an order in the database
 */
export const createOrder = async (userId, orderData) => {
  try {
    // Add timestamps and user ID
    const orderWithMeta = {
      ...orderData,
      userId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(fireApp, COLLECTIONS.ORDERS), orderWithMeta);
    
    // Mark cart items as ordered
    if (orderData.cartItems && orderData.cartItems.length > 0) {
      for (const cartItemId of orderData.cartItems) {
        await updateDoc(doc(fireApp, COLLECTIONS.CART_ITEMS, cartItemId), {
          orderId: docRef.id,
          status: 'ordered',
          lastUpdated: serverTimestamp()
        });
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Get orders for a user
 */
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(fireApp, COLLECTIONS.ORDERS);
    const q = query(ordersRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw error;
  }
};

/**
 * Get a user's card customizations
 */
export const getUserCardCustomizations = async (userId) => {
  try {
    const customizationsRef = collection(fireApp, COLLECTIONS.CUSTOMIZATIONS);
    const q = query(customizationsRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const customizations = [];
    querySnapshot.forEach((doc) => {
      customizations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return customizations;
  } catch (error) {
    console.error("Error getting user card customizations:", error);
    throw error;
  }
};

/**
 * Initialize the product database with sample data
 * (You would run this once to populate your database)
 */
export const initializeProductDatabase = async () => {
  try {
    // Check if products already exist
    const productsRef = collection(fireApp, COLLECTIONS.PRODUCTS);
    const querySnapshot = await getDocs(productsRef);
    
    if (!querySnapshot.empty) {
      console.log("Products already exist in database");
      return;
    }
    
    // Sample products
    const products = [
      {
        name: "Premium PVC Card",
        description: "Our high-quality recycled PVC card with NFC technology",
        price: 45,
        image: "https://example.com/images/pvc-card.jpg",
        sortOrder: 1,
        type: "pvc-standard",
        features: [
          "Durable recycled PVC material",
          "Built-in NFC chip",
          "QR code backup",
          "Full color printing on both sides",
          "Waterproof and scratch-resistant"
        ],
        inStock: true
      },
      {
        name: "Eco Wood Card",
        description: "Sustainable wooden card made from upcycled materials",
        price: 55,
        image: "https://example.com/images/wood-card.jpg",
        sortOrder: 2,
        type: "wood-eco",
        features: [
          "Sustainable bamboo or reclaimed wood",
          "Built-in NFC chip",
          "QR code backup",
          "Laser engraving on both sides",
          "Water-resistant finish",
          "Biodegradable materials"
        ],
        inStock: true
      },
      {
        name: "Premium Metal Card",
        description: "Stainless steel card with laser engraving",
        price: 85,
        image: "https://example.com/images/metal-card.jpg",
        sortOrder: 3,
        type: "metal-premium",
        features: [
          "Brushed stainless steel",
          "Built-in NFC chip",
          "QR code backup",
          "Laser engraving on both sides",
          "Waterproof and extremely durable",
          "Premium matte finish"
        ],
        inStock: true
      }
    ];
    
    // Add products to database
    for (const product of products) {
      await addDoc(productsRef, {
        ...product,
        createdAt: serverTimestamp()
      });
    }
    
    console.log("Products added to database successfully");
  } catch (error) {
    console.error("Error initializing product database:", error);
    throw error;
  }
};