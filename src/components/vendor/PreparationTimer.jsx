import React, { useState, useEffect } from 'react';
import {
  Timer,
  Play,
  Pause,
  SkipForward,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

const PreparationTimer = ({ orders }) => {
  const [activeTimers, setActiveTimers] = useState({});
  const [elapsedTimes, setElapsedTimes] = useState({});

  useEffect(() => {
    // Initialize timers for preparing orders
    const initialTimers = {};
    const initialElapsed = {};

    orders.forEach(order => {
      if (order.status === 'preparing') {
        initialTimers[order.id] = false; // Not running by default
        initialElapsed[order.id] = order.elapsedSeconds || 0;
      }
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTimers(initialTimers);
    setElapsedTimes(initialElapsed);
  }, [orders]);

  useEffect(() => {
    // Update timers every second
    const interval = setInterval(() => {
      setElapsedTimes(prev => {
        const updated = { ...prev };
        Object.keys(activeTimers).forEach(orderId => {
          if (activeTimers[orderId]) {
            updated[orderId] = (updated[orderId] || 0) + 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers]);

  const toggleTimer = (orderId) => {
    setActiveTimers(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const resetTimer = (orderId) => {
    setElapsedTimes(prev => ({
      ...prev,
      [orderId]: 0
    }));
    setActiveTimers(prev => ({
      ...prev,
      [orderId]: false
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (order) => {
    if (!order.predictedPrepTime) return 0;
    const elapsed = elapsedTimes[order.id] || 0;
    const totalSeconds = order.predictedPrepTime * 60;
    return Math.min((elapsed / totalSeconds) * 100, 100);
  };

  const getTimeStatus = (order) => {
    const elapsed = elapsedTimes[order.id] || 0;
    const predicted = order.predictedPrepTime * 60;

    if (elapsed > predicted * 1.2) return 'overdue';
    if (elapsed > predicted * 0.8) return 'warning';
    return 'good';
  };

  const preparingOrders = orders.filter(order => order.status === 'preparing');

  if (preparingOrders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center py-8">
          <Timer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Active Preparations</h3>
          <p className="text-gray-400">Start preparing orders to track time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Preparation Timers</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Timer className="w-4 h-4" />
          <span>{preparingOrders.length} active preparation{preparingOrders.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-4">
        {preparingOrders.map((order) => {
          const elapsed = elapsedTimes[order.id] || 0;
          const predicted = order.predictedPrepTime * 60;
          const progress = getProgressPercentage(order);
          const status = getTimeStatus(order);

          return (
            <div key={order.id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Timer className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">#{order.orderNumber}</h4>
                      <div className="text-sm text-gray-500">
                        {order.studentName} • {order.items?.length || 0} items
                      </div>
                    </div>
                  </div>

                  {/* Complexity Indicators */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-500">
                        Complexity: {order.items?.reduce((sum, item) => sum + (item.complexity || 0), 0) || 3}/10
                      </span>
                    </div>

                    {order.requiresAttention && (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600">Requires Attention</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timer Display */}
                <div className="flex flex-col items-center">
                  <div className={`text-3xl font-bold mb-1 ${status === 'overdue' ? 'text-red-600' :
                      status === 'warning' ? 'text-yellow-600' :
                        'text-green-600'
                    }`}>
                    {formatTime(elapsed)}
                  </div>
                  <div className="text-sm text-gray-500">
                    / {formatTime(predicted)}
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleTimer(order.id)}
                    className={`p-3 rounded-lg flex items-center justify-center ${activeTimers[order.id]
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } transition-colors`}
                  >
                    {activeTimers[order.id] ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => resetTimer(order.id)}
                    className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Preparation Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${status === 'overdue' ? 'bg-red-500' :
                        status === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                      }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Time Status Indicators */}
                <div className="flex justify-between mt-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Start: 0:00</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {status === 'overdue' && (
                      <>
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600">Overdue by {formatTime(elapsed - predicted)}</span>
                      </>
                    )}
                    {status === 'warning' && (
                      <>
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">Approaching deadline</span>
                      </>
                    )}
                    {status === 'good' && elapsed > predicted * 0.5 && (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">On track</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Target: {formatTime(predicted)}</span>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium text-gray-700 mb-2">Items to Prepare</div>
                <div className="flex flex-wrap gap-2">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={item.imageUrl || '/api/placeholder/100/100'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            Qty: {item.quantity} • Prep: {item.prepTime || 5} min
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(
                preparingOrders.reduce((sum, order) => sum + (elapsedTimes[order.id] || 0), 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Total Active Time</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {preparingOrders.filter(order => getTimeStatus(order) === 'good').length}
            </div>
            <div className="text-sm text-gray-600">On Track</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {preparingOrders.filter(order => getTimeStatus(order) === 'overdue').length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreparationTimer;