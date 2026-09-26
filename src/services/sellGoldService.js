// ============================================
// Sell Gold Service - HUID Sell Old Gold
// ============================================
import { ref, push, set, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';

const SELL_REQUESTS_REF = 'sellRequests';

/**
 * Create a new sell gold request
 */
export async function createSellRequest(requestData) {
    try {
        const sellRef = ref(database, SELL_REQUESTS_REF);
        const newRequestRef = push(sellRef);
        const request = {
            ...requestData,
            id: newRequestRef.key,
            status: 'Pending',
            adminMessage: '',
            createdAt: Date.now()
        };
        await set(newRequestRef, request);
        return request;
    } catch (error) {
        console.error('Error creating sell request:', error);
        throw error;
    }
}

/**
 * Get all sell requests (admin)
 */
export async function getAllSellRequests() {
    try {
        const sellRef = ref(database, SELL_REQUESTS_REF);
        const snapshot = await get(sellRef);
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        }
        return [];
    } catch (error) {
        console.error('Error fetching sell requests:', error);
        throw error;
    }
}

/**
 * Get sell requests for a specific user
 */
export async function getUserSellRequests(userId) {
    try {
        const sellRef = ref(database, SELL_REQUESTS_REF);
        const snapshot = await get(sellRef);
        if (snapshot.exists()) {
            const all = Object.values(snapshot.val());
            return all
                .filter(r => r.userId === userId)
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }
        return [];
    } catch (error) {
        console.error('Error fetching user sell requests:', error);
        return [];
    }
}

/**
 * Admin: Update sell request status and message
 */
export async function updateSellRequestStatus(requestId, status, adminMessage) {
    try {
        const reqRef = ref(database, `${SELL_REQUESTS_REF}/${requestId}`);
        await update(reqRef, {
            status,
            adminMessage: adminMessage || '',
            updatedAt: Date.now()
        });
    } catch (error) {
        console.error('Error updating sell request:', error);
        throw error;
    }
}

/**
 * Calculate sell value for old gold
 */
export function calculateSellValue(goldRate, weightInGrams) {
    return Math.round(goldRate * weightInGrams);
}
