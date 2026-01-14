import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Phone, Mail, MapPin, Clock, Award, Users, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getMenuCategories, getPackages, getReviews } from '../api/api';

const HomePage = () => {
  const [menuCategories, setMenuCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, packagesRes, reviewsRes] = await Promise.all([
        getMenuCategories(),
        getPackages(),
        getReviews()
      ]);
      setMenuCategories(menuRes.data.data);
      setPackages(packagesRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="pt-20 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold font-heading text-dark mb-6 leading-tight">
                Exquisite Catering for Your 
                <span className="text-primary"> Special Events</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                From intimate gatherings to grand celebrations, we deliver exceptional culinary experiences 
                that make every moment memorable.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/order" className="btn-primary">
                  Order Catering
                </Link>
                <a href="#menu" className="btn-outline">
                  View Menu
                </a>
              </div>
              <div className="flex items-center gap-8 mt-8">
                <div className="flex items-center gap-2">
                  <Award className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-2xl">500+</p>
                    <p className="text-sm text-gray-600">Events Catered</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-8 w-8 text-primary fill-primary" />
                  <div>
                    <p className="font-bold text-2xl">5.0</p>
                    <p className="text-sm text-gray-600">Client Rating</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 shadow-2xl transform rotate-3">
                <img
                  src="https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=800&fit=crop"
                  alt="Gourmet Food"
                  className="rounded-2xl shadow-xl transform -rotate-3 w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-lg">10-200 Guests</p>
                    <p className="text-sm text-gray-600">Any Event Size</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Award, title: 'Premium Quality', desc: 'Fresh ingredients, expertly prepared' },
              { icon: Users, title: 'Professional Service', desc: 'Experienced team at your service' },
              { icon: Heart, title: 'Custom Menus', desc: 'Tailored to your preferences' },
              { icon: Clock, title: 'On-Time Delivery', desc: 'Punctual and reliable service' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl hover:shadow-lg transition-all">
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Delicious Menu</h2>
            <p className="section-subtitle">
              Explore our diverse selection of culinary delights
            </p>
          </div>

          <div className="space-y-16">
            {menuCategories.map((category) => (
              <div key={category.id} className="animate-fade-in">
                <h3 className="text-3xl font-bold font-heading text-dark mb-8 border-b-4 border-primary inline-block pb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-8">{category.description}</p>
                <div className="grid md:grid-cols-3 gap-8">
                  {category.items?.map((item) => (
                    <div key={item.id} className="card group">
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold">
                          ₹{item.price}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold mb-2">{item.name}</h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/order" className="btn-primary">
              Order From Our Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Event Packages</h2>
            <p className="section-subtitle">
              Choose the perfect package for your celebration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg, idx) => (
              <div key={pkg.id} className={`card ${idx === 2 ? 'ring-4 ring-primary transform scale-105' : ''}`}>
                {idx === 2 && (
                  <div className="bg-primary text-white text-center py-2 font-bold">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold font-heading mb-4">{pkg.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary">₹{pkg.price}</span>
                    <span className="text-gray-600"> / event</span>
                  </div>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700">
                      {pkg.min_guests}-{pkg.max_guests} Guests
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features?.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-2">
                        <Star className="h-5 w-5 text-primary fill-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/order" className={idx === 2 ? 'btn-primary w-full text-center block' : 'btn-outline w-full text-center block'}>
                    Select Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Event Gallery</h2>
            <p className="section-subtitle">
              Moments we've helped create
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1555244162-803834f70033',
              'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
              'https://images.unsplash.com/photo-1530062845289-9109b2c9c868',
              'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
              'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf',
              'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3',
              'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9',
              'https://images.unsplash.com/photo-1529543306356-e802e846a5b8'
            ].map((img, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg aspect-square group cursor-pointer">
                <img
                  src={`${img}?w=400&h=400&fit=crop`}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Client Testimonials</h2>
            <p className="section-subtitle">
              What our happy clients say about us
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="card p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < review.rating ? 'text-primary fill-primary' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{review.comment}"</p>
                <div>
                  <p className="font-bold">{review.customer_name}</p>
                  <p className="text-sm text-gray-600">{review.event_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Let's Make Your Event Unforgettable
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Contact us today to discuss your catering needs. We're here to help create the perfect menu for your special occasion.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6" />
                  <span className="text-lg">(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6" />
                  <span className="text-lg">info@gourmetcatering.com</span>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6" />
                  <span className="text-lg">123 Culinary Street, Food City, FC 12345</span>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="h-6 w-6" />
                  <span className="text-lg">Mon-Sat: 9AM - 8PM</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-dark">
              <h3 className="text-2xl font-bold mb-6">Quick Inquiry</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="input-field"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="input-field"
                />
                <textarea
                  placeholder="Tell us about your event"
                  rows="4"
                  className="input-field"
                ></textarea>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg mb-4">© 2026 Gourmet Catering. All rights reserved.</p>
            <p className="text-gray-400">
              Crafted with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> for food lovers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
