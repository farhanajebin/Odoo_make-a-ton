import React, { useState } from 'react';
import {
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
} from 'lucide-react';
import { useCustomerData } from '../context/CustomerDataContext';
import { CustomerCard } from '../components/common/CustomerCard';
import { CustomerButton } from '../components/common/CustomerButton';
import { CustomerBadge } from '../components/common/CustomerBadge';

const FAQS = [
  {
    q: 'When will my subscription renewal be invoiced?',
    a: 'Invoices are generated automatically 15 days prior to your billing cycle expiry date. You will receive an email confirmation and can view the statement directly in your Invoices tab.',
  },
  {
    q: 'How do modular add-ons affect my billing?',
    a: 'Enabling an add-on applies immediately to your workspace entitlements and will be prorated on your upcoming monthly invoice. Disabling an add-on stops renewal for subsequent cycles.',
  },
  {
    q: 'Where can I find GST compliant tax invoices?',
    a: 'All invoices generated in the Customer Portal are GST compliant with statutory B2B headers, itemized HSN/SAC codes, and QR clearance tags. Use the "Download PDF" action under the Invoices tab.',
  },
  {
    q: 'Can I pause my subscription temporarily?',
    a: 'Yes, customers on standard monthly plans can pause their agreement via the "My Subscription" section. Services remain fully accessible until the end of the paid billing period.',
  },
];

export const SupportPage: React.FC = () => {
  const { tickets, createSupportTicket } = useCustomerData();

  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'Billing' | 'Technical' | 'Feature Request' | 'Subscription Change'>('Billing');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [message, setMessage] = useState('');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    createSupportTicket({
      subject,
      category,
      priority,
      message,
    });

    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Contact Channels Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CustomerCard variant="sky" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-blue-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Email Support</span>
              <div className="font-bold text-slate-900 text-xs mt-0.5">support@brightloop.io</div>
              <p className="text-[10px] text-slate-600">Response within 2 hours</p>
            </div>
          </div>
        </CustomerCard>

        <CustomerCard variant="mint" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-emerald-700">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Support Hotline</span>
              <div className="font-bold text-slate-900 text-xs mt-0.5">+91 (80) 4129-8800</div>
              <p className="text-[10px] text-slate-600">Mon–Fri, 9:00 AM – 7:00 PM IST</p>
            </div>
          </div>
        </CustomerCard>

        <CustomerCard variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">SLA Commitment</span>
              <div className="font-bold text-slate-900 text-xs mt-0.5">99.9% Uptime Guarantee</div>
              <p className="text-[10px] text-slate-600">Critical ticket response &lt; 15m</p>
            </div>
          </div>
        </CustomerCard>
      </div>

      {/* Main Grid: Ticket Form on Left + FAQs & Past Tickets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Support Request Form */}
        <div className="lg:col-span-6">
          <CustomerCard variant="default" padding="md">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Submit Support Request</h3>
              <p className="text-xs text-slate-500">
                Directly communicate with your assigned account engineer
              </p>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Request Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question regarding bank reconciliation webhook"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
                  >
                    <option value="Billing">Billing & Invoices</option>
                    <option value="Technical">Technical Support</option>
                    <option value="Subscription Change">Subscription Change</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none bg-white"
                  >
                    <option value="Low">Low (General Inquiry)</option>
                    <option value="Medium">Medium (Operational Query)</option>
                    <option value="High">High (Service Disruption)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <CustomerButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit Request
                </CustomerButton>
              </div>
            </form>
          </CustomerCard>
        </div>

        {/* Right Column (6 cols): FAQs & Previous Tickets */}
        <div className="lg:col-span-6 space-y-6">
          {/* Previous Support Tickets */}
          <CustomerCard variant="default" padding="md">
            <div className="pb-3 border-b border-slate-100 mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Support Requests</h3>
              <span className="text-[10px] text-slate-400">{tickets.length} total</span>
            </div>

            <div className="space-y-2.5">
              {tickets.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-xs">No active tickets.</p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        {t.ticketNumber} • {t.category}
                      </span>
                      <CustomerBadge statusText={t.status} size="sm" />
                    </div>

                    <h5 className="font-semibold text-slate-900 leading-snug">{t.subject}</h5>
                    <p className="text-slate-600 text-[11px] line-clamp-2">{t.message}</p>

                    {t.response && (
                      <div className="mt-2 p-2 rounded-lg bg-teal-50 border border-teal-100 text-[11px] text-teal-900">
                        <strong className="text-teal-950 block">Support Response:</strong>
                        {t.response}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CustomerCard>

          {/* Frequently Asked Questions Accordion */}
          <CustomerCard variant="default" padding="md">
            <div className="pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-500">Quick answers to common billing and subscription topics</p>
            </div>

            <div className="space-y-2">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 overflow-hidden text-xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-3 font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-100 flex items-center justify-between transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-3 bg-white text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CustomerCard>
        </div>
      </div>
    </div>
  );
};
