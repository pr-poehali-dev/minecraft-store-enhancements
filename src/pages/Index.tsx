import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ======================== TYPES ========================
type Page = "home" | "catalog" | "cart" | "profile" | "admin" | "support";
type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  balance: number;
  purchases: string[];
  registeredAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  rarity: Rarity;
  category: string;
  inStock: boolean;
  sold: number;
}

interface PromoCode {
  code: string;
  discount: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

interface CartItem {
  product: Product;
  qty: number;
}

interface SiteSettings {
  serverName: string;
  serverIp: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  showAnnouncement: boolean;
}

interface Order {
  id: string;
  userId: string;
  username: string;
  items: CartItem[];
  total: number;
  promo: string;
  discount: number;
  paymentMethod: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
}

// ======================== DEFAULT DATA ========================
const DEFAULT_PRODUCTS: Product[] = [
  { id: "1", name: "VIP Привилегия", description: "Доступ к VIP командам, цветной ник, приоритет входа", price: 299, emoji: "⭐", rarity: "uncommon", category: "Привилегии", inStock: true, sold: 142 },
  { id: "2", name: "MVP Привилегия", description: "Все VIP преимущества + эксклюзивные питомцы и частицы", price: 599, emoji: "💎", rarity: "rare", category: "Привилегии", inStock: true, sold: 87 },
  { id: "3", name: "LEGEND Статус", description: "Максимальная привилегия. Редкие команды, уникальный плащ", price: 1299, emoji: "👑", rarity: "legendary", category: "Привилегии", inStock: true, sold: 23 },
  { id: "4", name: "Алмазный меч", description: "Заточенный алмазный меч с зачарованием Острота V", price: 149, emoji: "⚔️", rarity: "rare", category: "Оружие", inStock: true, sold: 234 },
  { id: "5", name: "Кирка Удачи", description: "Кирка с зачарованием Удача III и Эффективность V", price: 199, emoji: "⛏️", rarity: "epic", category: "Инструменты", inStock: true, sold: 156 },
  { id: "6", name: "Зелье силы", description: "Зелье Силы II на 8 минут. Стак: 16 штук", price: 79, emoji: "🧪", rarity: "common", category: "Зелья", inStock: true, sold: 489 },
  { id: "7", name: "Эндер-сундук", description: "Персональный сундук доступный из любой точки мира", price: 249, emoji: "📦", rarity: "epic", category: "Предметы", inStock: true, sold: 98 },
  { id: "8", name: "Набор строителя", description: "64 блока из 20 видов материалов для строительства", price: 399, emoji: "🏗️", rarity: "uncommon", category: "Строительство", inStock: false, sold: 67 },
];

const DEFAULT_PROMOS: PromoCode[] = [
  { code: "WELCOME", discount: 20, usageLimit: 100, usedCount: 45, active: true },
  { code: "VIP2024", discount: 50, usageLimit: 50, usedCount: 12, active: true },
];

const DEFAULT_SETTINGS: SiteSettings = {
  serverName: "MineShop",
  serverIp: "play.mineshop.ru",
  heroTitle: "Магазин привилегий",
  heroSubtitle: "Лучшие предметы для вашего приключения",
  announcement: "Скидка 20% на все привилегии по промокоду WELCOME!",
  showAnnouncement: true,
};

// ======================== STORAGE HELPERS ========================
function loadData<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch { return def; }
}
function saveData<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ======================== RARITY CONFIG ========================
const RARITY_LABELS: Record<Rarity, string> = {
  common: "Обычный",
  uncommon: "Необычный",
  rare: "Редкий",
  epic: "Эпический",
  legendary: "Легендарный",
};
const RARITY_COLORS: Record<Rarity, string> = {
  common: "#aaaaaa",
  uncommon: "#55FF55",
  rare: "#5599FF",
  epic: "#AA55FF",
  legendary: "#FFAA00",
};

// ======================== NAVBAR ========================
function Navbar({ page, setPage, user, cart, onAuthClick }: {
  page: Page;
  setPage: (p: Page) => void;
  user: User | null;
  cart: CartItem[];
  onAuthClick: () => void;
}) {
  const settings = loadData<SiteSettings>("mc_settings", DEFAULT_SETTINGS);
  const nav = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "catalog", label: "Каталог", icon: "ShoppingBag" },
    { id: "cart", label: "Корзина", icon: "ShoppingCart" },
    { id: "profile", label: "Профиль", icon: "User" },
    { id: "support", label: "Поддержка", icon: "MessageCircle" },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 mc-card" style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <button onClick={() => setPage("home")} className="flex items-center gap-2">
          <span className="text-2xl">⛏️</span>
          <span className="font-pixel text-mc-green text-xs hidden sm:block">{settings.serverName}</span>
        </button>
        <div className="flex items-center gap-1">
          {nav.map(n => (
            <button
              key={n.id}
              onClick={() => setPage(n.id as Page)}
              className={`relative flex items-center gap-1 px-2 sm:px-3 py-2 text-xs font-medium transition-all ${
                page === n.id ? "text-mc-green bg-mc-green/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon name={n.icon} size={16} />
              <span className="hidden md:block">{n.label}</span>
              {n.id === "cart" && cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-mc-gold text-black text-[9px] font-bold flex items-center justify-center font-pixel">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </button>
          ))}
          {user?.isAdmin && (
            <button
              onClick={() => setPage("admin")}
              className={`flex items-center gap-1 px-2 sm:px-3 py-2 text-xs font-medium transition-all ${
                page === "admin" ? "text-mc-gold bg-mc-gold/10" : "text-mc-gold/70 hover:text-mc-gold hover:bg-mc-gold/5"
              }`}
            >
              <Icon name="Shield" size={16} />
              <span className="hidden md:block">Админ</span>
            </button>
          )}
          {!user && (
            <button onClick={onAuthClick} className="mc-btn ml-2 px-3 py-1.5 text-xs text-white font-bold">
              Войти
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function Announcement() {
  const settings = loadData<SiteSettings>("mc_settings", DEFAULT_SETTINGS);
  if (!settings.showAnnouncement || !settings.announcement) return null;
  return (
    <div className="bg-mc-gold/20 border-b border-mc-gold/30 px-4 py-2 text-center">
      <span className="text-mc-gold text-xs font-medium">📢 {settings.announcement}</span>
    </div>
  );
}

// ======================== AUTH MODAL ========================
function AuthModal({ onAuth, onClose, mode }: {
  onAuth: (user: User) => void;
  onClose: () => void;
  mode: "login" | "register";
}) {
  const [tab, setTab] = useState<"login" | "register">(mode);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState({ q: "", answer: "", userAnswer: "" });

  useEffect(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ q: `${a} + ${b}`, answer: String(a + b), userAnswer: "" });
  }, [tab]);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleLogin = () => {
    setError("");
    const users = loadData<User[]>("mc_users", []);
    const found = users.find(u => u.username === form.username && u.password === form.password);
    if (!found) { setError("Неверный логин или пароль"); return; }
    saveData("mc_current_user", found.id);
    onAuth(found);
  };

  const handleRegister = () => {
    setError("");
    if (!form.username || !form.email || !form.password) { setError("Заполните все поля"); return; }
    if (form.password !== form.confirm) { setError("Пароли не совпадают"); return; }
    if (form.password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    if (captcha.userAnswer.trim() !== captcha.answer) { setError("Неверный ответ на проверку"); return; }
    const users = loadData<User[]>("mc_users", []);
    if (users.find(u => u.username === form.username)) { setError("Имя пользователя занято"); return; }
    if (users.find(u => u.email === form.email)) { setError("Email уже зарегистрирован"); return; }
    const newUser: User = {
      id: Date.now().toString(),
      username: form.username,
      email: form.email,
      password: form.password,
      isAdmin: users.length === 0,
      balance: 0,
      purchases: [],
      registeredAt: new Date().toISOString(),
    };
    saveData("mc_users", [...users, newUser]);
    saveData("mc_current_user", newUser.id);
    onAuth(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in" onClick={onClose}>
      <div className="mc-card w-full max-w-md mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <span className="font-pixel text-mc-green text-xs">⛏️ MineShop</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="flex mb-6 gap-2">
          {(["login", "register"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2 text-sm font-bold transition-all ${tab === t ? "mc-btn text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {t === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {tab === "register" && (
            <input className="mc-input w-full px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={f("email")} />
          )}
          <input className="mc-input w-full px-3 py-2 text-sm" placeholder="Имя игрока" value={form.username} onChange={f("username")} />
          <input className="mc-input w-full px-3 py-2 text-sm" placeholder="Пароль" type="password" value={form.password} onChange={f("password")} />
          {tab === "register" && (
            <>
              <input className="mc-input w-full px-3 py-2 text-sm" placeholder="Повторите пароль" type="password" value={form.confirm} onChange={f("confirm")} />
              <div className="mc-card p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  🤖 Проверка на робота: сколько будет <span className="text-mc-green font-bold">{captcha.q}</span>?
                </p>
                <input className="mc-input w-full px-3 py-2 text-sm" placeholder="Ваш ответ"
                  value={captcha.userAnswer} onChange={e => setCaptcha(p => ({ ...p, userAnswer: e.target.value }))} />
              </div>
            </>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button className="mc-btn w-full py-3 text-sm font-bold text-white"
            onClick={tab === "login" ? handleLogin : handleRegister}>
            {tab === "login" ? "Войти на сервер" : "Создать аккаунт"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== BUY MODAL ========================
function BuyModal({ product, onClose, onBuy, user }: {
  product: Product;
  onClose: () => void;
  onBuy: (method: string, promo: string, finalPrice: number) => void;
  user: User | null;
}) {
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");
  const [method, setMethod] = useState("yookassa");

  const promos = loadData<PromoCode[]>("mc_promos", DEFAULT_PROMOS);
  const discount = promoApplied ? Math.floor(product.price * promoApplied.discount / 100) : 0;
  const finalPrice = Math.max(0, product.price - discount);

  const applyPromo = () => {
    const found = promos.find(p => p.code.toUpperCase() === promo.toUpperCase() && p.active);
    if (!found) { setPromoError("Промокод не найден или неактивен"); return; }
    if (found.usedCount >= found.usageLimit) { setPromoError("Лимит промокода исчерпан"); return; }
    setPromoApplied(found);
    setPromoError("");
  };

  const methods = [
    { id: "yookassa", label: "ЮKassa", icon: "💳" },
    { id: "paypal", label: "PayPal", icon: "🌐" },
    { id: "freekassa", label: "FreeKassa", icon: "⚡" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in" onClick={onClose}>
      <div className="mc-card w-full max-w-md mx-4 p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-lg">Покупка предмета</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
        </div>
        <div className="mc-card p-4 mb-4 flex items-center gap-4">
          <span className="text-5xl">{product.emoji}</span>
          <div>
            <p className="font-bold text-foreground" style={{ color: RARITY_COLORS[product.rarity] }}>{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.description}</p>
            <p className="text-mc-gold font-bold mt-1">{product.price} ₽</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Промокод</p>
          <div className="flex gap-2">
            <input className="mc-input flex-1 px-3 py-2 text-sm" placeholder="ВВЕДИТЕ КОД"
              value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} />
            <button onClick={applyPromo} className="mc-btn px-4 py-2 text-xs text-white font-bold">Применить</button>
          </div>
          {promoError && <p className="text-red-400 text-xs mt-1">{promoError}</p>}
          {promoApplied && <p className="text-mc-green text-xs mt-1">✓ Скидка {promoApplied.discount}% применена!</p>}
        </div>
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Способ оплаты</p>
          <div className="grid grid-cols-3 gap-2">
            {methods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`mc-card p-3 text-center transition-all ${method === m.id ? "border-mc-green" : "hover:border-mc-green/50"}`}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="mc-card p-3 mb-4">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Цена:</span><span>{product.price} ₽</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Скидка:</span><span className="text-mc-green">-{discount} ₽</span></div>}
          <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border">
            <span>Итого:</span><span className="text-mc-gold text-lg">{finalPrice} ₽</span>
          </div>
        </div>
        <button onClick={() => onBuy(method, promoApplied?.code || "", finalPrice)}
          className="mc-btn-gold w-full py-3 text-sm font-bold">
          {finalPrice === 0 ? "🎁 Получить бесплатно" : `💳 Оплатить ${finalPrice} ₽`}
        </button>
      </div>
    </div>
  );
}

// ======================== HOME PAGE ========================
function HomePage({ setPage, user, onAuthClick }: {
  setPage: (p: Page) => void;
  user: User | null;
  onAuthClick: () => void;
}) {
  const settings = loadData<SiteSettings>("mc_settings", DEFAULT_SETTINGS);
  const products = loadData<Product[]>("mc_products", DEFAULT_PRODUCTS);
  const orders = loadData<Order[]>("mc_orders", []);
  const users = loadData<User[]>("mc_users", []);
  const totalSales = orders.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.filter(o => o.status === "completed").length;
  const featured = products.filter(p => p.inStock).slice(0, 3);

  return (
    <div className="animate-fade-in">
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(76,175,80,0.3) 15px, rgba(76,175,80,0.3) 16px), repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(76,175,80,0.3) 15px, rgba(76,175,80,0.3) 16px)"
        }} />
        <div className="animate-float text-8xl mb-6">⛏️</div>
        <h1 className="font-pixel text-mc-green text-xl sm:text-2xl mb-4 leading-loose">{settings.heroTitle}</h1>
        <p className="text-muted-foreground text-lg mb-2 max-w-xl">{settings.heroSubtitle}</p>
        <p className="text-mc-green font-bold text-sm mb-8 font-pixel">{settings.serverIp}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => setPage("catalog")} className="mc-btn px-8 py-3 text-white font-bold">🛍️ Перейти в магазин</button>
          {!user && <button onClick={onAuthClick} className="mc-btn-gold px-8 py-3 font-bold">⚡ Регистрация</button>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Игроков", value: users.length.toString(), icon: "👥" },
            { label: "Товаров", value: products.length.toString(), icon: "📦" },
            { label: "Продаж", value: totalOrders.toString(), icon: "💰" },
            { label: "Выручка", value: `${totalSales} ₽`, icon: "📈" },
          ].map(s => (
            <div key={s.label} className="mc-card p-4 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-pixel text-mc-green text-sm">{s.value}</div>
              <div className="text-muted-foreground text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="font-pixel text-mc-green text-sm mb-6">⭐ Популярные предметы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {featured.map(p => (
            <div key={p.id} className="mc-card p-5 hover:border-mc-green/50 transition-all">
              <div className="text-5xl text-center mb-3">{p.emoji}</div>
              <h3 className="font-bold text-center mb-1" style={{ color: RARITY_COLORS[p.rarity] }}>{p.name}</h3>
              <p className="text-xs text-muted-foreground text-center mb-3">{p.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-mc-gold font-bold">{p.price} ₽</span>
                <button onClick={() => setPage("catalog")} className="mc-btn px-3 py-1 text-xs text-white font-bold">Купить</button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Мгновенная выдача", desc: "Предметы поступают на аккаунт автоматически" },
            { icon: "🔒", title: "Безопасная оплата", desc: "ЮKassa, PayPal и FreeKassa" },
            { icon: "💬", title: "Поддержка 24/7", desc: "Помогаем решить любые вопросы" },
          ].map(f => (
            <div key={f.title} className="mc-card p-5 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======================== CATALOG PAGE ========================
function CatalogPage({ onAddToCart, user, onAuthClick }: {
  onAddToCart: (p: Product) => void;
  user: User | null;
  onAuthClick: () => void;
}) {
  const [products, setProducts] = useState<Product[]>(() => loadData("mc_products", DEFAULT_PRODUCTS));
  const [category, setCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const categories = ["Все", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p =>
    (category === "Все" || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleBuy = (method: string, promo: string, finalPrice: number) => {
    if (!buyProduct) return;
    const promos = loadData<PromoCode[]>("mc_promos", DEFAULT_PROMOS);
    if (promo) {
      saveData("mc_promos", promos.map(p => p.code === promo ? { ...p, usedCount: p.usedCount + 1 } : p));
    }
    const orders = loadData<Order[]>("mc_orders", []);
    const order: Order = {
      id: Date.now().toString(),
      userId: user?.id || "guest",
      username: user?.username || "Гость",
      items: [{ product: buyProduct, qty: 1 }],
      total: finalPrice,
      promo,
      discount: buyProduct.price - finalPrice,
      paymentMethod: method,
      date: new Date().toISOString(),
      status: "completed",
    };
    saveData("mc_orders", [...orders, order]);
    const updProds = products.map(p => p.id === buyProduct.id ? { ...p, sold: p.sold + 1 } : p);
    saveData("mc_products", updProds);
    setProducts(updProds);
    if (user) {
      const users = loadData<User[]>("mc_users", []);
      saveData("mc_users", users.map(u => u.id === user.id ? { ...u, purchases: [...u.purchases, buyProduct.id] } : u));
    }
    setBuyProduct(null);
    setSuccessMsg(`✅ ${buyProduct.name} куплен! Проверьте профиль.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {successMsg && (
        <div className="mc-card p-4 mb-4 text-mc-green font-bold text-sm animate-fade-in" style={{ borderColor: "#4CAF50" }}>
          {successMsg}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input className="mc-input flex-1 px-4 py-3" placeholder="🔍 Поиск предметов..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-2 text-xs font-bold transition-all ${category === c ? "mc-btn text-white" : "mc-card text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="mc-card p-5 flex flex-col hover:border-mc-green/40 transition-all">
            <div className="text-center mb-3"><span className="text-5xl">{p.emoji}</span></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase" style={{ color: RARITY_COLORS[p.rarity] }}>{RARITY_LABELS[p.rarity]}</span>
              <span className="text-xs text-muted-foreground">{p.category}</span>
            </div>
            <h3 className="font-bold mb-1" style={{ color: RARITY_COLORS[p.rarity] }}>{p.name}</h3>
            <p className="text-xs text-muted-foreground flex-1 mb-3">{p.description}</p>
            <div className="text-xs text-muted-foreground mb-3">Продано: {p.sold}</div>
            <div className="flex items-center justify-between">
              <span className="text-mc-gold font-pixel text-sm">{p.price}₽</span>
              <div className="flex gap-2">
                <button onClick={() => { if (!user) { onAuthClick(); return; } onAddToCart(p); }}
                  disabled={!p.inStock} className="mc-card px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40" title="В корзину">
                  <Icon name="ShoppingCart" size={14} />
                </button>
                <button onClick={() => { if (!user) { onAuthClick(); return; } setBuyProduct(p); }}
                  disabled={!p.inStock} className="mc-btn px-3 py-1 text-xs text-white font-bold disabled:opacity-40">
                  {p.inStock ? "Купить" : "Нет"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {buyProduct && <BuyModal product={buyProduct} onClose={() => setBuyProduct(null)} onBuy={handleBuy} user={user} />}
    </div>
  );
}

// ======================== CART PAGE ========================
function CartPage({ cart, setCart, user, onAuthClick }: {
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  user: User | null;
  onAuthClick: () => void;
}) {
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");
  const [method, setMethod] = useState("yookassa");
  const [success, setSuccess] = useState("");

  const promos = loadData<PromoCode[]>("mc_promos", DEFAULT_PROMOS);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discount = promoApplied ? Math.floor(subtotal * promoApplied.discount / 100) : 0;
  const total = Math.max(0, subtotal - discount);

  const update = (id: string, delta: number) => {
    setCart(cart.map(i => i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const applyPromo = () => {
    const found = promos.find(p => p.code.toUpperCase() === promo.toUpperCase() && p.active);
    if (!found) { setPromoError("Промокод не найден"); return; }
    if (found.usedCount >= found.usageLimit) { setPromoError("Лимит исчерпан"); return; }
    setPromoApplied(found);
    setPromoError("");
  };

  const checkout = () => {
    if (!user) { onAuthClick(); return; }
    if (cart.length === 0) return;
    if (promoApplied) {
      saveData("mc_promos", promos.map(p => p.code === promoApplied.code ? { ...p, usedCount: p.usedCount + 1 } : p));
    }
    const orders = loadData<Order[]>("mc_orders", []);
    const order: Order = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      items: [...cart],
      total,
      promo: promoApplied?.code || "",
      discount,
      paymentMethod: method,
      date: new Date().toISOString(),
      status: "completed",
    };
    saveData("mc_orders", [...orders, order]);
    setCart([]);
    setSuccess(`✅ Заказ оформлен! Итого: ${total} ₽`);
    setTimeout(() => setSuccess(""), 5000);
  };

  if (cart.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
      {success && <div className="mc-card p-4 mb-8 text-mc-green font-bold">{success}</div>}
      <div className="text-8xl mb-4">🛒</div>
      <p className="font-pixel text-muted-foreground text-xs">Корзина пуста</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-pixel text-mc-green text-sm mb-6">🛒 Корзина</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.product.id} className="mc-card p-4 flex items-center gap-4">
              <span className="text-4xl">{item.product.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold">{item.product.name}</h3>
                <p className="text-xs text-muted-foreground">{item.product.price} ₽ / шт</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => update(item.product.id, -1)} className="mc-card w-7 h-7 flex items-center justify-center hover:text-mc-green">-</button>
                <span className="font-bold w-6 text-center">{item.qty}</span>
                <button onClick={() => update(item.product.id, 1)} className="mc-card w-7 h-7 flex items-center justify-center hover:text-mc-green">+</button>
              </div>
              <span className="text-mc-gold font-bold">{item.product.price * item.qty} ₽</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="mc-card p-4">
            <p className="text-xs text-muted-foreground mb-2">Промокод</p>
            <div className="flex gap-2">
              <input className="mc-input flex-1 px-3 py-2 text-sm" placeholder="КОД" value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} />
              <button onClick={applyPromo} className="mc-btn px-3 py-2 text-xs text-white font-bold">OK</button>
            </div>
            {promoError && <p className="text-red-400 text-xs mt-1">{promoError}</p>}
            {promoApplied && <p className="text-mc-green text-xs mt-1">✓ -{promoApplied.discount}%</p>}
          </div>
          <div className="mc-card p-4">
            <p className="text-xs text-muted-foreground mb-3">Оплата</p>
            {[{ id: "yookassa", label: "💳 ЮKassa" }, { id: "paypal", label: "🌐 PayPal" }, { id: "freekassa", label: "⚡ FreeKassa" }].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`w-full text-left px-3 py-2 text-sm mb-2 mc-card transition-all ${method === m.id ? "border-mc-green text-mc-green" : "text-muted-foreground"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="mc-card p-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Товары:</span><span>{subtotal} ₽</span></div>
            {discount > 0 && <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Скидка:</span><span className="text-mc-green">-{discount} ₽</span></div>}
            <div className="flex justify-between font-bold pt-2 border-t border-border"><span>Итого:</span><span className="text-mc-gold">{total} ₽</span></div>
          </div>
          <button onClick={checkout} className="mc-btn-gold w-full py-3 font-bold">💳 Оплатить</button>
        </div>
      </div>
    </div>
  );
}

// ======================== PROFILE PAGE ========================
function ProfilePage({ user, setUser, setPage }: {
  user: User | null;
  setUser: (u: User | null) => void;
  setPage: (p: Page) => void;
}) {
  const [tab, setTab] = useState<"info" | "purchases" | "password">("info");
  const [newPass, setNewPass] = useState({ old: "", new1: "", new2: "" });
  const [passMsg, setPassMsg] = useState("");

  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="text-8xl mb-4">👤</div>
      <p className="font-pixel text-muted-foreground text-xs mb-6">Войдите в аккаунт</p>
      <button onClick={() => setPage("home")} className="mc-btn px-8 py-3 text-white font-bold">На главную</button>
    </div>
  );

  const orders = loadData<Order[]>("mc_orders", []).filter(o => o.userId === user.id);
  const totalSpent = orders.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0);

  const logout = () => {
    localStorage.removeItem("mc_current_user");
    setUser(null);
    setPage("home");
  };

  const changePassword = () => {
    if (newPass.old !== user.password) { setPassMsg("❌ Неверный текущий пароль"); return; }
    if (newPass.new1.length < 6) { setPassMsg("❌ Минимум 6 символов"); return; }
    if (newPass.new1 !== newPass.new2) { setPassMsg("❌ Пароли не совпадают"); return; }
    const users = loadData<User[]>("mc_users", []);
    saveData("mc_users", users.map(u => u.id === user.id ? { ...u, password: newPass.new1 } : u));
    setUser({ ...user, password: newPass.new1 });
    setPassMsg("✅ Пароль изменён!");
    setNewPass({ old: "", new1: "", new2: "" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mc-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 mc-card flex items-center justify-center text-3xl">{user.isAdmin ? "👑" : "🧑‍💻"}</div>
            <div>
              <h2 className="font-pixel text-mc-green text-sm">{user.username}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              {user.isAdmin && <span className="text-mc-gold text-xs font-bold">АДМИНИСТРАТОР</span>}
            </div>
          </div>
          <button onClick={logout} className="mc-btn-red px-4 py-2 text-sm font-bold flex items-center gap-2">
            <Icon name="LogOut" size={16} /> Выйти
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center"><div className="font-pixel text-mc-green text-sm">{orders.length}</div><div className="text-xs text-muted-foreground">Заказов</div></div>
          <div className="text-center"><div className="font-pixel text-mc-gold text-sm">{totalSpent} ₽</div><div className="text-xs text-muted-foreground">Потрачено</div></div>
          <div className="text-center"><div className="font-pixel text-foreground text-xs">{new Date(user.registeredAt).toLocaleDateString("ru")}</div><div className="text-xs text-muted-foreground">Регистрация</div></div>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        {([["info", "Данные"], ["purchases", "Покупки"], ["password", "Пароль"]] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-bold transition-all ${tab === t ? "mc-btn text-white" : "mc-card text-muted-foreground"}`}>{l}</button>
        ))}
      </div>
      {tab === "info" && (
        <div className="mc-card p-4 space-y-3">
          {[["Игрок", user.username], ["Email", user.email], ["Роль", user.isAdmin ? "Администратор" : "Пользователь"]].map(([l, v]) => (
            <div key={l} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-muted-foreground text-sm">{l}</span>
              <span className="font-bold text-sm">{v}</span>
            </div>
          ))}
        </div>
      )}
      {tab === "purchases" && (
        <div className="space-y-3">
          {orders.length === 0
            ? <div className="mc-card p-8 text-center text-muted-foreground text-sm">Покупок пока нет</div>
            : orders.map(o => (
              <div key={o.id} className="mc-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">Заказ #{o.id.slice(-6)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleString("ru")}</p>
                    <p className="text-xs text-muted-foreground">{o.items.map(i => i.product.name).join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-mc-gold font-bold">{o.total} ₽</p>
                    <p className="text-xs text-mc-green">✓ Выполнен</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
      {tab === "password" && (
        <div className="mc-card p-4 space-y-3 max-w-sm">
          <input className="mc-input w-full px-3 py-2 text-sm" type="password" placeholder="Текущий пароль" value={newPass.old} onChange={e => setNewPass(p => ({ ...p, old: e.target.value }))} />
          <input className="mc-input w-full px-3 py-2 text-sm" type="password" placeholder="Новый пароль" value={newPass.new1} onChange={e => setNewPass(p => ({ ...p, new1: e.target.value }))} />
          <input className="mc-input w-full px-3 py-2 text-sm" type="password" placeholder="Повторите пароль" value={newPass.new2} onChange={e => setNewPass(p => ({ ...p, new2: e.target.value }))} />
          {passMsg && <p className={`text-xs ${passMsg.startsWith("✅") ? "text-mc-green" : "text-red-400"}`}>{passMsg}</p>}
          <button onClick={changePassword} className="mc-btn px-6 py-2 text-sm text-white font-bold">Изменить пароль</button>
        </div>
      )}
    </div>
  );
}

// ======================== ADMIN PAGE ========================
function AdminPage({ user }: { user: User | null }) {
  const [tab, setTab] = useState<"stats" | "products" | "promos" | "orders" | "users" | "settings">("stats");
  const [products, setProducts] = useState<Product[]>(() => loadData("mc_products", DEFAULT_PRODUCTS));
  const [promos, setPromos] = useState<PromoCode[]>(() => loadData("mc_promos", DEFAULT_PROMOS));
  const [settings, setSettings] = useState<SiteSettings>(() => loadData("mc_settings", DEFAULT_SETTINGS));
  const [orders] = useState<Order[]>(() => loadData("mc_orders", []));
  const [users] = useState<User[]>(() => loadData("mc_users", []));
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newPromo, setNewPromo] = useState({ code: "", discount: 20, usageLimit: 100 });
  const [saved, setSaved] = useState("");

  if (!user?.isAdmin) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="text-8xl mb-4">🚫</div>
      <p className="font-pixel text-red-400 text-xs">Доступ запрещён</p>
    </div>
  );

  const saveSettings = () => {
    saveData("mc_settings", settings);
    setSaved("✅ Настройки сохранены и применены!");
    setTimeout(() => setSaved(""), 3000);
  };

  const saveProds = (p: Product[]) => { setProducts(p); saveData("mc_products", p); };
  const savePromos = (p: PromoCode[]) => { setPromos(p); saveData("mc_promos", p); };

  const addPromo = () => {
    if (!newPromo.code) return;
    savePromos([...promos, { ...newPromo, code: newPromo.code.toUpperCase(), usedCount: 0, active: true }]);
    setNewPromo({ code: "", discount: 20, usageLimit: 100 });
  };

  const BLANK: Product = { id: "", name: "", description: "", price: 0, emoji: "📦", rarity: "common", category: "Прочее", inStock: true, sold: 0 };

  const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0);
  const completedOrders = orders.filter(o => o.status === "completed").length;

  const tabs = [
    { id: "stats", label: "📊 Статистика" },
    { id: "products", label: "📦 Товары" },
    { id: "promos", label: "🎫 Промокоды" },
    { id: "orders", label: "📋 Заказы" },
    { id: "users", label: "👥 Игроки" },
    { id: "settings", label: "⚙️ Сайт" },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">👑</span>
        <h1 className="font-pixel text-mc-gold text-sm">Панель администратора</h1>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-bold transition-all ${tab === t.id ? "mc-btn-gold" : "mc-card text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { l: "Выручка", v: `${totalRevenue} ₽`, c: "text-mc-gold", i: "💰" },
              { l: "Заказов", v: completedOrders, c: "text-mc-green", i: "📋" },
              { l: "Игроков", v: users.length, c: "text-blue-400", i: "👥" },
              { l: "Товаров", v: products.length, c: "text-foreground", i: "📦" },
            ].map(s => (
              <div key={s.l} className="mc-card p-4 text-center">
                <div className="text-3xl mb-2">{s.i}</div>
                <div className={`font-pixel text-sm ${s.c}`}>{s.v}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <h3 className="font-bold mb-3 text-sm">Топ товаров по продажам</h3>
          <div className="space-y-2 mb-6">
            {[...products].sort((a, b) => b.sold - a.sold).slice(0, 5).map((p, i) => (
              <div key={p.id} className="mc-card p-3 flex items-center gap-4">
                <span className="font-pixel text-muted-foreground text-xs w-4">#{i + 1}</span>
                <span className="text-2xl">{p.emoji}</span>
                <span className="flex-1 font-bold text-sm">{p.name}</span>
                <span className="text-muted-foreground text-xs">{p.sold} продаж</span>
                <span className="text-mc-gold text-sm">{p.price * p.sold} ₽</span>
              </div>
            ))}
          </div>
          <h3 className="font-bold mb-3 text-sm">Последние заказы</h3>
          <div className="space-y-2">
            {orders.slice().reverse().slice(0, 5).map(o => (
              <div key={o.id} className="mc-card p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm">{o.username}</span>
                  <span className="text-muted-foreground text-xs ml-2">{new Date(o.date).toLocaleDateString("ru")}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground hidden sm:block">{o.items.map(i => i.product.name).join(", ")}</span>
                  <span className="text-mc-gold font-bold">{o.total} ₽</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Управление товарами</h3>
            <button onClick={() => setEditProduct({ ...BLANK, id: Date.now().toString() })} className="mc-btn px-4 py-2 text-xs text-white font-bold">+ Добавить</button>
          </div>
          {editProduct && (
            <div className="mc-card p-4 mb-4 animate-fade-in">
              <h4 className="font-bold mb-4">{products.find(p => p.id === editProduct.id) ? "Редактировать товар" : "Новый товар"}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="mc-input px-3 py-2 text-sm" placeholder="Название" value={editProduct.name} onChange={e => setEditProduct(p => p ? { ...p, name: e.target.value } : p)} />
                <input className="mc-input px-3 py-2 text-sm" placeholder="Эмодзи" value={editProduct.emoji} onChange={e => setEditProduct(p => p ? { ...p, emoji: e.target.value } : p)} />
                <input className="mc-input px-3 py-2 text-sm" placeholder="Категория" value={editProduct.category} onChange={e => setEditProduct(p => p ? { ...p, category: e.target.value } : p)} />
                <input className="mc-input px-3 py-2 text-sm" type="number" placeholder="Цена ₽" value={editProduct.price} onChange={e => setEditProduct(p => p ? { ...p, price: Number(e.target.value) } : p)} />
                <select className="mc-input px-3 py-2 text-sm" value={editProduct.rarity} onChange={e => setEditProduct(p => p ? { ...p, rarity: e.target.value as Rarity } : p)}>
                  {Object.entries(RARITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="flex items-center gap-3 mc-card px-3 py-2">
                  <span className="text-sm text-muted-foreground">В наличии:</span>
                  <button onClick={() => setEditProduct(p => p ? { ...p, inStock: !p.inStock } : p)}
                    className={`px-4 py-1 text-xs font-bold ${editProduct.inStock ? "mc-btn text-white" : "mc-btn-red"}`}>
                    {editProduct.inStock ? "Да" : "Нет"}
                  </button>
                </div>
                <textarea className="mc-input px-3 py-2 text-sm sm:col-span-2 resize-none h-16" placeholder="Описание"
                  value={editProduct.description} onChange={e => setEditProduct(p => p ? { ...p, description: e.target.value } : p)} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => {
                  const exists = products.find(p => p.id === editProduct.id);
                  saveProds(exists ? products.map(p => p.id === editProduct.id ? editProduct : p) : [...products, editProduct]);
                  setEditProduct(null);
                }} className="mc-btn px-6 py-2 text-sm text-white font-bold">Сохранить</button>
                <button onClick={() => setEditProduct(null)} className="mc-card px-6 py-2 text-sm text-muted-foreground">Отмена</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {products.map(p => (
              <div key={p.id} className="mc-card p-3 flex items-center gap-4">
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1">
                  <span className="font-bold text-sm">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{p.category}</span>
                </div>
                <span className="text-mc-gold text-sm font-bold">{p.price} ₽</span>
                <span className={`text-xs hidden sm:block ${p.inStock ? "text-mc-green" : "text-red-400"}`}>{p.inStock ? "✓ В наличии" : "✗ Нет"}</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditProduct({ ...p })} className="mc-card px-3 py-1 text-xs hover:text-foreground text-muted-foreground">✏️</button>
                  <button onClick={() => saveProds(products.filter(pp => pp.id !== p.id))} className="mc-btn-red px-3 py-1 text-xs">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "promos" && (
        <div className="animate-fade-in">
          <div className="mc-card p-4 mb-4">
            <h4 className="font-bold mb-3">Создать промокод</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input className="mc-input px-3 py-2 text-sm uppercase" placeholder="КОД" value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
              <input className="mc-input px-3 py-2 text-sm" type="number" min="1" max="100" placeholder="Скидка %" value={newPromo.discount} onChange={e => setNewPromo(p => ({ ...p, discount: Number(e.target.value) }))} />
              <input className="mc-input px-3 py-2 text-sm" type="number" placeholder="Лимит" value={newPromo.usageLimit} onChange={e => setNewPromo(p => ({ ...p, usageLimit: Number(e.target.value) }))} />
              <button onClick={addPromo} className="mc-btn py-2 text-sm text-white font-bold">Создать</button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">💡 Скидка 100% = бесплатная выдача товара игроку</p>
          </div>
          <div className="space-y-2">
            {promos.map(p => (
              <div key={p.code} className="mc-card p-3 flex items-center gap-4">
                <span className="font-pixel text-mc-gold text-xs w-28">{p.code}</span>
                <span className="text-mc-green font-bold">{p.discount}%</span>
                <span className="text-xs text-muted-foreground flex-1">{p.usedCount}/{p.usageLimit} использ.</span>
                <button onClick={() => savePromos(promos.map(pp => pp.code === p.code ? { ...pp, active: !pp.active } : pp))}
                  className={`px-3 py-1 text-xs font-bold ${p.active ? "mc-btn text-white" : "mc-btn-red"}`}>
                  {p.active ? "Активен" : "Откл."}
                </button>
                <button onClick={() => savePromos(promos.filter(pp => pp.code !== p.code))} className="mc-btn-red px-3 py-1 text-xs">🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="animate-fade-in space-y-2">
          {orders.length === 0
            ? <div className="mc-card p-8 text-center text-muted-foreground">Заказов пока нет</div>
            : orders.slice().reverse().map(o => (
              <div key={o.id} className="mc-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">#{o.id.slice(-8)} — {o.username}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleString("ru")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{o.items.map(i => `${i.product.name} x${i.qty}`).join(", ")}</p>
                    {o.promo && <p className="text-xs text-mc-green">Промокод: {o.promo} (-{o.discount} ₽)</p>}
                    <p className="text-xs text-muted-foreground">Оплата: {o.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-mc-gold font-bold text-lg">{o.total} ₽</p>
                    <p className="text-xs text-mc-green">✓ Выполнен</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {tab === "users" && (
        <div className="animate-fade-in space-y-2">
          {users.map(u => (
            <div key={u.id} className="mc-card p-3 flex items-center gap-4">
              <span className="text-2xl">{u.isAdmin ? "👑" : "🧑‍💻"}</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{u.username}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">{new Date(u.registeredAt).toLocaleDateString("ru")}</p>
              {u.isAdmin && <span className="text-mc-gold text-xs font-bold">ADMIN</span>}
              <span className="text-xs text-muted-foreground">{u.purchases.length} покупок</span>
            </div>
          ))}
          {users.length === 0 && <div className="mc-card p-8 text-center text-muted-foreground">Нет зарегистрированных игроков</div>}
        </div>
      )}

      {tab === "settings" && (
        <div className="animate-fade-in max-w-xl">
          <div className="mc-card p-4 space-y-3">
            {[
              ["Название сервера", "serverName"],
              ["IP сервера", "serverIp"],
              ["Заголовок главной", "heroTitle"],
              ["Подзаголовок", "heroSubtitle"],
              ["Объявление", "announcement"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                <input className="mc-input w-full px-3 py-2 text-sm" type="text"
                  value={(settings as Record<string, string>)[key]} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground">Показывать объявление:</label>
              <button onClick={() => setSettings(s => ({ ...s, showAnnouncement: !s.showAnnouncement }))}
                className={`px-4 py-1 text-xs font-bold ${settings.showAnnouncement ? "mc-btn text-white" : "mc-card text-muted-foreground"}`}>
                {settings.showAnnouncement ? "Вкл" : "Выкл"}
              </button>
            </div>
            {saved && <p className="text-mc-green text-sm font-bold">{saved}</p>}
            <button onClick={saveSettings} className="mc-btn-gold px-8 py-3 font-bold w-full">💾 Сохранить и применить</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================== SUPPORT PAGE ========================
function SupportPage() {
  const [form, setForm] = useState({ name: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💬</div>
        <h1 className="font-pixel text-mc-green text-sm mb-2">Поддержка</h1>
        <p className="text-muted-foreground text-sm">Отвечаем в течение нескольких часов</p>
      </div>
      {sent ? (
        <div className="mc-card p-8 text-center animate-scale-in">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-bold text-xl mb-2">Сообщение отправлено!</h2>
          <p className="text-muted-foreground text-sm">Мы свяжемся с вами в ближайшее время.</p>
          <button onClick={() => { setSent(false); setForm({ name: "", subject: "", message: "" }); }} className="mc-btn mt-6 px-8 py-3 text-white font-bold">Новое обращение</button>
        </div>
      ) : (
        <div className="mc-card p-6 space-y-4">
          <input className="mc-input w-full px-3 py-2 text-sm" placeholder="Ваш игровой ник" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <input className="mc-input w-full px-3 py-2 text-sm" placeholder="Тема обращения" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
          <textarea className="mc-input w-full px-3 py-2 text-sm resize-none h-32" placeholder="Опишите проблему подробно..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
          <button onClick={() => { if (form.name && form.message) setSent(true); }} className="mc-btn w-full py-3 text-white font-bold">📨 Отправить</button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {[
          { icon: "💬", title: "Discord", desc: "discord.gg/mineshop" },
          { icon: "📧", title: "Email", desc: "support@mineshop.ru" },
          { icon: "⏰", title: "Время ответа", desc: "1-4 часа" },
        ].map(c => (
          <div key={c.title} className="mc-card p-4 text-center">
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="font-bold text-sm">{c.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== MAIN APP ========================
export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(() => {
    const id = localStorage.getItem("mc_current_user");
    if (!id) return null;
    const users = loadData<User[]>("mc_users", []);
    return users.find(u => u.id === id) || null;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const handleAuth = (u: User) => {
    setUser(u);
    setAuthMode(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground scrollbar-mc">
      <Announcement />
      <Navbar page={page} setPage={setPage} user={user} cart={cart} onAuthClick={() => setAuthMode("login")} />
      <main>
        {page === "home" && <HomePage setPage={setPage} user={user} onAuthClick={() => setAuthMode("register")} />}
        {page === "catalog" && <CatalogPage onAddToCart={addToCart} user={user} onAuthClick={() => setAuthMode("login")} />}
        {page === "cart" && <CartPage cart={cart} setCart={setCart} user={user} onAuthClick={() => setAuthMode("login")} />}
        {page === "profile" && <ProfilePage user={user} setUser={setUser} setPage={setPage} />}
        {page === "admin" && <AdminPage user={user} />}
        {page === "support" && <SupportPage />}
      </main>
      <footer className="mc-card mt-12 py-6 text-center" style={{ borderLeft: "none", borderRight: "none", borderBottom: "none" }}>
        <p className="font-pixel text-mc-green text-xs mb-2">⛏️ MineShop</p>
        <p className="text-muted-foreground text-xs">Лучший магазин для Minecraft серверов</p>
      </footer>
      {authMode && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setAuthMode(null)} />}
    </div>
  );
}