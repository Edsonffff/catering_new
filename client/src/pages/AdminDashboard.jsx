import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Star, 
  Image, 
  UtensilsCrossed,
  LogOut,
  ChefHat,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getOrderStats, 
  getOrders, 
  updateOrderStatus,
  getMenuCategories,
  getAllReviews,
  approveReview,
  deleteReview
} from '../api/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTime12Hour = (time24) => {
    if (!time24) return 'N/A';
    
    // Handle both HH:MM and HH:MM:SS formats
    const timeParts = time24.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight
    
    return `${hours}:${minutes} ${ampm}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed },
      { id: 'packages', label: 'Packages', icon: Package },
      { id: 'reviews', label: 'Reviews', icon: Star },
      { id: 'gallery', label: 'Gallery', icon: Image },
    ];

    return (
      <div className="bg-dark text-white w-64 min-h-screen p-6 fixed left-0 top-0">
        <div className="flex items-center gap-2 mb-10">
          <ChefHat className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="border-t border-gray-700 pt-4 mb-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
      fetchStats();
    }, []);

    const fetchStats = async () => {
      try {
        const response = await getOrderStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (!stats) return <div className="p-8">Loading...</div>;

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="h-10 w-10 text-blue-500" />
              <span className="text-3xl font-bold">{stats.totalOrders}</span>
            </div>
            <p className="text-gray-600">Total Orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-orange-500" />
              <span className="text-3xl font-bold">{stats.pendingOrders}</span>
            </div>
            <p className="text-gray-600">Pending Orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-10 w-10 text-green-500" />
              <span className="text-3xl font-bold">₹{stats.totalRevenue}</span>
            </div>
            <p className="text-gray-600">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-purple-500" />
              <span className="text-3xl font-bold">5.0</span>
            </div>
            <p className="text-gray-600">Avg Rating</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Customer</th>
                  <th className="text-left py-3">Event Date</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3">#{order.id}</td>
                    <td className="py-3">{order.customer_name}</td>
                    <td className="py-3">{new Date(order.event_date).toLocaleDateString()}</td>
                    <td className="py-3">₹{order.total_amount}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const OrdersView = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchOrders();
    }, []);

    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
      try {
        await updateOrderStatus(orderId, newStatus);
        fetchOrders();
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update order status');
      }
    };

    if (loading) return <div className="p-8">Loading orders...</div>;

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Order Management</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6">Order ID</th>
                  <th className="text-left py-4 px-6">Customer</th>
                  <th className="text-left py-4 px-6">Contact</th>
                  <th className="text-left py-4 px-6">Event</th>
                  <th className="text-left py-4 px-6">Guests</th>
                  <th className="text-left py-4 px-6">Amount</th>
                  <th className="text-left py-4 px-6">Status</th>
                  <th className="text-left py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-semibold">#{order.id}</td>
                    <td className="py-4 px-6">{order.customer_name}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div>{order.customer_email}</div>
                        <div className="text-gray-500">{order.customer_phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div>{new Date(order.event_date).toLocaleDateString()}</div>
                        <div className="text-gray-500 font-medium">{formatTime12Hour(order.event_time)}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{order.guest_count}</td>
                    <td className="py-4 px-6 font-bold text-primary">₹{order.total_amount}</td>
                    <td className="py-4 px-6">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ReviewsView = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
      fetchReviews();
    }, []);

    const fetchReviews = async () => {
      try {
        const response = await getAllReviews();
        setReviews(response.data.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const handleApprove = async (id, isApproved) => {
      try {
        await approveReview(id, isApproved);
        fetchReviews();
      } catch (error) {
        console.error('Error updating review:', error);
      }
    };

    const handleDelete = async (id) => {
      if (window.confirm('Delete this review?')) {
        try {
          await deleteReview(id);
          fetchReviews();
        } catch (error) {
          console.error('Error deleting review:', error);
        }
      }
    };

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Review Management</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{review.customer_name}</h3>
                  <p className="text-sm text-gray-500">{review.event_type}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating ? 'text-primary fill-primary' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>
              <div className="flex gap-2">
                {!review.is_approved && (
                  <button
                    onClick={() => handleApprove(review.id, true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    Approve
                  </button>
                )}
                {review.is_approved && (
                  <button
                    onClick={() => handleApprove(review.id, false)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                  >
                    Unapprove
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
                <span className={`ml-auto px-3 py-2 rounded-lg text-sm ${
                  review.is_approved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {review.is_approved ? 'Published' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'reviews':
        return <ReviewsView />;
      case 'menu':
        return <div className="p-8"><h1 className="text-3xl font-bold">Menu Management</h1><p className="text-gray-600 mt-4">Menu management interface - Add/Edit/Delete menu items and categories</p></div>;
      case 'packages':
        return <div className="p-8"><h1 className="text-3xl font-bold">Package Management</h1><p className="text-gray-600 mt-4">Package management interface - Add/Edit/Delete event packages</p></div>;
      case 'gallery':
        return <div className="p-8"><h1 className="text-3xl font-bold">Gallery Management</h1><p className="text-gray-600 mt-4">Gallery management interface - Upload/Delete images</p></div>;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex-1">
        {renderView()}
      </div>
    </div>
  );
};

export default AdminDashboard;
