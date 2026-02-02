import { useState } from 'react';
import { LayoutDashboard, Users, Settings, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex" style={{ height: '100vh' }}>
      {/* Sidebar */}
      <aside className="glass-panel flex-col" style={{ width: '250px', margin: '16px', padding: '24px' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}></div>
          <h1 className="text-xl">Innolabit Manager</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Tenants" 
            isActive={activeTab === 'tenants'} 
            onClick={() => setActiveTab('tenants')}
          />
          <NavItem 
            icon={<Activity size={20} />} 
            label="Monitoring" 
            isActive={activeTab === 'monitoring'} 
            onClick={() => setActiveTab('monitoring')}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col" style={{ padding: '16px 16px 16px 0' }}>
        <header className="glass-panel w-full flex items-center justify-between p-4" style={{ marginBottom: '16px', height: '70px' }}>
          <h2 className="text-xl capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">Admin User</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
          </div>
        </header>

        <section className="glass-panel flex-1 p-4 relative overflow-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && <DashboardWelcome />}
            {activeTab !== 'dashboard' && (
              <div className="flex items-center justify-center h-full text-muted">
                Section {activeTab} is under construction.
              </div>
            )}
          </motion.div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 text-sm ${isActive ? 'btn-primary' : ''}`}
      style={{ 
        background: isActive ? '' : 'transparent', 
        justifyContent: 'flex-start',
        border: 'none',
        opacity: isActive ? 1 : 0.7 
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardWelcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to Management Console</h3>
        <p className="text-muted" style={{ maxWidth: '400px', lineHeight: '1.6' }}>
          Manage your Reox POS instances, monitor system health, and configure global settings from one centralized dashboard.
        </p>
      </motion.div>
    </div>
  );
}

export default App;
