'use client';
// app/admin/initDb.jsx
// This is a simple component you can use to initialize your database with test products
import { useState } from 'react';
import { collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { fireApp } from '@important/firebase';
import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function InitializeDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [existingProducts, setExistingProducts] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);

  // Test data for products
  // Test data for the 'products' collection in Firebase Firestore

const productsData = [
    {
      id: "pvc-standard-001", // You can let Firestore auto-generate IDs instead
      name: "Premium PVC Card",
      description: "Our high-quality recycled PVC card with NFC technology for seamless digital profile sharing.",
      price: 45,
      image: "https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/metal-card-image.svg?alt=media&token=837e5ec3-7091-4600-8557-71f2c0205d81",
      sortOrder: 1,
      type: "pvc-standard",
      features: [
        "Durable recycled PVC material",
        "Built-in NFC chip",
        "QR code backup",
        "Full color printing on both sides",
        "Waterproof and scratch-resistant"
      ],
      inStock: true,
      createdAt: new Date(), // This will be converted to a Firestore timestamp
      updatedAt: new Date()
    },
    {
      id: "wood-eco-001",
      name: "Eco Wood Card",
      description: "Sustainable wooden card made from upcycled materials with embedded NFC technology.",
      price: 55,
      image: "https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/wood-card-image.svg?alt=media&token=fa8628ef-3452-43a9-9d1e-fbc1312dfe22",
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
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "metal-premium-001",
      name: "Premium Metal Card",
      description: "Stainless steel card with laser engraving and NFC technology for a truly premium networking experience.",
      price: 85,
      image: "https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/metal-card-image.svg?alt=media&token=837e5ec3-7091-4600-8557-71f2c0205d81",
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
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "pvc-gold-001",
      name: "Gold Edition PVC Card",
      description: "Special edition gold-themed PVC card with NFC technology and premium design elements.",
      price: 60,
      image: "https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/gold-card-image.svg?alt=media&token=a138539f-e2e4-4176-b218-ad83f99be353",
      sortOrder: 4,
      type: "pvc-standard",
      features: [
        "Premium recycled PVC material",
        "Gold-accented design",
        "Built-in NFC chip",
        "QR code backup",
        "Full color printing on both sides",
        "Waterproof and scratch-resistant"
      ],
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "wood-walnut-001",
      name: "Walnut Wood Card",
      description: "Premium walnut wood card with elegant grain patterns and embedded NFC technology.",
      price: 65,
      image: "https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/walnut-card-image.svg?alt=media&token=071d41c7-2744-43ef-a844-9611a555c858",
      sortOrder: 5,
      type: "wood-eco",
      features: [
        "Premium walnut wood",
        "Natural wood grain patterns",
        "Built-in NFC chip",
        "QR code backup",
        "Laser engraving on both sides",
        "Water-resistant finish"
      ],
      inStock: false, // Set one product as out of stock for testing
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const checkExistingProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const productsRef = collection(fireApp, 'products');
      const querySnapshot = await getDocs(query(productsRef));
      
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setExistingProducts(products);
      setHasChecked(true);
    } catch (error) {
      console.error("Error checking products:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeProducts = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const productsRef = collection(fireApp, 'products');
      const addedProducts = [];
      
      for (const product of productsData) {
        const docRef = await addDoc(productsRef, {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        addedProducts.push({
          id: docRef.id,
          ...product
        });
      }
      
      setResult({
        message: `Successfully added ${addedProducts.length} products to the database`,
        products: addedProducts
      });
      
      // Refresh the list of products
      await checkExistingProducts();
    } catch (error) {
      console.error("Error initializing products:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Initialize Database with Test Products</h1>
      
      {!hasChecked ? (
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Click the button below to check if there are any existing products in your database.
          </p>
          <button 
            onClick={checkExistingProducts} 
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <FiLoader className="inline animate-spin mr-2" />
                Checking...
              </>
            ) : (
              'Check Existing Products'
            )}
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Existing Products</h2>
          {existingProducts.length > 0 ? (
            <div>
              <p className="text-green-600 mb-3">
                <FiCheckCircle className="inline mr-2" />
                Found {existingProducts.length} products in the database
              </p>
              <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto mb-4">
                <ul className="divide-y divide-gray-200">
                  {existingProducts.map(product => (
                    <li key={product.id} className="py-2">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">ID: {product.id}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-gray-600 mb-4">
                {existingProducts.length > 0 
                  ? "You already have products in your database. You can still add more test products if needed."
                  : "Your database is empty. You can initialize it with test products."}
              </p>
            </div>
          ) : (
            <p className="text-amber-600 mb-4">
              <FiAlertCircle className="inline mr-2" />
              No products found in the database. You should initialize the test data.
            </p>
          )}
          
          <button 
            onClick={initializeProducts} 
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {isLoading ? (
              <>
                <FiLoader className="inline animate-spin mr-2" />
                Initializing...
              </>
            ) : (
              'Initialize Test Products'
            )}
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
          <h3 className="font-semibold">{result.message}</h3>
          <div className="mt-2">
            <p className="font-medium">Added Products:</p>
            <ul className="mt-1 list-disc list-inside">
              {result.products.map(product => (
                <li key={product.id}>
                  {product.name} (ID: {product.id})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        <p><strong>Note:</strong> This page is for development purposes only. Make sure to remove or secure it before deploying to production.</p>
      </div>
    </div>
  );
}