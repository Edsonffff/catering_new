import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getMenuCategories, getPackages, createOrder } from '../api/api';
import { useAuth } from '../context/AuthContext';

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuCategories, setMenuCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    event_date: '',
    event_time: '',
    location: '',
    guest_count: '',
    special_requests: ''
  });
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('');
  const [timeAmPm, setTimeAmPm] = useState('AM');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if user is logged in, if not redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, navigate, location]);

  useEffect(() => {
    if (user) {
      fetchData();
      // Pre-fill customer info from user data
      setFormData(prev => ({
        ...prev,
        customer_name: user.name || '',
        customer_email: user.email || ''
      }));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchData = async () => {
    try {
      const [menuRes, packagesRes] = await Promise.all([
        getMenuCategories(),
        getPackages()
      ]);
      setMenuCategories(menuRes.data.data);
      setPackages(packagesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addToCart = (item, type) => {
    const existingItem = cart.find(i => i.item_id === item.id && i.item_type === type);
    if (existingItem) {
      setCart(cart.map(i => 
        i.item_id === item.id && i.item_type === type
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, {
        item_id: item.id,
        item_name: item.name,
        item_type: type,
        price: item.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (itemId, type, change) => {
    setCart(cart.map(item => {
      if (item.item_id === itemId && item.item_type === type) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId, type) => {
    setCart(cart.filter(item => !(item.item_id === itemId && item.item_type === type)));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTimeChange = (hour, minute, ampm) => {
  if (hour && minute && ampm) {
    let hour24 = parseInt(hour);

    if (ampm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    // ✅ IMPORTANT FIX: add seconds
    const timeString = `${hour24
      .toString()
      .padStart(2, '0')}:${minute.padStart(2, '0')}:00`;

    setFormData(prev => ({
      ...prev,
      event_time: timeString
    }));
  }
};

  const handleHourChange = (e) => {
    const hour = e.target.value;
    setTimeHour(hour);
    handleTimeChange(hour, timeMinute, timeAmPm);
  };

  const handleMinuteChange = (e) => {
    const minute = e.target.value;
    setTimeMinute(minute);
    handleTimeChange(timeHour, minute, timeAmPm);
  };

  const handleAmPmChange = (e) => {
    const ampm = e.target.value;
    setTimeAmPm(ampm);
    handleTimeChange(timeHour, timeMinute, ampm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Please add items to your cart');
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        ...formData,
        items: cart,
        guest_count: parseInt(formData.guest_count)
      });
      setSuccess(true);
      setCart([]);
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        event_date: '',
        event_time: '',
        location: '',
        guest_count: '',
        special_requests: ''
      });
      setTimeHour('');
      setTimeMinute('');
      setTimeAmPm('AM');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      alert('Error placing order. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md">
          <div className="bg-green-500 rounded-full h-20 w-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-dark mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll contact you shortly to confirm the details.
          </p>
          <p className="text-sm text-gray-500">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </button>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hello, <span className="font-semibold">{user.name}</span></span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Menu Selection */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-4xl font-bold font-heading mb-2">Place Your Order</h1>
                <p className="text-gray-600">Select items from our menu and packages</p>
              </div>

              {/* Packages */}
              <div>
                <h2 className="text-2xl font-bold font-heading mb-4">Event Packages</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="card p-6">
                      <h3 className="font-bold text-xl mb-2">{pkg.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                      <p className="text-2xl font-bold text-primary mb-3">₹{pkg.price}</p>
                      <p className="text-sm text-gray-600 mb-4">
                        {pkg.min_guests}-{pkg.max_guests} Guests
                      </p>
                      <button
                        onClick={() => addToCart(pkg, 'package')}
                        className="btn-primary w-full text-sm py-2"
                      >
                        <Plus className="inline h-4 w-4 mr-1" />
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu Items */}
              {menuCategories.map(category => (
                <div key={category.id}>
                  <h2 className="text-2xl font-bold font-heading mb-4">{category.name}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {category.items?.map(item => (
                      <div key={item.id} className="card p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-lg font-bold text-primary mt-2">₹{item.price}</p>
                        </div>
                        <button
                          onClick={() => addToCart(item, 'menu_item')}
                          className="bg-primary text-white p-2 rounded-lg hover:bg-orange-600 ml-4"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Cart and Order Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Cart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold">Your Cart ({cart.length})</h2>
                  </div>

                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                        {cart.map((item, idx) => (
                          <div key={idx} className="border-b pb-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm">{item.item_name}</h4>
                              <button
                                onClick={() => removeFromCart(item.item_id, item.item_type)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.item_id, item.item_type, -1)}
                                  className="bg-gray-200 p-1 rounded"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.item_id, item.item_type, 1)}
                                  className="bg-gray-200 p-1 rounded"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total:</span>
                          <span className="text-primary">₹{calculateTotal()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Order Form */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Event Details</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="label">Your Name *</label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input
                        type="email"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Phone *</label>
                      <input
                        type="tel"
                        name="customer_phone"
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Event Date *</label>
                      <input
                        type="date"
                        name="event_date"
                        value={formData.event_date}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="label">Event Time *</label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={timeHour}
                          onChange={handleHourChange}
                          className="input-field"
                          required
                        >
                          <option value="">Hour</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                          <option value="11">11</option>
                          <option value="12">12</option>
                        </select>
                        <select
                          value={timeMinute}
                          onChange={handleMinuteChange}
                          className="input-field"
                          required
                        >
                          <option value="">Min</option>
                          <option value="00">00</option>
                          <option value="15">15</option>
                          <option value="30">30</option>
                          <option value="45">45</option>
                        </select>
                        <select
                          value={timeAmPm}
                          onChange={handleAmPmChange}
                          className="input-field"
                          required
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Location *</label>
                      <textarea
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="input-field"
                        rows="2"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label className="label">Guest Count *</label>
                      <input
                        type="number"
                        name="guest_count"
                        value={formData.guest_count}
                        onChange={handleInputChange}
                        className="input-field"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Special Requests</label>
                      <textarea
                        name="special_requests"
                        value={formData.special_requests}
                        onChange={handleInputChange}
                        className="input-field"
                        rows="3"
                        placeholder="Dietary restrictions, setup preferences, etc."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || cart.length === 0}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
