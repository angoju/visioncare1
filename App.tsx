import React, { useState, useEffect } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Layout } from './components/Layout';
import { LoginView } from './views/LoginView';
import { ReceptionView } from './views/ReceptionView';
import { DoctorView } from './views/DoctorView';
import { PharmacyView } from './views/PharmacyView';
import { AdminView } from './views/AdminView';

const AppContent = () => {
  const { currentUser } = useClinic();
  const [currentView, setCurrentView] = useState('dashboard');

  // Reset view when user changes to avoid dead ends
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'receptionist') setCurrentView('reception_dashboard');
      else if (currentUser.role === 'doctor') setCurrentView('doctor_dashboard');
      else if (currentUser.role === 'pharmacist') setCurrentView('pharmacy_dashboard');
      else if (currentUser.role === 'admin') setCurrentView('admin_overview');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LoginView />;
  }

  const renderView = () => {
    // Shared Routing Logic based on view IDs
    if (currentView.startsWith('reception')) return <ReceptionView />;
    if (currentView.startsWith('doctor')) return <DoctorView />;
    if (currentView.startsWith('pharmacy')) return <PharmacyView />;
    
    // Admin View
    if (currentView === 'admin_overview') return <AdminView />;

    return <div className="p-10 text-center text-gray-500">Page not found</div>;
  };

  return (
    <Layout activeView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <AppContent />
    </ClinicProvider>
  );
}