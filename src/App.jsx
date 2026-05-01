import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Tag, Wallet, Users, LogOut, Store, Menu, X } from 'lucide-react';

// Importar las vistas desde sus archivos para modularizar
import { DashboardView } from './DashboardView';
import { PosView } from './PosView';
import { ProductsView } from './ProductsView';
import { CashbookView } from './CashbookView';
import { AccountsView } from './AccountsView';
import { LoginView } from './LoginView';

// --- CONFIGURACIÓN DE IMAGEN ---
const LOGO_URL = "/IMAGES/MAR PNG.png";

// --- DATOS INICIALES DE PRUEBA ---
const initialProducts = [
  { id: 1, name: 'Remera Básica Algodón', price: 8500, stock: 50 },
  { id: 2, name: 'Jean Mom Vintage', price: 28000, stock: 15 },
  { id: 3, name: 'Campera de Cuero PU', price: 45000, stock: 8 },
  { id: 4, name: 'Zapatillas Urbanas', price: 32000, stock: 12 },
  { id: 5, name: 'Buzo Canguro Oversize', price: 19500, stock: 20 },
];

const initialCustomers = [
  { id: 1, name: 'María Gómez', phone: '3512345678', balance: 15000 },
  { id: 2, name: 'Juan Pérez', phone: '3518765432', balance: 0 },
  { id: 3, name: 'Sofía López', phone: '3511122334', balance: 32000 },
];

const initialTransactions = [
  { id: 1, date: new Date().toISOString(), type: 'IN', amount: 50000, description: 'Saldo inicial de caja' },
];

// --- FUNCIONES DE PERSISTENCIA ---
const getBranchData = (branch, key, defaultValue) => {
  if (!branch) return defaultValue;
  const saved = localStorage.getItem(`${branch}_${key}`);
  return saved ? JSON.parse(saved) : defaultValue;
};

export default function App() {
  // --- ESTADOS DE SESIÓN Y SUCURSAL ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser') || null);
  const [activeBranch, setActiveBranch] = useState(() => localStorage.getItem('activeBranch') || null);
  const [showSettings, setShowSettings] = useState(false);

  // --- ESTADOS DE DATOS (Se cargan dinámicamente según la sucursal) ---
  const [products, setProducts] = useState(() => getBranchData(activeBranch, 'products', initialProducts));
  const [customers, setCustomers] = useState(() => getBranchData(activeBranch, 'customers', initialCustomers));
  const [sales, setSales] = useState(() => getBranchData(activeBranch, 'sales', []));
  const [transactions, setTransactions] = useState(() => getBranchData(activeBranch, 'transactions', initialTransactions));

  // --- EFECTOS PARA GUARDAR DATOS INDEPENDIENTES ---
  useEffect(() => {
    if (activeBranch) localStorage.setItem(`${activeBranch}_products`, JSON.stringify(products));
  }, [products, activeBranch]);

  useEffect(() => {
    if (activeBranch) localStorage.setItem(`${activeBranch}_customers`, JSON.stringify(customers));
  }, [customers, activeBranch]);

  useEffect(() => {
    if (activeBranch) localStorage.setItem(`${activeBranch}_sales`, JSON.stringify(sales));
  }, [sales, activeBranch]);

  useEffect(() => {
    if (activeBranch) localStorage.setItem(`${activeBranch}_transactions`, JSON.stringify(transactions));
  }, [transactions, activeBranch]);

  // --- CONTROL DE CAMBIO DE SUCURSAL (PARA EL ADMIN) ---
  const handleBranchChange = (branch) => {
    setActiveBranch(branch);
    localStorage.setItem('activeBranch', branch);
    
    // Recargar datos de la nueva sucursal
    const p = localStorage.getItem(`${branch}_products`);
    setProducts(p ? JSON.parse(p) : initialProducts);
    
    const c = localStorage.getItem(`${branch}_customers`);
    setCustomers(c ? JSON.parse(c) : initialCustomers);
    
    const s = localStorage.getItem(`${branch}_sales`);
    setSales(s ? JSON.parse(s) : []);
    
    const t = localStorage.getItem(`${branch}_transactions`);
    setTransactions(t ? JSON.parse(t) : initialTransactions);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveBranch(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeBranch');
  };

  // --- FUNCIONES AUXILIARES ---
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const addTransaction = (type, amount, description) => {
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString(),
      type,
      amount: parseFloat(amount),
      description
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const login = (role, branch) => {
    setCurrentUser(role);
    localStorage.setItem('currentUser', role);
    handleBranchChange(branch);
  };

  // --- NAVEGACIÓN Y LAYOUT PRINCIPAL ---
  const navItems = [
    { id: 'dashboard', label: 'Panel', icon: <LayoutDashboard size={20} /> },
    { id: 'pos', label: 'Ventas (POS)', icon: <ShoppingCart size={20} /> },
    { id: 'products', label: 'Productos', icon: <Tag size={20} /> },
    { id: 'cash', label: 'Caja', icon: <Wallet size={20} /> },
    { id: 'accounts', label: 'Cuentas C.', icon: <Users size={20} /> },
  ];

  if (!currentUser) {
    return <LoginView onLogin={login} logoUrl={LOGO_URL} />;
  }

  return (
    <div className="min-h-screen bg-[family-name:--color-fondo-principal] bg-zinc-950 flex flex-col md:flex-row font-sans text-white">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-72 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 p-3 md:p-4 flex flex-col z-30 sticky top-0 md:h-screen shadow-xl md:shadow-none">
        {/* Logo Container */}
        <div className="flex items-center justify-between mb-3 md:mb-10 px-2">
          <div className="flex items-center">
            {LOGO_URL ? (
              <img src={LOGO_URL} alt="Logo" className="h-8 md:h-12 w-auto md:w-full object-contain" />
            ) : (
              <Tag size={24} className="text-white" />
            )}
          </div>
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-zinc-500 hover:text-white transition-colors">
              {showSettings ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl z-40 space-y-4 w-56">
                {currentUser === 'ADMIN' && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Sucursal</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                      <select 
                        value={activeBranch} 
                        onChange={(e) => { handleBranchChange(e.target.value); setShowSettings(false); }}
                        className="w-full pl-8 pr-2 py-2 bg-zinc-800 border-zinc-700 border rounded-lg text-xs text-white focus:outline-none appearance-none"
                      >
                        <option value="LOCAL 1">CHILE 164 (Local 1)</option>
                        <option value="LOCAL 2">MIGUEL J. 542 (Local 2)</option>
                      </select>
                    </div>
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex md:flex-col justify-center md:justify-start space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setShowSettings(false);
              }}
              className={`flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-4 py-2.5 md:py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
                activeTab === item.id 
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-lg shadow-white/5' 
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </div>

      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto bg-black">
        {activeTab === 'dashboard' && <DashboardView transactions={transactions} activeBranch={activeBranch} customers={customers} sales={sales} formatMoney={formatMoney} />}
        {activeTab === 'pos' && <PosView products={products} customers={customers} sales={sales} setSales={setSales} setProducts={setProducts} setCustomers={setCustomers} addTransaction={addTransaction} formatMoney={formatMoney} />}
        {activeTab === 'products' && <ProductsView products={products} setProducts={setProducts} activeBranch={activeBranch} formatMoney={formatMoney} />}
        {activeTab === 'cash' && <CashbookView transactions={transactions} activeBranch={activeBranch} formatMoney={formatMoney} addTransaction={addTransaction} />}
        {activeTab === 'accounts' && <AccountsView customers={customers} setCustomers={setCustomers} activeBranch={activeBranch} formatMoney={formatMoney} addTransaction={addTransaction} currentUser={currentUser} />}
      </main>
    </div>
  );
}