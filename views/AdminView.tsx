import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { Users, Calendar, DollarSign, Activity, TrendingUp, AlertCircle } from 'lucide-react';

export const AdminView = () => {
  const { patients, appointments, pharmacyOrders } = useClinic();

  // Calculate Stats
  const totalPatients = patients.length;
  const todayAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
  
  // Calculate Revenue (Consultation Fees + Pharmacy Orders)
  const consultationRevenue = appointments.reduce((sum, appt) => sum + (appt.paymentStatus === 'paid' ? (appt.consultationFee || 0) : 0), 0);
  const pharmacyRevenue = pharmacyOrders.reduce((sum, order) => sum + (order.status === 'fulfilled' ? (order.totalCost || 0) : 0), 0);
  const totalRevenue = consultationRevenue + pharmacyRevenue;

  const pendingOrders = pharmacyOrders.filter(o => o.status !== 'fulfilled').length;

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <p className="text-gray-500">Real-time clinic performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Patients" 
          value={totalPatients} 
          icon={Users} 
          color="bg-blue-500" 
          subtext="Registered in system"
        />
        <StatCard 
          title="Appointments Today" 
          value={todayAppointments} 
          icon={Calendar} 
          color="bg-purple-500" 
          subtext="Scheduled visits"
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-500" 
          subtext="Consultation + Pharmacy"
        />
        <StatCard 
          title="Pending Orders" 
          value={pendingOrders} 
          icon={AlertCircle} 
          color="bg-orange-500" 
          subtext="Awaiting fulfillment"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity / Visual Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-brand-600" size={20} /> Clinic Activity
          </h3>
          <div className="h-48 bg-gradient-to-b from-brand-50 to-white rounded-lg border border-brand-100 flex items-end justify-between p-4 px-8">
             {/* Mock Chart Bars */}
             {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
               <div key={i} className="w-8 bg-brand-400 rounded-t-sm hover:bg-brand-500 transition-colors" style={{ height: `${h}%` }}></div>
             ))}
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-400 px-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} /> Efficiency Targets
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Patient Satisfaction</span>
                <span className="font-bold text-gray-900">98%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">On-Time Appointments</span>
                <span className="font-bold text-gray-900">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Inventory Stock</span>
                <span className="font-bold text-gray-900">92%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};