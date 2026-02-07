import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  MoreVertical,
  User,
  Package,
  Timer,
  Filter
} from 'lucide-react';

const OrderQueue = ({ orders, onMarkReady, onStartPreparation, isLoading }) => {
  const [filter, setFilter] = useState('all'); // all, pending, preparing, ready
  const [sortBy, setSortBy] = useState('time'); // time, complexity, status

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <AlertCircle className="w-4 h-4" />;
      case 'preparing': return <Timer className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRemaining = (pickupTime) => {
    if (!pickupTime) return '--';
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diff = Math.max(0, Math.floor((pickup - now) / 60000));
    
    if (diff < 60) return `${diff} min`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return new Date(a.pickupTime) - new Date(b.pickupTime);
      case 'complexity':
        return (b.items?.reduce((sum, item) => sum + (item.complexity || 0), 0) || 0) -
               (a.items?.reduce((sum, item) => sum + (item.complexity || 0), 0) || 0);
      case 'status':
        const statusOrder = { 'pending': 0, 'confirmed': 1, 'preparing': 2, 'ready': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'preparing', 'ready'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="time">Sort by Time</option>
            <option value="complexity">Sort by Complexity</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Orders</h3>
            <p className="text-gray-400">New orders will appear here</p>
          </div>
        ) : (
          sortedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded-xl hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="text-xs font-medium capitalize">{order.status}</span>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800">#{order.orderNumber}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{order.studentName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium">₹{order.totalAmount?.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                    </div>
                    
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Items */}
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">Items</div>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                              <img
                                src={item.imageUrl || '/api/placeholder/100/100'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                Qty: {item.quantity} • Complexity: {item.complexity || 3}/10
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timing Info */}
                  <div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Pickup Time</div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium">
                              {formatTime(order.pickupWindow?.start)}
                              <span className="mx-1 text-gray-400">-</span>
                              {formatTime(order.pickupWindow?.end)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getTimeRemaining(order.pickupWindow?.start)} remaining
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Prediction</div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            Est: <span className="font-medium">{order.predictedPrepTime || '--'} min</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            order.predictionAccuracy >= 90 ? 'bg-green-100 text-green-700' :
                            order.predictionAccuracy >= 80 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.predictionAccuracy || 0}% accurate
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => onStartPreparation?.(order.id)}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Start Preparation</span>
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => onMarkReady?.(order.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Ready</span>
                    </button>
                  )}
                  
                  {order.status === 'ready' && (
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <Package className="w-4 h-4" />
                      <span>Scan QR to Collect</span>
                    </button>
                  )}
                  
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                  
                  {order.specialInstructions && (
                    <div className="ml-auto">
                      <div className="text-sm text-gray-500">
                        Special: {order.specialInstructions}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {sortedOrders.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-blue-700">
              Showing {sortedOrders.length} order{sortedOrders.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` (${filter} only)`}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-bold ml-2">
                  ₹{sortedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
                </span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-600">Avg Prep Time:</span>
                <span className="font-bold ml-2">
                  {Math.round(sortedOrders.reduce((sum, order) => sum + (order.predictedPrepTime || 0), 0) / sortedOrders.length)} min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderQueue;