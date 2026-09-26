import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchLiveGoldRates, getStoredSilverRates } from '../services/goldRateService';

const RateContext = createContext(null);
const RATE_REFRESH_INTERVAL = 60 * 1000;

export function useRates() {
    return useContext(RateContext);
}

export function RateProvider({ children }) {
    const [goldRates, setGoldRates] = useState(null);
    const [silverRates, setSilverRates] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function refreshRates() {
            try {
                const [gold, silver] = await Promise.all([
                    fetchLiveGoldRates(),
                    getStoredSilverRates()
                ]);
                if (active) {
                    setGoldRates(gold);
                    setSilverRates(silver);
                }
            } catch (error) {
                console.error('Error refreshing rates:', error);
            } finally {
                if (active) setLoading(false);
            }
        }

        refreshRates();
        const interval = setInterval(refreshRates, RATE_REFRESH_INTERVAL);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <RateContext.Provider value={{ goldRates, silverRates, loading }}>
            {children}
        </RateContext.Provider>
    );
}
