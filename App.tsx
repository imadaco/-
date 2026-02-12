
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
  Share2,
  Zap,
  Star,
  Flame,
  Search,
  Link as LinkIcon,
  ExternalLink,
  Wallet,
  ArrowUpRight,
  Minus
} from 'lucide-react';
import { Product, Order, OrderItem, View, AdminUser, LandingPage } from './types';
import { chatWithAssistant, generateProductDescription } from './geminiService';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'ساعة ذكية برو Max', description: 'ساعة ذكية متطورة تدعم مراقبة الصحة والاتصالات بوضوح عالٍ.', price: 15000, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800', category: 'إلكترونيات' },
  { id: '2', name: 'سماعات Air-Sound', description: 'تجربة صوتية نقية مع تقنية عزل الضوضاء النشطة.', price: 8500, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', category: 'إلكترونيات' },
  { id: '3', name: 'نظارات شمسية كلاسيك', description: 'تصميم إيطالي فاخر يوفر حماية كاملة من الشمس.', price: 4200, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800', category: 'أزياء' },
  { id: '4', name: 'حقيبة ظهر ذكية', description: 'حقيبة مضادة للماء مع منفذ شحن USB وتصميم مريح.', price: 6800, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800', category: 'إكسسوارات' }
];

const INITIAL_ADMINS: AdminUser[] = [
  { id: '1', username: 'admin', password: '123', role: 'admin', name: 'المدير العام', balance: 0 }
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [activeLandingPage, setActiveLandingPage] = useState<LandingPage | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const goToAdmin = () => {
    if (currentUser) setView('admin');
    else setView('login');
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user = admins.find(a => a.username === formData.get('username') && a.password === formData.get('password'));
    if (user) {
      setCurrentUser(user);
      setView('admin');
    } else {
      alert('اسم المستخدم أو كلمة السر غير صحيحة!');
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = (customerData: { name: string, phone: string, address: string }, isLandingPage: boolean = false) => {
    const items = isLandingPage && activeLandingPage 
      ? [{ productId: activeLandingPage.productId, quantity: 1, price: activeLandingPage.customPrice, name: products.find(p => p.id === activeLandingPage.productId)?.name || '' }]
      : [...cart];

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let commission = 0;
    if (isLandingPage && activeLandingPage) {
      const product = products.find(p => p.id === activeLandingPage.productId);
      if (product) {
        commission = activeLandingPage.customPrice - product.price;
      }
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: customerData.name,
      phone: customerData.phone,
      address: customerData.address,
      items,
      total,
      status: 'pending',
      createdAt: new Date(),
      referralId: isLandingPage ? activeLandingPage?.creatorId : undefined,
      commission: commission > 0 ? commission : undefined
    };

    setOrders([newOrder, ...orders]);
    
    if (commission > 0 && activeLandingPage) {
      setAdmins(prev => prev.map(a => a.id === activeLandingPage.creatorId ? { ...a, balance: a.balance + commission } : a));
    }

    setCart([]);
    setActiveLandingPage(null);
    setView('home');
    alert(`شكراً لك! تم تسجيل طلبك بنجاح برقم: ${newOrder.id}. سنتصل بك قريباً.`);
  };

  const openLandingPage = (lp: LandingPage) => {
    setActiveLandingPage(lp);
    setView('landing-page');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FBFBFF] pb-24 sm:pb-0">
      {view !== 'landing-page' && (
        <nav className="bg-white/90 backdrop-blur-xl border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-all" onClick={() => setView('home')}>
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2 rounded-xl text-white shadow-lg">
                  <ShoppingBag size={24} />
                </div>
                <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-700">متجري</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setView('cart')} className="relative p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <ShoppingCart size={22} />
                  {cart.length > 0 && <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-black">{cart.length}</span>}
                </button>
                <button onClick={goToAdmin} className={`p-2.5 rounded-xl transition-all ${currentUser ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                  {currentUser ? <LayoutDashboard size={22} /> : <Lock size={22} />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-grow">
        {view === 'home' && <HomeView products={products} addToCart={addToCart} />}
        
        {view === 'cart' && (
          <CartView 
            cart={cart} 
            updateQuantity={updateCartQuantity} 
            remove={removeFromCart} 
            onCheckout={(data) => handleCheckout(data, false)} 
          />
        )}

        {view === 'landing-page' && activeLandingPage && (
          <LandingPageView 
            landingPage={activeLandingPage} 
            product={products.find(p => p.id === activeLandingPage.productId)!} 
            onCheckout={(data) => handleCheckout(data, true)}
            onBack={() => setView('home')}
          />
        )}

        {view === 'login' && <LoginView onLogin={handleLogin} />}
        
        {view === 'admin' && currentUser && (
          <AdminDashboard 
            products={products} 
            orders={orders} 
            admins={admins}
            landingPages={landingPages}
            setProducts={setProducts} 
            setAdmins={setAdmins}
            setLandingPages={setLandingPages}
            onLogout={() => { setCurrentUser(null); setView('home'); }}
            currentUser={currentUser}
            openLP={openLandingPage}
          />
        )}
      </main>

      <div className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-2xl border border-gray-100 p-2 flex justify-between items-center sm:hidden z-50 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
        <button onClick={() => setView('home')} className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl gap-1 transition-all ${view === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'}`}>
          <ShoppingBag size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter">الرئيسية</span>
        </button>
        <button onClick={() => setView('cart')} className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl gap-1 transition-all relative ${view === 'cart' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'}`}>
          <ShoppingCart size={20} />
          {cart.length > 0 && <span className="absolute top-1 right-2 bg-rose-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">{cart.length}</span>}
          <span className="text-[8px] font-black uppercase tracking-tighter">السلة</span>
        </button>
        <button onClick={goToAdmin} className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl gap-1 transition-all ${view === 'admin' || view === 'login' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'}`}>
          <User size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter">حسابي</span>
        </button>
      </div>
    </div>
  );
};

const HomeView: React.FC<{ products: Product[], addToCart: (p: Product) => void }> = ({ products, addToCart }) => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      {products.map(p => (
        <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all">
          <div className="aspect-square rounded-2xl overflow-hidden mb-4">
            <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h3 className="font-black text-sm mb-1">{p.name}</h3>
          <p className="text-[10px] text-gray-400 line-clamp-1 mb-4">{p.description}</p>
          <div className="mt-auto flex items-center justify-between">
            <p className="text-indigo-600 font-black">{p.price.toLocaleString()} دج</p>
            <button onClick={() => addToCart(p)} className="bg-gray-900 text-white p-2 rounded-xl hover:bg-indigo-600 transition-colors">
              <Plus size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CartView: React.FC<{ cart: OrderItem[], updateQuantity: (id: string, d: number) => void, remove: (id: string) => void, onCheckout: (data: any) => void }> = ({ cart, updateQuantity, remove, onCheckout }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingCart size={48} />
      </div>
      <h2 className="text-2xl font-black mb-2">سلة التسوق فارغة</h2>
      <p className="text-gray-400 mb-8 font-medium">ابدأ بإضافة بعض المنتجات الرائعة لملء سلتك!</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-black mb-8">سلة التسوق</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.productId} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex-shrink-0">
                <img src={INITIAL_PRODUCTS.find(p => p.id === item.productId)?.image} className="w-full h-full object-cover rounded-2xl" />
              </div>
              <div className="flex-grow">
                <h4 className="font-black text-sm mb-1">{item.name}</h4>
                <p className="text-indigo-600 font-black text-sm">{(item.price * item.quantity).toLocaleString()} دج</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center bg-gray-50 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-indigo-600"><Minus size={14} /></button>
                    <span className="px-3 font-bold text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-indigo-600"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => remove(item.productId)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          <div className="p-6 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-100 flex justify-between items-center">
            <span className="font-bold">المجموع الكلي:</span>
            <span className="text-2xl font-black">{total.toLocaleString()} دج</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-fit">
          <h3 className="text-xl font-black mb-6">معلومات التوصيل</h3>
          <form onSubmit={(e) => { e.preventDefault(); onCheckout(formData); }} className="space-y-4">
            <input required className="w-full px-6 py-4 rounded-2xl border bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="الاسم الكامل" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="tel" className="w-full px-6 py-4 rounded-2xl border bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="رقم الهاتف" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <textarea required className="w-full px-6 py-4 rounded-2xl border bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-50" rows={3} placeholder="العنوان بالتفصيل" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all">تأكيد الطلب والدفع عند الاستلام</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const LandingPageView: React.FC<{ landingPage: LandingPage, product: Product, onCheckout: (data: any) => void, onBack: () => void }> = ({ landingPage, product, onCheckout, onBack }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
          <ChevronRight size={20} /> العودة للمتجر
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-gray-50">
              <img src={product.image} className="w-full h-full object-cover" />
            </div>
            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
              <div className="flex items-center gap-3 text-indigo-600 mb-2">
                <CheckCircle size={20} />
                <span className="font-bold">ضمان الجودة 100%</span>
              </div>
              <p className="text-sm text-indigo-900/60 font-medium leading-relaxed">نحن نضمن لك جودة المنتج العالية مع إمكانية الفحص قبل الدفع عند الاستلام.</p>
            </div>
          </div>

          <div className="space-y-8 text-right">
            <div>
              <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">عرض خاص وحصري</span>
              <h1 className="text-4xl font-black text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-6 font-medium">{product.description}</p>
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-5xl font-black text-indigo-600">{landingPage.customPrice.toLocaleString()}</span>
                <span className="text-xl font-bold text-gray-400">دج</span>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black mb-6">اطلب الآن والدفع عند الاستلام</h3>
              <form onSubmit={(e) => { e.preventDefault(); onCheckout(formData); }} className="space-y-4">
                <input required className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-indigo-100 outline-none transition-all" placeholder="الاسم الكامل" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="tel" className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-indigo-100 outline-none transition-all" placeholder="رقم الهاتف" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <textarea required className="w-full px-6 py-4 rounded-2xl border focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none" rows={3} placeholder="العنوان بالتفصيل" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  تأكيد الطلب الآن <ChevronLeft />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginView: React.FC<{ onLogin: (e: any) => void }> = ({ onLogin }) => (
  <div className="max-w-md mx-auto px-4 py-20">
    <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-50 text-right">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
        <Lock size={40} />
      </div>
      <h2 className="text-3xl font-black text-center mb-8">دخول المسؤولين</h2>
      <form onSubmit={onLogin} className="space-y-5">
        <input name="username" required className="w-full px-6 py-4 rounded-2xl border bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="اسم المستخدم" />
        <input name="password" type="password" required className="w-full px-6 py-4 rounded-2xl border bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="كلمة السر" />
        <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all">دخول</button>
      </form>
    </div>
  </div>
);

const AdminDashboard: React.FC<{ 
  products: Product[], 
  orders: Order[], 
  admins: AdminUser[], 
  landingPages: LandingPage[],
  setProducts: any, 
  setAdmins: any,
  setLandingPages: any,
  onLogout: () => void, 
  currentUser: AdminUser,
  openLP: (lp: LandingPage) => void
}> = ({ products, orders, admins, landingPages, setProducts, setAdmins, setLandingPages, onLogout, currentUser, openLP }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'team'>('orders');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isCreatingLP, setIsCreatingLP] = useState(false);
  const [selectedProductForLP, setSelectedProductForLP] = useState<Product | null>(null);

  const handleCreateLP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProductForLP) return;
    const formData = new FormData(e.currentTarget);
    const customPrice = parseInt(formData.get('price') as string);
    
    if (customPrice < selectedProductForLP.price) {
      alert(`عذراً، لا يمكنك تحديد سعر أقل من سعر المدير (${selectedProductForLP.price} دج)`);
      return;
    }

    const newLP: LandingPage = {
      id: Math.random().toString(36).substr(2, 9),
      productId: selectedProductForLP.id,
      creatorId: currentUser.id,
      customPrice,
      slug: `lp-${Math.random().toString(36).substr(2, 5)}`
    };

    setLandingPages([...landingPages, newLP]);
    setIsCreatingLP(false);
    setSelectedProductForLP(null);
    alert('تم إنشاء صفحة الهبوط بنجاح! يمكنك الآن نسخ الرابط وبدء التسويق.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">لوحة التحكم</h2>
          <p className="text-gray-400 font-medium">مرحباً {currentUser.name} | رصيدك الحالي: <span className="text-indigo-600 font-black">{currentUser.balance.toLocaleString()} دج</span></p>
        </div>
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border overflow-x-auto max-w-full no-scrollbar">
          <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>الطلبات</button>
          <button onClick={() => setActiveTab('products')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>المخزون</button>
          <button onClick={() => setActiveTab('team')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'team' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>الفريق والأرباح</button>
          <button onClick={onLogout} className="px-5 py-2.5 rounded-xl text-sm font-bold text-rose-500 flex items-center gap-2 hover:bg-rose-50 transition-all whitespace-nowrap"><LogOut size={16} /> خروج</button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-right min-w-[600px]">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black">
              <tr>
                <th className="p-5">العميل</th>
                <th className="p-5">المبلغ والعمولة</th>
                <th className="p-5">الحالة</th>
                <th className="p-5">المسوق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(currentUser.role === 'admin' ? orders : orders.filter(o => o.referralId === currentUser.id)).map(o => (
                <tr key={o.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="p-5">
                    <div className="font-bold">{o.customerName}</div>
                    <div className="text-[10px] text-gray-400">{o.phone}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-black text-indigo-600">{o.total.toLocaleString()} دج</div>
                    {o.commission && <div className="text-[10px] text-green-500 font-bold">+ عمولة: {o.commission.toLocaleString()} دج</div>}
                  </td>
                  <td className="p-5"><span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-lg text-[10px] font-black">{o.status}</span></td>
                  <td className="p-5 text-gray-400 text-xs font-medium">{admins.find(a => a.id === o.referralId)?.name || 'مباشر'}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={4} className="p-20 text-center text-gray-300 font-bold">لا توجد طلبات مسجلة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black">إدارة المنتجات</h3>
            {currentUser.role === 'admin' && (
              <button onClick={() => alert('إضافة منتج قريباً...')} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2">
                <Plus size={18} /> منتج جديد
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <img src={p.image} className="w-full aspect-video object-cover" />
                <div className="p-6">
                  <h4 className="font-black mb-2">{p.name}</h4>
                  <p className="text-2xl font-black text-indigo-600">{p.price.toLocaleString()} دج</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(currentUser.role === 'admin' ? admins : admins.filter(a => a.id === currentUser.id)).map(a => (
              <div key={a.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 text-right">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">{a.name.charAt(0)}</div>
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{a.role === 'admin' ? 'مدير عام' : 'مسوق معتمد'}</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-1">{a.name}</h4>
                  <p className="text-xs text-gray-400 mb-6">@{a.username}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                    <span className="text-[10px] font-black text-gray-400 block mb-1">الرصيد المتاح</span>
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-indigo-600" />
                      <span className="text-2xl font-black text-indigo-600">{a.balance.toLocaleString()} دج</span>
                    </div>
                  </div>

                  {currentUser.role === 'admin' && a.id === currentUser.id && (
                    <button onClick={() => setIsAddingAdmin(true)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                      إضافة مسوق للفريق <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform">
                  <Wallet size={120} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">صفحات الهبوط (روابط التسويق)</h3>
              <button onClick={() => setIsCreatingLP(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all">
                <LinkIcon size={18} /> إنشاء رابط جديد
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landingPages.filter(lp => lp.creatorId === currentUser.id).map(lp => (
                <div key={lp.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                      <ExternalLink size={24} />
                    </div>
                    <div>
                      <h5 className="font-black text-sm">{products.find(p => p.id === lp.productId)?.name}</h5>
                      <p className="text-[10px] text-gray-400 font-bold">السعر: {lp.customPrice.toLocaleString()} دج</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openLP(lp)} className="p-3 bg-white text-gray-400 rounded-xl hover:text-indigo-600 transition-all shadow-sm">
                      <ArrowUpRight size={18} />
                    </button>
                    <button onClick={() => setLandingPages(landingPages.filter(x => x.id !== lp.id))} className="p-3 bg-rose-50 text-rose-300 rounded-xl hover:text-rose-600 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {landingPages.filter(lp => lp.creatorId === currentUser.id).length === 0 && (
                <div className="col-span-2 py-10 text-center text-gray-400 font-medium bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  لا توجد روابط تسويقية حالياً.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Landing Page Creator Modal */}
      {isCreatingLP && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in duration-300 text-right">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">إنشاء رابط تسويقي</h3>
              <button onClick={() => { setIsCreatingLP(false); setSelectedProductForLP(null); }} className="bg-gray-100 p-2.5 rounded-full hover:bg-gray-200"><X size={20} /></button>
            </div>
            
            {!selectedProductForLP ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 font-bold mb-4">اختر المنتج:</p>
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                  {products.map(p => (
                    <button key={p.id} onClick={() => setSelectedProductForLP(p)} className="flex items-center gap-4 p-4 rounded-2xl border hover:border-indigo-600 hover:bg-indigo-50 transition-all text-right">
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-sm">{p.name}</div>
                        <div className="text-[10px] text-indigo-600 font-black">سعر المدير: {p.price.toLocaleString()} دج</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateLP} className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
                  <img src={selectedProductForLP.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                  <div>
                    <h4 className="font-black text-indigo-900">{selectedProductForLP.name}</h4>
                    <p className="text-xs text-indigo-600/70 font-bold">أدنى سعر: {selectedProductForLP.price.toLocaleString()} دج</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">حدد سعر البيع الخاص بك</label>
                  <div className="relative">
                    <input name="price" type="number" required min={selectedProductForLP.price} defaultValue={selectedProductForLP.price + 1000} className="w-full px-6 py-4 rounded-2xl border bg-gray-50 focus:bg-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-black text-xl" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">دج</span>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all">
                  إنشاء الرابط
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Team Member Addition Modal */}
      {isAddingAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl text-right">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">إضافة مسوق جديد</h3>
              <button onClick={() => setIsAddingAdmin(false)}><X size={24} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newAdmin: AdminUser = {
                id: Date.now().toString(),
                name: formData.get('name') as string,
                username: formData.get('username') as string,
                password: formData.get('password') as string,
                role: 'manager',
                balance: 0
              };
              setAdmins([...admins, newAdmin]);
              setIsAddingAdmin(false);
              alert('تمت إضافة المسوق بنجاح!');
            }} className="space-y-4">
              <input name="name" required className="w-full px-6 py-4 border rounded-2xl bg-gray-50 outline-none" placeholder="الاسم الكامل" />
              <input name="username" required className="w-full px-6 py-4 border rounded-2xl bg-gray-50 outline-none" placeholder="اسم المستخدم" />
              <input name="password" type="password" required className="w-full px-6 py-4 border rounded-2xl bg-gray-50 outline-none" placeholder="كلمة السر" />
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl">حفظ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
