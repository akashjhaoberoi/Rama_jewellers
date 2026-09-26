// ============================================
// Product Service - Firebase CRUD for products
// ============================================
import { ref, push, set, get, update, remove, query, orderByChild } from 'firebase/database';
import { database } from '../firebase';

const PRODUCTS_REF = 'products';
const LEGACY_PRODUCTS_URL = 'https://kgsjewel-98b89-default-rtdb.firebaseio.com/products.json';

async function getLegacyProducts() {
    const response = await fetch(LEGACY_PRODUCTS_URL);
    if (!response.ok) throw new Error(`Legacy products HTTP ${response.status}`);
    const data = await response.json();
    return data ? Object.values(data).map(normalizeProduct) : [];
}

/**
 * Add a new product to Firebase
 */
export async function addProduct(productData) {
    try {
        const productsRef = ref(database, PRODUCTS_REF);
        const newProductRef = push(productsRef);
        const product = {
            ...productData,
            id: newProductRef.key,
            createdAt: Date.now()
        };
        await set(newProductRef, product);
        return product;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

/**
 * Get all products from Firebase
 */
export async function getAllProducts() {
    try {
        const productsRef = ref(database, PRODUCTS_REF);
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).map(normalizeProduct);
        }
        return [];
    } catch (error) {
        console.error('Error fetching products:', error);
        console.warn('Using the legacy product catalog while the new database is unavailable.');
        return getLegacyProducts();
    }
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId) {
    try {
        const productRef = ref(database, `${PRODUCTS_REF}/${productId}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
            return normalizeProduct(snapshot.val());
        }
        return null;
    } catch (error) {
        console.error('Error fetching product:', error);
        const products = await getLegacyProducts();
        return products.find(product => product.id === productId) || null;
    }
}

function normalizeProduct(product) {
    return {
        ...product,
        imageURL: product.imageURL || product.imageUrl || product.image || ''
    };
}

/**
 * Update a product in Firebase
 */
export async function updateProduct(productId, updates) {
    try {
        const productRef = ref(database, `${PRODUCTS_REF}/${productId}`);
        await update(productRef, updates);
        return { id: productId, ...updates };
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

/**
 * Delete a product from Firebase
 */
export async function deleteProduct(productId) {
    try {
        const productRef = ref(database, `${PRODUCTS_REF}/${productId}`);
        await remove(productRef);
        return productId;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category) {
    try {
        const products = await getAllProducts();
        return products.filter(p => p.category === category);
    } catch (error) {
        console.error('Error filtering products:', error);
        throw error;
    }
}
