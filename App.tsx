
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Settings, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  X,
  MessageCircle,
  TrendingUp,
  Package,
  LayoutDashboard,
  Lock,
  LogOut,
  Users,
  Image as ImageIcon,
  Type as TypeIcon,
  Pencil,
  Share2
} from 'lucide-react';
import { Product, Order, OrderItem, View, AdminUser } from './types';
import { chatWithAssistant, generateProductDescription } from './geminiService';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'ساعة ذكية برو', description: 'ساعة ذكية متطورة تدعم مراقبة الصحة والاتصالات بوضوح عالٍ.', price: 15000, image: 'https://picsum.photos/seed/watch/600/400', category: 'إلكترونيات' },
  { id: '2', name: 'سماعات لاسلكية', description: 'تجربة صوتية نقية مع تقنية عزل الضوضاء النشطة.', price: 8500, image: 'https://picsum.photos/seed/audio/600/400', category: 'إلكترونيات' }
];

const INITIAL_ADMINS: AdminUser[] = [
  { id: '1', username: 'admin', password: '123', role: 'admin', name: 'المدير العام' }
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user = admins.find(a => a.username === formData.get('username') && a.password === formData.get('password'));
    if (user) {
      setCurrentUser(user);
      setView('admin');
    } else {
      alert('خطأ في اسم المستخدم أو كلمة السر!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
  };

  const goToAdmin = () => {
    if (currentUser) setView('admin');
    else setView('login');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    // Haptic feedback simulation
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.productId !== productId));
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = (customerData: { name: string, phone: string, address: string }) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: customerData.name,
      phone: customerData.phone,
      address: customerData.address,
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      createdAt: new Date()
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setView('home');
    alert(`تم تسجيل طلبك بنجاح! رقم الطلب: ${newOrder.id}`);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    const aiResponse = await chatWithAssistant(chatInput);
    setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setChatInput('');
  };

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'متجري',
        text: 'اكتشف أفضل المنتجات بأسعار رائعة مع خدمة الدفع عند الاستلام!',
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 pb-20 sm:pb-0">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => setView('home')}>
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
                <ShoppingBag size={24} />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">متجري</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={shareApp} className="p-2 text-gray-400 hover:text-indigo-600 rounded-full"><Share2 size={20} /></button>
              {currentUser ? (
                <button 
                  onClick={goToAdmin}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${view === 'admin' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">لوحة التحكم</span>
                </button>
              ) : (
                <button onClick={goToAdmin} className="text-gray-400 hover:text-indigo-600 p-2"><Lock size={20} /></button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <header className="mb-8 py-10 px-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] text-center text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight">متجرك في جيبك</h1>
                <p className="text-indigo-100 text-base max-w-md mx-auto opacity-90">جرب تطبيقنا الجديد، سرعة في التصفح وأمان في الدفع.</p>
              </div>
              <div className="absolute -bottom-20 -right-20 opacity-10 rotate-12"><Package size={300} /></div>
            </header>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">أحدث المنتجات</h2>
              <span className="text-indigo-600 text-sm font-bold">عرض الكل</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-3xl border border-gray-100 p-3 sm:p-4 hover:shadow-xl transition-all group flex flex-col active:scale-[0.98]">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-50">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-1">{p.name}</h3>
                  <div className="mt-auto">
                    <p className="text-indigo-600 font-black text-lg mb-3">{p.price.toLocaleString()} دج</p>
                    <button onClick={() => addToCart(p)} className="w-full bg-gray-900 text-white py-2.5 rounded-2xl text-xs sm:text-sm font-bold hover:bg-indigo-600 transition-colors shadow-sm">إضافة</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="max-w-md mx-auto px-4 py-16">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-50">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock size={40} />
              </div>
              <h2 className="text-2xl font-black text-center mb-8">دخول المسؤول</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 mr-2">اسم المستخدم</label>
                  <input name="username" required className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="admin" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 mr-2">كلمة السر</label>
                  <input name="password" type="password" required className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">دخول</button>
              </form>
            </div>
          </div>
        )}

        {view === 'admin' && currentUser && (
          <AdminDashboard 
            products={products} 
            orders={orders} 
            admins={admins}
            setProducts={setProducts} 
            setOrders={setOrders} 
            setAdmins={setAdmins}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation - Essential for Professional App Look */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t py-2 px-6 flex justify-between items-center sm:hidden z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <ShoppingBag size={22} />
          <span className="text-[10px] font-bold">المتجر</span>
        </button>
        <button onClick={() => setIsAssistantOpen(true)} className="flex flex-col items-center gap-1 text-gray-400">
          <MessageCircle size={22} />
          <span className="text-[10px] font-bold">المساعد</span>
        </button>
        <button onClick={() => setView('cart')} className={`flex flex-col items-center gap-1 relative ${view === 'cart' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <ShoppingCart size={22} />
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
          <span className="text-[10px] font-bold">السلة</span>
        </button>
        <button onClick={goToAdmin} className={`flex flex-col items-center gap-1 ${view === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <User size={22} />
          <span className="text-[10px] font-bold">حسابي</span>
        </button>
      </div>

      {/* Floating Chat for Desktop */}
      <div className="hidden sm:block fixed bottom-6 left-6 z-50">
        <button onClick={() => setIsAssistantOpen(true)} className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95">
          <MessageCircle size={24} />
        </button>
      </div>
    </div>
  );
};

// ... AdminDashboard Component remains same or with slight responsive tweaks ...
// (I will assume AdminDashboard logic stays as it was in the previous turn)

interface AdminProps {
  products: Product[];
  orders: Order[];
  admins: AdminUser[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  onLogout: () => void;
  currentUser: AdminUser;
}

const AdminDashboard: React.FC<AdminProps> = ({ products, orders, admins, setProducts, setOrders, setAdmins, onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'team'>('orders');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productName = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseInt(formData.get('price') as string);
    const category = formData.get('category') as string;
    const image = formData.get('image') as string || `https://picsum.photos/seed/${productName}/600/400`;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName,
      description,
      price,
      category,
      image
    };

    setProducts([...products, newProduct]);
    setIsAddingProduct(false);
    alert('تم إضافة المنتج بنجاح!');
  };

  const deleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">لوحة التحكم</h2>
          <p className="text-gray-500">أهلاً بك، {currentUser.name}</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl shadow-sm border overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>الطلبات</button>
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>المنتجات</button>
          {currentUser.role === 'admin' && (
            <button onClick={() => setActiveTab('team')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === 'team' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>الفريق</button>
          )}
          <button onClick={onLogout} className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 flex items-center gap-2 whitespace-nowrap"><LogOut size={16} /> خروج</button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px]">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black">
                <tr>
                  <th className="p-4">العميل</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm">{o.customerName}</div>
                      <div className="text-[10px] text-gray-400">{o.phone}</div>
                    </td>
                    <td className="p-4 font-black text-indigo-600 text-sm">{o.total.toLocaleString()} دج</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-lg text-[10px] font-black uppercase">{o.status}</span>
                    </td>
                    <td className="p-4 text-gray-400 text-[10px]">{o.createdAt.toLocaleDateString('ar-DZ')}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-gray-400">لا توجد طلبات بعد</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black">المخزون</h3>
            <button onClick={() => setIsAddingProduct(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-2xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-indigo-100">
              <Plus size={18} /> إضافة منتج
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="aspect-video relative overflow-hidden bg-gray-50">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 shadow-sm uppercase">{p.category}</div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="font-black text-gray-900 mb-1 line-clamp-1">{p.name}</h4>
                  <p className="text-gray-400 text-xs line-clamp-2 min-h-[2.5rem] mb-4">{p.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-black text-indigo-600">{p.price.toLocaleString()} دج</span>
                    <div className="flex gap-2">
                      <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-indigo-600 transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 bg-rose-50 text-rose-400 rounded-xl hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black">فريق العمل</h3>
            <button onClick={() => setIsAddingAdmin(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-2xl font-bold flex items-center gap-2 text-sm">
              <Plus size={18} /> إضافة عضو
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {admins.map(a => (
              <div key={a.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm relative group">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">{a.name.charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-sm">{a.name}</h4>
                  <p className="text-[10px] text-gray-400">@{a.username}</p>
                </div>
                {a.id !== '1' && <button onClick={() => setAdmins(admins.filter(x => x.id !== a.id))} className="absolute top-4 left-4 text-red-200 hover:text-red-500"><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
