import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Package,
  DollarSign,
  BarChart3,
  RefreshCw,
  Bell,
  Settings,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import StatsCard from './StatsCard';
import OrderQueue from './OrderQueue';
import PreparationTimer from './PreparationTimer';
import { useWebSocket } from '../../hooks/useWebSocket';
import toast from 'react-hot-toast';

const VendorDashboard = ({ vendorId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  // WebSocket for real-time updates
  const { sendMessage, isConnected } = useWebSocket(
    `ws://localhost:5000/vendor/${vendorId}/dashboard`,
    handleWebSocketMessage,
    () => console.log('Connected to vendor dashboard'),
    () => console.log('Disconnected from vendor dashboard')
  );

  function handleWebSocketMessage(data) {
    switch (data.type) {
      case 'NEW_ORDER':
        setRealTimeUpdates(prev => [{
          type: 'new_order',
          message: `New order #${data.orderId}`,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
        toast.success(`New order received: #${data.orderId}`);
        break;
      
      case 'ORDER_STATUS_CHANGE':
        setRealTimeUpdates(prev => [{
          type: 'status_change',
          message: `Order #${data.orderId} is now ${data.status}`,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
        break;
      
      case 'PREDICTION_UPDATE':
        // Handle prediction updates
        break;
    }
  }

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [vendorId, timeFilter]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/vendors/${vendorId}/dashboard?period=${timeFilter}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      await fetch(`/api/orders/${orderId}/mark-ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Order marked as ready');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleStartPreparation = async (orderId) => {
    try {
      await fetch(`/api/orders/${orderId}/start-preparation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Preparation started');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to start preparation');
    }
  };

  const stats = dashboardData?.stats || {
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    avgPreparationTime: 0,
    revenue: 0,
    predictionAccuracy: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Vendor Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {dashboardData?.vendorName || 'Vendor'}
                <span className="ml-2 inline-flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Time Filter */}
              <div className="relative">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-8 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Settings */}
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            change="+12%"
            icon={Package}
            color="blue"
            trend="up"
          />
          
          <StatsCard
            title="Avg Prep Time"
            value={`${stats.avgPreparationTime.toFixed(1)} min`}
            change="-8%"
            icon={Clock}
            color="green"
            trend="down"
          />
          
          <StatsCard
            title="Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            change="+15%"
            icon={DollarSign}
            color="purple"
            trend="up"
          />
          
          <StatsCard
            title="Prediction Accuracy"
            value={`${stats.predictionAccuracy}%`}
            change="+2%"
            icon={BarChart3}
            color="orange"
            trend="up"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Order Queue</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {dashboardData?.activeOrders?.length || 0} active orders
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Filter className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <OrderQueue
                orders={dashboardData?.activeOrders || []}
                onMarkReady={handleMarkReady}
                onStartPreparation={handleStartPreparation}
                isLoading={isLoading}
              />
            </div>

            {/* Preparation Timers */}
            <div className="mt-6">
              <PreparationTimer
                orders={dashboardData?.preparingOrders || []}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Real-time Updates */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Live Updates</h3>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realTimeUpdates.length > 0 ? (
                  realTimeUpdates.map((update, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 mt-2 rounded-full ${
                          update.type === 'new_order' ? 'bg-green-500' :
                          update.type === 'status_change' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{update.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(update.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No live updates yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">On-time Rate</span>
                    <span className="font-medium">{stats.onTimeRate || 95}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats.onTimeRate || 95}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Queue Efficiency</span>
                    <span className="font-medium">{stats.queueEfficiency || 88}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats.queueEfficiency || 88}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-medium">{stats.satisfaction || 4.7}/5</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(stats.satisfaction || 4.7) * 20}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Add New Menu Item</span>
                </button>
                
                <button className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark All Ready</span>
                </button>
                
                <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Report Issue</span>
                </button>
              </div>
            </div>

            {/* Upcoming Pickups */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Upcoming Pickups</h3>
              
              <div className="space-y-3">
                {dashboardData?.upcomingPickups?.slice(0, 3).map((pickup, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">#{pickup.orderId}</div>
                        <div className="text-sm text-gray-500">{pickup.studentName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{pickup.time}</div>
                        <div className="text-xs text-gray-500">in {pickup.timeLeft} min</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!dashboardData?.upcomingPickups || dashboardData.upcomingPickups.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming pickups</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;