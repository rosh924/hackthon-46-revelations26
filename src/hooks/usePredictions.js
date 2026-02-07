import { useState, useEffect, useCallback, useRef } from 'react';
import { predictionService } from '../services/predictionService';
import { useWebSocket } from './useWebSocket';
import toast from 'react-hot-toast';

export const usePredictions = (vendorId = null) => {
    const [predictions, setPredictions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [accuracyMetrics, setAccuracyMetrics] = useState(null);
    const [realTimeUpdates, setRealTimeUpdates] = useState([]);

    const predictionsCache = useRef(new Map());
    const abortController = useRef(null);

    // WebSocket for real-time updates
    const { sendMessage, isConnected } = useWebSocket(
        vendorId ? `/ws/predictions/${vendorId}` : null,
        handleWebSocketMessage,
        handleWebSocketOpen,
        handleWebSocketClose
    );

    function handleWebSocketMessage(data) {
        switch (data.type) {
            case 'PREDICTION_UPDATE':
                handlePredictionUpdate(data);
                break;
            case 'QUEUE_UPDATE':
                handleQueueUpdate(data);
                break;
            case 'VENDOR_STATUS_UPDATE':
                handleVendorStatusUpdate(data);
                break;
            case 'DEMAND_SPIKE_ALERT':
                handleDemandSpikeAlert(data);
                break;
        }
    }

    function handleWebSocketOpen() {
        console.log('Prediction WebSocket connected');

        // Subscribe to prediction updates
        if (vendorId) {
            sendMessage({
                type: 'SUBSCRIBE',
                channel: 'predictions',
                vendorId,
            });
        }
    }

    function handleWebSocketClose() {
        console.log('Prediction WebSocket disconnected');
    }

    // Handle prediction updates from WebSocket
    const handlePredictionUpdate = useCallback((update) => {
        const { itemId, prediction } = update;

        setPredictions(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                ...prediction,
                updatedAt: new Date().toISOString(),
            },
        }));

        setRealTimeUpdates(prev => [
            {
                type: 'prediction_update',
                itemId,
                oldValue: predictions[itemId]?.estimatedMinutes,
                newValue: prediction.estimatedMinutes,
                timestamp: new Date().toISOString(),
            },
            ...prev.slice(0, 9), // Keep only last 10 updates
        ]);
    }, [predictions]);

    // Handle queue updates
    const handleQueueUpdate = useCallback((update) => {
        const { queueLength, waitTime } = update;

        // Update all predictions for this vendor
        setPredictions(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(itemId => {
                updated[itemId] = {
                    ...updated[itemId],
                    queueEffect: waitTime,
                    queueLength,
                };
            });
            return updated;
        });
    }, []);

    // Handle vendor status updates
    const handleVendorStatusUpdate = useCallback((update) => {
        const { isOnline, capacity, delay } = update;

        if (!isOnline) {
            toast.error('Vendor is temporarily offline');
        }

        if (delay > 0) {
            toast.warning(`Vendor experiencing ${delay} minute delay`);
        }
    }, []);

    // Handle demand spike alerts
    const handleDemandSpikeAlert = useCallback((alert) => {
        const { intensity, estimatedDelay } = alert;

        if (intensity === 'high') {
            toast.warning(`High demand! Estimated wait time increased by ${estimatedDelay} minutes`);
        }
    }, []);

    // Fetch prediction for single item
    const fetchPrediction = useCallback(async (itemId, options = {}) => {
        if (!vendorId) {
            throw new Error('Vendor ID is required for predictions');
        }

        const cacheKey = `${vendorId}-${itemId}-${JSON.stringify(options)}`;

        // Check cache first
        if (predictionsCache.current.has(cacheKey)) {
            const cached = predictionsCache.current.get(cacheKey);
            if (Date.now() - cached.timestamp < 30000) { // 30 second cache
                return cached.data;
            }
        }

        // Cancel previous request
        if (abortController.current) {
            abortController.current.abort();
        }

        abortController.current = new AbortController();

        try {
            setIsLoading(true);
            setError(null);

            const prediction = await predictionService.getQuickEstimate(
                vendorId,
                itemId,
                options,
                abortController.current.signal
            );

            // Update predictions state
            setPredictions(prev => ({
                ...prev,
                [itemId]: {
                    ...prediction,
                    fetchedAt: new Date().toISOString(),
                    cacheKey,
                },
            }));

            // Cache the prediction
            predictionsCache.current.set(cacheKey, {
                data: prediction,
                timestamp: Date.now(),
            });

            return prediction;
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Prediction fetch aborted');
                return null;
            }

            setError(err.message);
            toast.error('Failed to fetch prediction');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [vendorId]);

    // Fetch batch predictions
    const fetchBatchPredictions = useCallback(async (itemIds, options = {}) => {
        if (!vendorId || !itemIds.length) {
            return {};
        }

        const cacheKey = `${vendorId}-batch-${JSON.stringify(itemIds)}-${JSON.stringify(options)}`;

        // Check cache
        if (predictionsCache.current.has(cacheKey)) {
            const cached = predictionsCache.current.get(cacheKey);
            if (Date.now() - cached.timestamp < 30000) {
                setPredictions(cached.data);
                return cached.data;
            }
        }

        try {
            setIsLoading(true);
            setError(null);

            const predictionsData = await predictionService.getBatchPredictions(
                vendorId,
                itemIds,
                options
            );

            // Add metadata
            const predictionsWithMetadata = Object.keys(predictionsData).reduce((acc, itemId) => {
                acc[itemId] = {
                    ...predictionsData[itemId],
                    fetchedAt: new Date().toISOString(),
                };
                return acc;
            }, {});

            setPredictions(predictionsWithMetadata);

            // Cache the predictions
            predictionsCache.current.set(cacheKey, {
                data: predictionsWithMetadata,
                timestamp: Date.now(),
            });

            return predictionsWithMetadata;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch predictions');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [vendorId]);

    // Get detailed prediction for order
    const getOrderPrediction = useCallback(async (orderData) => {
        try {
            setIsLoading(true);

            const prediction = await predictionService.getDetailedPrediction(orderData);

            // Track prediction accuracy if we have actual time later
            const predictionRecord = {
                ...prediction,
                orderId: orderData.orderId,
                requestedAt: new Date().toISOString(),
            };

            return predictionRecord;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to get order prediction');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get prediction explanation
    const getPredictionExplanation = useCallback(async (predictionId) => {
        try {
            const explanation = await predictionService.getExplanation(predictionId);
            return explanation;
        } catch (err) {
            console.error('Failed to get explanation:', err);
            return null;
        }
    }, []);

    // Report prediction accuracy
    const reportAccuracy = useCallback(async (predictionId, actualTime) => {
        try {
            await predictionService.reportAccuracy(predictionId, actualTime);

            // Update accuracy metrics
            setAccuracyMetrics(prev => {
                if (!prev) {
                    return {
                        totalReports: 1,
                        averageError: Math.abs(actualTime - predictions[predictionId]?.estimatedMinutes || 0),
                        lastReported: new Date().toISOString(),
                    };
                }

                const totalError = prev.averageError * prev.totalReports;
                const newTotalError = totalError + Math.abs(actualTime - (predictions[predictionId]?.estimatedMinutes || 0));
                const newAverageError = newTotalError / (prev.totalReports + 1);

                return {
                    totalReports: prev.totalReports + 1,
                    averageError: newAverageError,
                    lastReported: new Date().toISOString(),
                };
            });

            toast.success('Prediction accuracy reported');
        } catch (err) {
            console.error('Failed to report accuracy:', err);
        }
    }, [predictions]);

    // Get prediction confidence
    const getPredictionConfidence = useCallback((itemId) => {
        const prediction = predictions[itemId];
        if (!prediction) return null;

        const { confidence, queueLength, historicalAccuracy } = prediction;

        // Calculate confidence score (0-100)
        let score = confidence * 100;

        // Adjust based on queue length
        if (queueLength > 10) score *= 0.8;
        else if (queueLength > 5) score *= 0.9;

        // Adjust based on historical accuracy
        if (historicalAccuracy > 0.9) score *= 1.1;
        else if (historicalAccuracy < 0.7) score *= 0.8;

        return Math.min(100, Math.max(0, score));
    }, [predictions]);

    // Clear predictions cache
    const clearCache = useCallback(() => {
        predictionsCache.current.clear();
        setPredictions({});
        setRealTimeUpdates([]);
    }, []);

    // Prefetch predictions for items
    const prefetchPredictions = useCallback(async (itemIds) => {
        if (!vendorId || !itemIds.length) return;

        // Filter out items already in cache
        const itemsToFetch = itemIds.filter(itemId => {
            const cacheKey = `${vendorId}-${itemId}-{}`;
            const cached = predictionsCache.current.get(cacheKey);
            return !cached || Date.now() - cached.timestamp > 30000;
        });

        if (itemsToFetch.length > 0) {
            fetchBatchPredictions(itemsToFetch);
        }
    }, [vendorId, fetchBatchPredictions]);

    // Get prediction trends
    const getPredictionTrends = useCallback(async (timeRange = 'day') => {
        try {
            const trends = await predictionService.getTrends(vendorId, timeRange);
            return trends;
        } catch (err) {
            console.error('Failed to get trends:', err);
            return null;
        }
    }, [vendorId]);

    // Simulate prediction for testing
    const simulatePrediction = useCallback((itemId, baseTime) => {
        const queueLength = Math.floor(Math.random() * 10);
        const demandFactor = 1 + (Math.random() * 0.5);
        const estimatedMinutes = Math.round(baseTime * demandFactor + queueLength * 0.5);

        const simulatedPrediction = {
            estimatedMinutes,
            pickupWindow: {
                start: new Date(Date.now() + estimatedMinutes * 60000).toISOString(),
                end: new Date(Date.now() + (estimatedMinutes + 5) * 60000).toISOString(),
            },
            confidence: 0.85,
            breakdown: {
                baseTime,
                queueEffect: queueLength * 0.5,
                demandFactor: demandFactor.toFixed(2),
                explanation: `Based on ${queueLength} orders in queue and ${demandFactor.toFixed(1)}x demand`,
            },
            queueLength,
            isSimulated: true,
        };

        setPredictions(prev => ({
            ...prev,
            [itemId]: simulatedPrediction,
        }));

        return simulatedPrediction;
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, []);

    return {
        // State
        predictions,
        isLoading,
        error,
        accuracyMetrics,
        realTimeUpdates,
        isConnected,

        // Actions
        fetchPrediction,
        fetchBatchPredictions,
        getOrderPrediction,
        getPredictionExplanation,
        reportAccuracy,
        clearCache,
        prefetchPredictions,
        getPredictionTrends,
        simulatePrediction,

        // Computed values
        getPredictionConfidence,

        // Utilities
        hasPredictions: Object.keys(predictions).length > 0,
        averagePredictionTime: Object.values(predictions).reduce(
            (sum, p) => sum + (p.estimatedMinutes || 0), 0
        ) / Math.max(Object.keys(predictions).length, 1),
    };
};

// Hook for prediction analytics
export const usePredictionAnalytics = (vendorId) => {
    const [analytics, setAnalytics] = useState({
        accuracyOverTime: [],
        demandPatterns: {},
        peakHours: [],
        averageErrors: {},
    });

    const [isLoading, setIsLoading] = useState(false);

    const fetchAnalytics = useCallback(async (timeRange = 'week') => {
        if (!vendorId) return;

        try {
            setIsLoading(true);

            const data = await predictionService.getAnalytics(vendorId, timeRange);
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setIsLoading(false);
        }
    }, [vendorId]);

    const getAccuracyScore = useCallback(() => {
        if (!analytics.averageErrors || Object.keys(analytics.averageErrors).length === 0) {
            return null;
        }

        const errors = Object.values(analytics.averageErrors);
        const avgError = errors.reduce((sum, err) => sum + err, 0) / errors.length;

        // Convert to score (0-100)
        const score = Math.max(0, 100 - (avgError * 10));
        return Math.round(score);
    }, [analytics]);

    const getPeakHours = useCallback(() => {
        return analytics.peakHours || [];
    }, [analytics.peakHours]);

    const getDemandPattern = useCallback((hour) => {
        return analytics.demandPatterns?.[hour] || 1.0;
    }, [analytics.demandPatterns]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return {
        analytics,
        isLoading,
        fetchAnalytics,
        getAccuracyScore,
        getPeakHours,
        getDemandPattern,
    };
};