// @refresh reset
// ============================================
// RateContext — Global gold & silver rates
// Refreshes every 15 seconds from /api/gold-rates
// ============================================
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { fetchLiveGoldRates, getStoredSilverRates } from '../services/goldRateService';

const RateContext = createContext(null);

// Refresh every 15 seconds — the serverless function is uncached (no-store)
// so this produces a real provider call each time (subject to GoldAPI plan limits).
const RATE_REFRESH_INTERVAL = 15 * 1000;

export function useRates() {
    return useContext(RateContext);
}

export function RateProvider({ children }) {
    const [goldRates, setGoldRates] = useState(null);
    const [silverRates, setSilverRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rateError, setRateError] = useState(false);
    const activeRef = useRef(true);

    useEffect(() => {
        activeRef.current = true;

        async function refreshRates() {
            try {
                const [gold, silver] = await Promise.all([
                    fetchLiveGoldRates(),
                    getStoredSilverRates()
                ]);

                if (!activeRef.current) return;

                setGoldRates(gold);
                setSilverRates(silver);
                // Mark error only when rates are genuinely unavailable
                setRateError(gold?.unavailable === true);
            } catch (error) {
                console.error('[RateContext] Error refreshing rates:', error);
                if (activeRef.current) setRateError(true);
            } finally {
                if (activeRef.current) setLoading(false);
            }
        }

        // Initial fetch
        refreshRates();

        // Refresh every 15 seconds
        const interval = setInterval(refreshRates, RATE_REFRESH_INTERVAL);

        return () => {
            activeRef.current = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <RateContext.Provider value={{ goldRates, silverRates, loading, rateError }}>
            {children}
        </RateContext.Provider>
    );
}
