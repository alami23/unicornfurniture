'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  History, 
  Settings, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import Modal from '@/components/ui/Modal';

interface SMSTemplate {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface SMSCampaign {
  id: string;
  title: string;
  message: string;
  recipients_type: string;
  recipient_count: number;
  status: string;
  created_at: string;
}

export default function SMSPage() {
  const [activeTab, setActiveTab] = useState('send');
  const [message, setMessage] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [recipients, setRecipients] = useState('all'); // all, customers, staff, custom
  const [loading, setLoading] = useState(false);
  
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = useState({ title: '', content: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: tplData },
        { data: cmpData }
      ] = await Promise.all([
        supabase.from('sms_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('sms_campaigns').select('*').order('created_at', { ascending: false })
      ]);
      setTemplates(tplData || []);
      setCampaigns(cmpData || []);
    } catch (error: any) {
      toast.error('Failed to fetch SMS data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async () => {
    if (!message) {
      toast.error('Please enter a message');
      return;
    }
    setLoading(true);
    try {
      // 1. Get recipient count
      let count = 0;
      if (recipients === 'all') {
        const { count: custCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
        const { count: staffCount } = await supabase.from('staff').select('*', { count: 'exact', head: true });
        count = (custCount || 0) + (staffCount || 0);
      } else if (recipients === 'customers') {
        const { count: custCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
        count = custCount || 0;
      } else if (recipients === 'staff') {
        const { count: staffCount } = await supabase.from('staff').select('*', { count: 'exact', head: true });
        count = staffCount || 0;
      }

      // 2. Save campaign
      const { error } = await supabase.from('sms_campaigns').insert([{
        title: campaignTitle || 'Quick Message',
        message,
        recipients_type: recipients,
        recipient_count: count,
        status: 'delivered'
      }]);

      if (error) throw error;

      toast.success('SMS campaign started successfully!');
      setMessage('');
      setCampaignTitle('');
      fetchData();
      setActiveTab('history');
    } catch (error: any) {
      toast.error('Error sending SMS: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('sms_templates')
          .update(templateFormData)
          .eq('id', editingTemplate.id);
        if (error) throw error;
        toast.success('Template updated');
      } else {
        const { error } = await supabase
          .from('sms_templates')
          .insert([templateFormData]);
        if (error) throw error;
        toast.success('Template added');
      }
      setIsTemplateModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const { error } = await supabase.from('sms_templates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Template deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const tabs = [
    { id: 'send', label: 'Send SMS', icon: Send },
    { id: 'history', label: 'History', icon: History },
    { id: 'templates', label: 'Templates', icon: MessageSquare },
    { id: 'settings', label: 'Gateway Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">SMS Marketing & Alerts</h1>
        <p className="text-slate-500 font-medium">Send automated reminders and marketing messages to your customers.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {activeTab === 'send' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">New SMS Campaign</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <Smartphone className="w-3 h-3" />
                  Balance: 1,240 SMS
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Title (Internal)</label>
                  <input 
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    placeholder="e.g. Eid Mubarak Offer 2024"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Recipients</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'all', label: 'All Contacts', icon: Users },
                      { id: 'customers', label: 'Customers Only', icon: Users },
                      { id: 'staff', label: 'Staff Only', icon: Users },
                      { id: 'custom', label: 'Custom List', icon: Plus },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setRecipients(opt.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                          recipients === opt.id 
                            ? "border-blue-600 bg-blue-50 text-blue-600" 
                            : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        <opt.icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      message.length > 160 ? "text-red-500" : "text-slate-400"
                    )}>
                      {message.length} / 160 (1 SMS)
                    </span>
                  </div>
                  <textarea 
                    rows={6} 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="Type your message here... Use {name} for customer name."
                  ></textarea>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    Sending bulk SMS may take a few minutes. Ensure your message complies with local regulations in Bangladesh.
                  </p>
                </div>

                <button 
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send SMS Now'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Campaign History</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search history..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-10">No campaign history found.</p>
                ) : campaigns.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        item.status === 'delivered' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                      )}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{format(new Date(item.created_at), 'dd MMM, yyyy hh:mm a')} • {item.recipient_count} Recipients</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">SMS Templates</h3>
                <button 
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateFormData({ title: '', content: '' });
                    setIsTemplateModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.length === 0 ? (
                  <p className="col-span-full text-sm text-slate-500 text-center py-10">No templates found.</p>
                ) : templates.map((tpl, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900">{tpl.title}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            setEditingTemplate(tpl);
                            setTemplateFormData({ title: tpl.title, content: tpl.content });
                            setIsTemplateModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{tpl.content}</p>
                    <button 
                      onClick={() => setMessage(tpl.content)}
                      className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 space-y-8">
              <h3 className="text-lg font-bold text-slate-900">Gateway Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMS Provider</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>BulkSMS BD</option>
                    <option>Metronet</option>
                    <option>SSL Wireless</option>
                    <option>Twilio</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Key</label>
                  <input type="password" placeholder="••••••••••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sender ID / Masking</label>
                  <input type="text" placeholder="UNICORN_BD" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title={editingTemplate ? 'Edit Template' : 'New Template'}
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template Title</label>
            <input 
              type="text" 
              required
              value={templateFormData.title}
              onChange={(e) => setTemplateFormData({ ...templateFormData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content</label>
            <textarea 
              required
              rows={4}
              value={templateFormData.content}
              onChange={(e) => setTemplateFormData({ ...templateFormData, content: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
