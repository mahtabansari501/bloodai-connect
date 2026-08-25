import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Activity, HelpCircle, PhoneCall } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Using BloodAI Connect",
      icon: <HelpCircle className="text-blue-500" size={24} />,
      questions: [
        { q: "How do I request emergency blood?", a: "Go to the 'Active SOS' page and click 'Create SOS Alert'. Fill in the required blood type, urgency, and hospital location to notify nearby donors and hospitals." },
        { q: "How do I turn on/off my availability?", a: "Go to your Profile and toggle the 'Available to Donate' switch. When turned off, you won't receive non-critical donation requests." },
        { q: "Can I find blood camps nearby?", a: "Yes, visit the 'Blood Camps' section to see upcoming donation camps on the map and register for them." },
      ]
    },
    {
      category: "For Hospitals & Organizations",
      icon: <Activity className="text-green-500" size={24} />,
      questions: [
        { q: "How do we update our blood inventory?", a: "Log in with your hospital account, go to the Dashboard, and click 'Update Inventory'. You can manage both blood bags and medical supplies." },
        { q: "What does the AI Prediction do?", a: "Our AI analyzes past usage patterns and current inventory levels to alert you about potential upcoming shortages so you can prepare in advance." },
      ]
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Help & FAQs</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Find answers to common questions about blood donation, using the BloodAI Connect platform, and features for hospitals.
        </p>
      </div>

      <div className="space-y-10">
        {faqs.map((section, sIdx) => (
          <div key={sIdx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center gap-3">
              {section.icon}
              <h2 className="text-xl font-bold text-slate-800">{section.category}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {section.questions.map((faq, qIdx) => {
                const index = `${sIdx}-${qIdx}`;
                const isOpen = openIndex === index;
                return (
                  <div key={qIdx} className="p-5">
                    <button 
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-center text-left focus:outline-none"
                    >
                      <span className="font-semibold text-slate-700 pr-4">{faq.q}</span>
                      <span className="text-slate-400">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="mt-3 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm">
            <PhoneCall size={28} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Still need help?</h2>
        <p className="text-slate-600 mb-6">Our support team is always ready to assist you in emergency situations.</p>
        <a href="mailto:support@bloodai.com" className="inline-block bg-medicalBlue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
          Contact Support
        </a>
      </div>
    </div>
  );
}
