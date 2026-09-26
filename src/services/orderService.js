// ============================================
// Order Service - Firebase CRUD for orders
// ============================================
import { ref, push, set, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';

const ORDERS_REF = 'orders';

/**
 * Create a new order in Firebase
 */
export async function createOrder(orderData) {
    try {
        const ordersRef = ref(database, ORDERS_REF);
        const newOrderRef = push(ordersRef);
        const order = {
            ...orderData,
            orderId: newOrderRef.key,
            status: 'Placed',
            trackingId: '',
            createdAt: Date.now()
        };
        await set(newOrderRef, order);
        return order;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders() {
    try {
        const ordersRef = ref(database, ORDERS_REF);
        const snapshot = await get(ordersRef);
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        }
        return [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId) {
    try {
        const allOrders = await getAllOrders();
        return allOrders.filter(order => order.userId === userId);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatus(orderId, status, trackingId = '') {
    try {
        const orderRef = ref(database, `${ORDERS_REF}/${orderId}`);
        await update(orderRef, { status, trackingId, updatedAt: Date.now() });
        return { orderId, status, trackingId };
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId) {
    try {
        const orderRef = ref(database, `${ORDERS_REF}/${orderId}`);
        const snapshot = await get(orderRef);
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
}
