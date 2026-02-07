import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { predictionService } from '../services/predictionService';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

const PredictionContext = createContext();

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return context;
};

export const PredictionProvider = ({ children }) => {
  const [predictions, setPredictions] = useState({});
  const [batchPredictions, setBatchPredictions] = useState({});
  const [vendorLoads, setVendorLoads] = useState({});
  const [modelMetrics, setModelMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [cache, setCache] = useState({});

  // Initialize WebSocket for real-time prediction updates
  const { sendMessage, isConnected } = useWebSocket(
    `${import.meta.env.VITE_WS_URL}/predictions`,
    handleWebSocketMessage,
    () => console.log('Connected to prediction service'),
    () => console.log('Disconnected from prediction service')
  );

  // Handle WebSocket messages
  function handleWebSocketMessage(data) {
    switch (data.type) {
      case 'PREDICTION_UPDATE':
        handlePredictionUpdate(data.payload);
        break;
      
      case 'VENDOR_LOAD_UPDATE':
        handleVendorLoadUpdate(data.payload);
        break;
      
      case 'MODEL_METRICS_UPDATE':
        handleModelMetricsUpdate(data.payload);
        break;
      
      case 'PREDICTION_ERROR':
        handlePredictionError(data.payload);
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Update specific prediction
  const handlePredictionUpdate = (update) => {
    const { vendorId, itemId, prediction } = update;
    
    setPredictions(prev => ({
      ...prev,
      [vendorId]: {
        ...prev[vendorId],
        [itemId]: {
          ...prev[vendorId]?.[itemId],
          ...prediction,
          lastUpdated: new Date().toISOString()
        }
      }
    }));

    // Update cache
    updateCache(`prediction:${vendorId}:${itemId}`, prediction);
  };

  // Update vendor load information
  const handleVendorLoadUpdate = (update) => {
    const { vendorId, load } = update;
    
    setVendorLoads(prev => ({
      ...prev,
      [vendorId]: {
        ...prev[vendorId],
        ...load,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  // Update model metrics
  const handleModelMetricsUpdate = (metrics) => {
    setModelMetrics(prev => ({
      ...prev,
      [metrics.modelName]: {
        ...prev[metrics.modelName],
        ...metrics,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  // Handle prediction errors
  const handlePredictionError = (error) => {
    console.error('Prediction error:', error);
    toast.error(`Prediction error: ${error.message}`);
  };

  // Cache management
  const updateCache = (key, value, ttl = 30000) => {
    const cacheItem = {
      value,
      expiry: Date.now() + ttl
    };
    
    setCache(prev => ({
      ...prev,
      [key]: cacheItem
    }));
  };

  const getFromCache = (key) => {
    const item = cache[key];
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      // Remove expired item
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      return null;
    }
    
    return item.value;
  };

  // Get quick prediction for browsing
  const getQuickPrediction = useCallback(async (vendorId, itemId, quantity = 1) => {
    const cacheKey = `quick:${vendorId}:${itemId}:${quantity}`;
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      setIsLoading(true);
      const prediction = await predictionService.getQuickEstimate(
        vendorId,
        itemId,
        quantity
      );
      
      // Update state
      setPredictions(prev => ({
        ...prev,
        [vendorId]: {
          ...prev[vendorId],
          [itemId]: {
            ...prediction,
            type: 'quick',
            fetchedAt: new Date().toISOString()
          }
        }
      }));

      // Update cache
      updateCache(cacheKey, prediction, 30000); // 30 seconds TTL

      // Log to history
      setPredictionHistory(prev => [{
        type: 'quick',
        vendorId,
        itemId,
        prediction,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 100)]); // Keep last 100 predictions

      return prediction;
    } catch (error) {
      console.error('Quick prediction error:', error);
      
      // Return fallback prediction
      const fallback = getFallbackPrediction(vendorId, itemId);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get batch predictions for menu items
  const getBatchPredictions = useCallback(async (vendorId, itemIds) => {
    const cacheKey = `batch:${vendorId}:${JSON.stringify(itemIds.sort())}`;
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      setBatchPredictions(prev => ({
        ...prev,
        [vendorId]: cached
      }));
      return cached;
    }

    try {
      setIsLoading(true);
      const predictions = await predictionService.getBatchPredictions(
        vendorId,
        itemIds
      );
      
      // Update state
      setBatchPredictions(prev => ({
        ...prev,
        [vendorId]: predictions
      }));

      // Update individual predictions
      Object.entries(predictions).forEach(([itemId, prediction]) => {
        setPredictions(prev => ({
          ...prev,
          [vendorId]: {
            ...prev[vendorId],
            [itemId]: {
              ...prediction,
              type: 'batch',
              fetchedAt: new Date().toISOString()
            }
          }
        }));
      });

      // Update cache
      updateCache(cacheKey, predictions, 60000); // 1 minute TTL

      return predictions;
    } catch (error) {
      console.error('Batch prediction error:', error);
      
      // Return fallback predictions
      const fallbacks = {};
      itemIds.forEach(itemId => {
        fallbacks[itemId] = getFallbackPrediction(vendorId, itemId);
      });
      
      setBatchPredictions(prev => ({
        ...prev,
        [vendorId]: fallbacks
      }));
      
      return fallbacks;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get detailed prediction for order confirmation
  const getDetailedPrediction = useCallback(async (orderData) => {
    const { vendorId, items, studentId, desiredWindow } = orderData;
    const cacheKey = `detailed:${vendorId}:${JSON.stringify(items)}`;

    try {
      setIsLoading(true);
      const prediction = await predictionService.getDetailedPrediction(
        orderData
      );
      
      // Log to history
      setPredictionHistory(prev => [{
        type: 'detailed',
        vendorId,
        items,
        prediction,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 100)]);

      // Send real-time update to vendor
      if (isConnected) {
        sendMessage({
          type: 'PREDICTION_CREATED',
          payload: {
            vendorId,
            orderData,
            prediction
          }
        });
      }

      return prediction;
    } catch (error) {
      console.error('Detailed prediction error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, sendMessage]);

  // Get vendor load information
  const getVendorLoad = useCallback(async (vendorId) => {
    if (vendorLoads[vendorId]) {
      return vendorLoads[vendorId];
    }

    try {
      const response = await fetch(`/api/vendors/${vendorId}/load`);
      const loadData = await response.json();
      
      setVendorLoads(prev => ({
        ...prev,
        [vendorId]: loadData
      }));
      
      return loadData;
    } catch (error) {
      console.error('Failed to fetch vendor load:', error);
      return getFallbackVendorLoad();
    }
  }, [vendorLoads]);

  // Get aggregated prediction for multiple items
  const getAggregatedPrediction = useCallback((vendorId, items) => {
    if (!items || items.length === 0) {
      return getFallbackPrediction(vendorId, 'aggregated');
    }

    const itemPredictions = items.map(item => {
      const prediction = predictions[vendorId]?.[item.id];
      return prediction || getFallbackPrediction(vendorId, item.id);
    });

    // Calculate aggregated prediction
    const totalPrepTime = itemPredictions.reduce((sum, pred) => 
      sum + (pred.estimatedMinutes || 0), 0
    );
    
    const minConfidence = Math.min(...itemPredictions.map(p => p.confidence || 0.5));
    const maxQueueEffect = Math.max(...itemPredictions.map(p => 
      p.breakdown?.queueEffect || 0
    ));

    const aggregated = {
      estimatedMinutes: Math.ceil(totalPrepTime + maxQueueEffect),
      confidence: minConfidence * 0.9, // Slightly reduce confidence for aggregation
      breakdown: {
        baseTime: totalPrepTime,
        queueEffect: maxQueueEffect,
        aggregationFactor: items.length,
        items: items.map((item, index) => ({
          name: item.name,
          estimatedTime: itemPredictions[index]?.estimatedMinutes || 0
        }))
      },
      pickupWindow: calculatePickupWindow(totalPrepTime + maxQueueEffect),
      type: 'aggregated',
      calculatedAt: new Date().toISOString()
    };

    return aggregated;
  }, [predictions]);

  // Calculate pickup window based on prediction
  const calculatePickupWindow = (estimatedMinutes) => {
    const now = new Date();
    const pickupTime = new Date(now.getTime() + estimatedMinutes * 60000);
    const windowStart = new Date(pickupTime.getTime() - 2.5 * 60000);
    const windowEnd = new Date(pickupTime.getTime() + 2.5 * 60000);
    
    return {
      start: windowStart.toISOString(),
      end: windowEnd.toISOString(),
      center: pickupTime.toISOString()
    };
  };

  // Get fallback prediction when service is unavailable
  const getFallbackPrediction = (vendorId, itemId) => {
    // Simple deterministic fallback based on vendor and item IDs
    const hash = `${vendorId}:${itemId}`.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0
    );
    
    const baseTime = 5 + (hash % 10); // 5-15 minutes
    const queueEffect = (hash % 5); // 0-4 minutes
    
    return {
      estimatedMinutes: baseTime + queueEffect,
      confidence: 0.7,
      breakdown: {
        baseTime,
        queueEffect,
        demandFactor: 1.0,
        explanation: 'Using fallback estimation'
      },
      pickupWindow: calculatePickupWindow(baseTime + queueEffect),
      isFallback: true,
      cachedAt: new Date().toISOString()
    };
  };

  // Get fallback vendor load
  const getFallbackVendorLoad = () => ({
    currentActiveOrders: 0,
    queueLength: 0,
    capacityUtilization: 0.5,
    avgPreparationTime: 10,
    isFallback: true
  });

  // Get prediction accuracy for analytics
  const getPredictionAccuracy = useCallback(async (vendorId, timeRange = 'day') => {
    try {
      const response = await fetch(
        `/api/vendors/${vendorId}/prediction-accuracy?range=${timeRange}`
      );
      const accuracyData = await response.json();
      
      setModelMetrics(prev => ({
        ...prev,
        [vendorId]: {
          ...prev[vendorId],
          accuracy: accuracyData
        }
      }));
      
      return accuracyData;
    } catch (error) {
      console.error('Failed to fetch prediction accuracy:', error);
      return {
        overallAccuracy: 0.85,
        recentAccuracy: 0.88,
        errorDistribution: {},
        isFallback: true
      };
    }
  }, []);

  // Get prediction for a specific vendor-item pair
  const getPrediction = useCallback((vendorId, itemId) => {
    return predictions[vendorId]?.[itemId] || null;
  }, [predictions]);

  // Check if prediction is loading for specific vendor/item
  const getPredictionLoading = useCallback((vendorId, itemId) => {
    // In a real implementation, you might track loading states per request
    return isLoading;
  }, [isLoading]);

  // Subscribe to vendor updates
  const subscribeToVendor = useCallback((vendorId) => {
    if (isConnected) {
      sendMessage({
        type: 'SUBSCRIBE_VENDOR',
        payload: { vendorId }
      });
    }
  }, [isConnected, sendMessage]);

  // Unsubscribe from vendor updates
  const unsubscribeFromVendor = useCallback((vendorId) => {
    if (isConnected) {
      sendMessage({
        type: 'UNSUBSCRIBE_VENDOR',
        payload: { vendorId }
      });
    }
  }, [isConnected, sendMessage]);

  // Clear cache for specific vendor
  const clearVendorCache = useCallback((vendorId) => {
    setPredictions(prev => {
      const newPredictions = { ...prev };
      delete newPredictions[vendorId];
      return newPredictions;
    });
    
    setBatchPredictions(prev => {
      const newBatch = { ...prev };
      delete newBatch[vendorId];
      return newBatch;
    });
    
    // Clear related cache entries
    const newCache = {};
    Object.keys(cache).forEach(key => {
      if (!key.includes(`:${vendorId}:`)) {
        newCache[key] = cache[key];
      }
    });
    setCache(newCache);
  }, [cache]);

  // Get prediction history for analytics
  const getPredictionHistory = useCallback((limit = 50) => {
    return predictionHistory.slice(0, limit);
  }, [predictionHistory]);

  // Get model performance metrics
  const getModelMetrics = useCallback((modelName = 'default') => {
    return modelMetrics[modelName] || {
      accuracy: 0,
      precision: 0,
      recall: 0,
      lastUpdated: null,
      isFallback: true
    };
  }, [modelMetrics]);

  const value = {
    // State
    predictions,
    batchPredictions,
    vendorLoads,
    modelMetrics,
    isLoading,
    predictionHistory,
    isConnected,
    
    // Methods
    getQuickPrediction,
    getBatchPredictions,
    getDetailedPrediction,
    getVendorLoad,
    getAggregatedPrediction,
    getPredictionAccuracy,
    getPrediction,
    getPredictionLoading,
    subscribeToVendor,
    unsubscribeFromVendor,
    clearVendorCache,
    getPredictionHistory,
    getModelMetrics,
    
    // Utilities
    calculatePickupWindow,
    updateCache,
    getFromCache
  };

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};

// Custom hooks for specific use cases

export const useVendorPredictions = (vendorId) => {
  const { 
    getQuickPrediction, 
    getBatchPredictions, 
    getVendorLoad,
    predictions,
    vendorLoads,
    isLoading,
    subscribeToVendor,
    unsubscribeFromVendor
  } = usePrediction();

  useEffect(() => {
    if (vendorId) {
      subscribeToVendor(vendorId);
      
      return () => {
        unsubscribeFromVendor(vendorId);
      };
    }
  }, [vendorId, subscribeToVendor, unsubscribeFromVendor]);

  const vendorPredictions = predictions[vendorId] || {};
  const vendorLoad = vendorLoads[vendorId];

  return {
    predictions: vendorPredictions,
    vendorLoad,
    isLoading,
    getQuickPrediction: (itemId, quantity) => 
      getQuickPrediction(vendorId, itemId, quantity),
    getBatchPredictions: (itemIds) => 
      getBatchPredictions(vendorId, itemIds),
    getVendorLoad: () => getVendorLoad(vendorId)
  };
};

export const useOrderPrediction = () => {
  const { getDetailedPrediction, getAggregatedPrediction } = usePrediction();

  const predictOrder = async (orderData) => {
    try {
      // First get aggregated prediction for display
      const aggregated = getAggregatedPrediction(
        orderData.vendorId,
        orderData.items
      );
      
      // Then get detailed prediction for confirmation
      const detailed = await getDetailedPrediction(orderData);
      
      return {
        aggregated,
        detailed,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Order prediction failed:', error);
      throw error;
    }
  };

  return { predictOrder };
};

export const usePredictionAnalytics = (vendorId) => {
  const { 
    getPredictionAccuracy, 
    getPredictionHistory,
    getModelMetrics,
    modelMetrics
  } = usePrediction();

  const [analytics, setAnalytics] = useState({
    accuracy: null,
    history: [],
    metrics: {}
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!vendorId) return;
      
      setIsLoading(true);
      try {
        const [accuracy, history, metrics] = await Promise.all([
          getPredictionAccuracy(vendorId),
          getPredictionHistory(100),
          getModelMetrics('vendor_model')
        ]);
        
        setAnalytics({
          accuracy,
          history,
          metrics
        });
      } catch (error) {
        console.error('Failed to load prediction analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [vendorId, getPredictionAccuracy, getPredictionHistory, getModelMetrics]);

  return {
    analytics,
    isLoading,
    refresh: () => {
      // Force refresh analytics
    }
  };
};