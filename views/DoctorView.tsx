import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { generatePrescriptionPDF, generateEyePrescriptionPDF } from '../services/pdfService';
import { Appointment, Medicine, EyePrescriptionDetails, EyeMeasurement, EyeAddition } from '../types';
import { Clock, CheckCircle, FileText, Plus, Trash2, Printer, History, Eye } from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';

// Data for suggestions and dropdowns
const OPHTHALMIC_SUGGESTIONS = [
  'KRYPTOK', 'D-BIFOCAL', 'PHOTOGRAY', 'ARC',
  'HIGH INDEX', 'CONSTANT USE', 'SEPARATE PAIRS',
  'CATARACT SURGERY', 'GLASS', 'WHITE', 'C,R'
];
const NEXT_VISIT_OPTIONS = [
  '1 Month', '2 Months', '3 Months', '6 Months', '12 Months', 'As needed'
];


export const DoctorView = () => {
  const { appointments, prescriptions, createPrescription, currentUser } = useClinic();
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  
  // General Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [currentMed, setCurrentMed] = useState<Medicine>({ name: '', dosage: '', frequency: '', duration: '' });

  // Eye Prescription Form State
  const [eyePrescription, setEyePrescription] = useState<EyePrescriptionDetails>({
    right_eye: { sph: '', cyl: '', axis: '', vision: '', notes: 'CLEAR' },
    left_eye: { sph: '', cyl: '', axis: '', vision: '', notes: 'CLEAR' },
    addition: { both_eyes: '', right_eye: '', left_eye: '' },
    advice: '',
    next_visit: '',
    ipd: '',
  });

  const scheduledAppointments = appointments.filter(a => a.status === 'scheduled');

  const handleAddMedicine = () => {
    if (currentMed.name && currentMed.dosage) {
      setMedicines([...medicines, currentMed]);
      setCurrentMed({ name: '', dosage: '', frequency: '', duration: '' });
    }
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSavePrescription = () => {
    if (!selectedAppt || !currentUser) return;

    createPrescription({
      appointmentId: selectedAppt.id,
      patientId: selectedAppt.patientId,
      patientName: selectedAppt.patientName,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      diagnosis,
      medicines,
      instructions,
      eyePrescription: eyePrescription.right_eye.sph || eyePrescription.left_eye.sph ? eyePrescription : undefined, // Only save if eye data exists
    });

    // Reset and close
    setSelectedAppt(null);
    setDiagnosis('');
    setInstructions('');
    setMedicines([]);
    setEyePrescription({ // Reset eye prescription form
      right_eye: { sph: '', cyl: '', axis: '', vision: '', notes: 'CLEAR' },
      left_eye: { sph: '', cyl: '', axis: '', vision: '', notes: 'CLEAR' },
      addition: { both_eyes: '', right_eye: '', left_eye: '' },
      advice: '',
      next_visit: '',
      ipd: '',
    });
  };

  const updateEyeMeasurement = (eye: 'right_eye' | 'left_eye', field: keyof EyeMeasurement, value: string) => {
    setEyePrescription(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value,
      },
    }));
  };

  const updateEyeAddition = (field: keyof EyeAddition, value: string) => {
    setEyePrescription(prev => ({
      ...prev,
      addition: {
        ...prev.addition,
        [field]: value,
      },
    }));
  };

  const updateEyeGeneral = (field: keyof Omit<EyePrescriptionDetails, 'right_eye' | 'left_eye' | 'addition'>, value: string) => {
    setEyePrescription(prev => ({
      ...prev,
      [field]: value,
    }));
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medical Dashboard</h2>
          <p className="text-gray-500">Welcome back, Dr. {currentUser?.name}</p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => setActiveTab('queue')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'queue' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}
            >
                Current Queue
            </button>
            <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}
            >
                Patient History
            </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Queue List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-gray-700 mb-2">Appointments Today</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {scheduledAppointments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No patients in waiting.</div>
              ) : (
                scheduledAppointments.map(appt => (
                  <div 
                    key={appt.id}
                    onClick={() => setSelectedAppt(appt)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedAppt?.id === appt.id ? 'bg-brand-50 border-l-4 border-l-brand-600' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900">{appt.patientName}</span>
                      <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        <Clock size={12} className="mr-1" /> {appt.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{appt.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prescription Area */}
          <div className="lg:col-span-2">
            {selectedAppt ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-gray-900">New Prescription</h3>
                  <p className="text-sm text-gray-500">Patient: {selectedAppt.patientName} | Date: {selectedAppt.date}</p>
                  <div className="mt-2 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-100">
                    <strong>Complaint:</strong> {selectedAppt.description}
                  </div>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto pr-2 -mr-2"> {/* Added overflow for long forms */}
                  <div>
                    <RichTextEditor
                      label="Diagnosis / Impression"
                      placeholder="e.g. Myopia, Conjunctivitis..."
                      value={diagnosis}
                      onChange={setDiagnosis}
                      rows={2}
                      borderColor="border-gray-300"
                    />
                  </div>

                  {/* Eye Prescription Section */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Eye size={20} /> Eye Prescription</h4>
                    
                    {/* Vision Table Headers */}
                    <div className="grid grid-cols-6 text-xs font-semibold text-gray-600 mb-2 px-2">
                      <span className="col-span-2">Eye</span>
                      <span>SPH</span>
                      <span>CYL</span>
                      <span>Axis</span>
                      <span>Vision</span>
                    </div>
                    
                    {/* Right Eye (RE) */}
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="font-medium text-gray-900">RE</span>
                        <input type="text" placeholder="Notes (CLEAR)" className="flex-1 p-1 border rounded text-xs bg-white text-gray-900"
                          value={eyePrescription.right_eye.notes} onChange={e => updateEyeMeasurement('right_eye', 'notes', e.target.value)} />
                      </div>
                      <input type="text" placeholder="SPH" className="p-1 border rounded text-xs bg-white text-gray-900"
                        value={eyePrescription.right_eye.sph} onChange={e => updateEyeMeasurement('right_eye', 'sph', e.target.value)} />
                      <input type="text" placeholder="CYL" className="p-1 border rounded text-xs bg-white text-gray-900"
                        value={eyePrescription.right_eye.cyl} onChange={e => updateEyeMeasurement('right_eye', 'cyl', e.target.value)} />
                      <input type="text" placeholder="Axis" className="p-1 border rounded text-xs bg-white text-gray-900"
                        value={eyePrescription.right_eye.axis} onChange={e => updateEyeMeasurement('right_eye', 'axis', e.target.value)} />
                      <input type="text" placeholder="Vision (6/6)" className="p-1 border rounded text-xs bg-white text-gray-900"
                        value={eyePrescription.right_eye.vision} onChange={e => updateEyeMeasurement('right_eye', 'vision', e.target.value)} />
                    </div>

                    {/* Left Eye (LE) */}
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="font-medium text-gray-900">LE</span>
                        <input type="text" placeholder="Notes (CLEAR)" className="flex-1 p-1 border rounded text-xs bg-white text-gray-900"
                          value={eyePrescription.left_eye.notes} onChange={e => updateEyeMeasurement('left_eye', 'notes', e.target.value)} />
                      </div>
                      <input type="text" placeholder="SPH" className="p-1 border rounded text-xs bg-white text-gray-900"
                        value={eyePrescription.left_eye.sph} onChange={e => updateEyeMeasurement('left_eye', 'sph', e.target.value)} />
                      <input type="text" placeholder="CYL" className="p-1 border rounded text-xs bg-white text-gray-900"
                        value={eyePrescription.left_eye.cyl} onChange={e => updateEyeMeasurement('left_eye', 'cyl', e.target.value)} />
                      <input type="text" placeholder="Axis" className="p-1 border rounded text-xs bg-white text-gray-900"
                        value={eyePrescription.left_eye.axis} onChange={e => updateEyeMeasurement('left_eye', 'axis', e.target.value)} />
                      <input type="text" placeholder="Vision (6/6)" className="p-1 border rounded text-xs bg-white text-gray-900"
                        value={eyePrescription.left_eye.vision} onChange={e => updateEyeMeasurement('left_eye', 'vision', e.target.value)} />
                    </div>

                    {/* Addition */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        <label className="col-span-1 text-sm font-medium text-gray-700 flex items-center">ADDITION</label>
                        <input type="text" placeholder="BE (Both Eyes)" className="p-2 border rounded text-sm bg-white text-gray-900"
                            value={eyePrescription.addition?.both_eyes} onChange={e => updateEyeAddition('both_eyes', e.target.value)} />
                        <input type="text" placeholder="RE (Right Eye)" className="p-2 border rounded text-sm bg-white text-gray-900"
                            value={eyePrescription.addition?.right_eye} onChange={e => updateEyeAddition('right_eye', e.target.value)} />
                        <input type="text" placeholder="LE (Left Eye)" className="p-2 border rounded text-sm bg-white text-gray-900"
                            value={eyePrescription.addition?.left_eye} onChange={e => updateEyeAddition('left_eye', e.target.value)} />
                    </div>

                    {/* Next Visit & IPD */}
                    <div className="flex gap-4 mb-4">
                        <select
                          className="flex-1 p-2 border rounded text-sm bg-white text-gray-900 border-gray-300"
                          value={eyePrescription.next_visit}
                          onChange={e => updateEyeGeneral('next_visit', e.target.value)}
                        >
                          <option value="">-- Select Next Visit --</option>
                          {NEXT_VISIT_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>

                        <input type="text" placeholder="IPD (e.g., 60mm)" className="flex-1 p-2 border rounded text-sm bg-white text-gray-900"
                            value={eyePrescription.ipd} onChange={e => updateEyeGeneral('ipd', e.target.value)} />
                    </div>

                    {/* Eye Specific Advice */}
                    <div>
                      <RichTextEditor
                        label="Eye Specific Advice / Notes"
                        placeholder="e.g. Constant use, Cataract Surgery..."
                        value={eyePrescription.advice || ''}
                        onChange={(val) => updateEyeGeneral('advice', val)}
                        rows={2}
                        borderColor="border-brand-500"
                        suggestions={OPHTHALMIC_SUGGESTIONS}
                      />
                    </div>
                  </div>
                  {/* End Eye Prescription Section */}


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rx: Medicines</label>
                    <div className="grid grid-cols-12 gap-2 mb-3">
                      <input 
                        placeholder="Medicine Name" className="col-span-4 p-2 border rounded text-sm bg-white text-gray-900"
                        value={currentMed.name} onChange={e => setCurrentMed({...currentMed, name: e.target.value})}
                      />
                      <input 
                        placeholder="Dosage" className="col-span-3 p-2 border rounded text-sm bg-white text-gray-900"
                        value={currentMed.dosage} onChange={e => setCurrentMed({...currentMed, dosage: e.target.value})}
                      />
                      <input 
                        placeholder="Freq" className="col-span-2 p-2 border rounded text-sm bg-white text-gray-900"
                        value={currentMed.frequency} onChange={e => setCurrentMed({...currentMed, frequency: e.target.value})}
                      />
                      <input 
                        placeholder="Dur" className="col-span-2 p-2 border rounded text-sm bg-white text-gray-900"
                        value={currentMed.duration} onChange={e => setCurrentMed({...currentMed, duration: e.target.value})}
                      />
                      <button 
                        onClick={handleAddMedicine}
                        className="col-span-1 bg-brand-600 text-white rounded flex items-center justify-center hover:bg-brand-700"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Medicine List */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 space-y-2 min-h-[100px]">
                      {medicines.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No medicines added yet</p>}
                      {medicines.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded shadow-sm text-sm">
                          <div className="grid grid-cols-4 gap-2 flex-1">
                            <span className="font-medium text-gray-900">{med.name}</span>
                            <span className="text-gray-600">{med.dosage}</span>
                            <span className="text-gray-600">{med.frequency}</span>
                            <span className="text-gray-600">{med.duration}</span>
                          </div>
                          <button onClick={() => handleRemoveMedicine(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <RichTextEditor
                      label="Additional Instructions (General)"
                      placeholder="e.g. Return for checkup in 2 weeks..."
                      value={instructions}
                      onChange={setInstructions}
                      rows={2}
                      borderColor="border-gray-300"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6 flex justify-end gap-3">
                  <button onClick={() => setSelectedAppt(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                  <button 
                    onClick={handleSavePrescription}
                    disabled={!diagnosis && medicines.length === 0 && !eyePrescription.right_eye.sph && !eyePrescription.left_eye.sph} // Disable if nothing is filled
                    className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2
                      ${(!diagnosis && medicines.length === 0 && !eyePrescription.right_eye.sph && !eyePrescription.left_eye.sph) ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}
                  >
                    <CheckCircle size={18} /> Complete & Send to Pharmacy
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                <Stethoscope size={48} className="mb-4 opacity-50" />
                <p>Select a patient from the queue to start consultation</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Diagnosis</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Medicines</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prescriptions.map((pres) => (
                <tr key={pres.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600 text-sm">{new Date(pres.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{pres.patientName}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{pres.diagnosis}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{pres.medicines.length} items</td>
                    <td className="px-6 py-4">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => generatePrescriptionPDF(pres)}
                                className="text-brand-600 hover:text-brand-800 text-sm font-medium flex items-center gap-1"
                                title="Print General Prescription"
                            >
                                <Printer size={14} /> Med
                            </button>
                            {pres.eyePrescription && (
                                <button
                                    onClick={() => generateEyePrescriptionPDF(pres)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                                    title="Print Eye Prescription"
                                >
                                    <Eye size={14} /> Eye
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
              ))}
              {prescriptions.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No history available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Simple Icon for empty state
const Stethoscope = ({size, className}: {size: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v6a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);