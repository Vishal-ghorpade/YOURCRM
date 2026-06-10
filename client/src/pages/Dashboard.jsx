import React, { useState, useEffect } from 'react';
import { Users, UserCheck, CheckSquare, IndianRupee, Calendar, Mail, Phone, FileText, AlertCircle, X, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [deals, setDeals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, dealsRes, contactsRes] = await Promise.all([
          api.get('/api/stats'),
          api.get('/api/deals'),
          api.get('/api/contacts'),
        ]);

        setStats(statsRes.data);
        setDeals(dealsRes.data);

        // Process reminders (due today or overdue)
        const today = new Date();
        today.setHours(23, 59, 59, 999); // end of today
        
        const activeReminders = contactsRes.data.filter((contact) => {
          if (!contact.reminder || contact.reminder.done) return false;
          const remDate = new Date(contact.reminder.date);
          return remDate <= today;
        });
        
        setReminders(activeReminders);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return <Phone size={14} className="text-blueTheme" />;
      case 'email':
        return <Mail size={14} className="text-yellow-600 dark:text-yellow-400" />;
      case 'meeting':
        return <Calendar size={14} className="text-green-600 dark:text-green-400" />;
      default:
        return <FileText size={14} className="text-secondary" />;
    }
  };

  // Group deals by stage for Recharts
  const getDealsChartData = () => {
    const stages = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      won: 'Won',
      lost: 'Lost',
    };

    return Object.keys(stages).map((key) => {
      const count = deals.filter((deal) => deal.stage === key).length;
      return {
        stage: stages[key],
        count: count,
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blueTheme" size={32} />
      </div>
    );
  }

  const chartData = getDealsChartData();

  return (
    <div className="flex flex-col gap-6">
      {/* Reminder banner */}
      {showBanner && reminders.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[8px] p-4 flex items-start justify-between gap-3 text-yellow-800 dark:text-yellow-400 transition-all duration-150">
          <div className="flex gap-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-[13px] tracking-tight">Due Reminders</span>
              <ul className="list-disc pl-4 text-[12px] flex flex-col gap-1 mt-1">
                {reminders.map((contact) => (
                  <li key={contact._id}>
                    <strong>{contact.name}</strong>: {contact.reminder.message} ({new Date(contact.reminder.date).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-yellow-800 dark:text-yellow-400 hover:bg-yellow-500/10 p-1 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Contacts */}
        <div className="crm-card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[28px] font-semibold tracking-tight text-primary leading-none">
              {stats?.totalContacts || 0}
            </span>
            <span className="crm-label !mb-0 mt-1">Total Contacts</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-secondary">
            <Users size={20} />
          </div>
        </div>

        {/* Card 2: Active Leads */}
        <div className="crm-card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[28px] font-semibold tracking-tight text-primary leading-none">
              {stats?.activeLeads || 0}
            </span>
            <span className="crm-label !mb-0 mt-1">Active Leads</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-secondary">
            <UserCheck size={20} />
          </div>
        </div>

        {/* Card 3: Deals Won */}
        <div className="crm-card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[28px] font-semibold tracking-tight text-primary leading-none">
              {stats?.dealsWon || 0}
            </span>
            <span className="crm-label !mb-0 mt-1">Deals Won</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-secondary">
            <CheckSquare size={20} />
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="crm-card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[28px] font-semibold tracking-tight text-primary leading-none">
            ₹{stats?.totalRevenue?.toLocaleString() || 0}
          </span>
          <span className="crm-label !mb-0 mt-1">Total Revenue</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-secondary">
          <IndianRupee size={20} />
          </div>
        </div>
      </div>

      {/* Grid for Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Stage Chart Card */}
        <div className="crm-card lg:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-primary">Deals Pipeline by Stage</h3>
            <p className="text-[12px] text-secondary">Distribution of current active sales opportunities</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="stage" 
                  stroke="var(--text-secondary)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-muted)', opacity: 0.5 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="var(--blue)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List Card */}
        <div className="crm-card flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-primary">Recent Activities</h3>
            <p className="text-[12px] text-secondary">Chronological audit of latest actions</p>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3 max-h-[280px] pr-1">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div 
                  key={activity._id} 
                  className="flex items-start gap-3 p-3 bg-muted/40 border border-borderTheme/50 rounded-lg text-[13px] hover:bg-muted/70 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-surface border border-borderTheme/80 flex items-center justify-center shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-primary leading-normal font-medium break-words">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-secondary">
                      {activity.contactId && (
                        <span className="font-semibold">{activity.contactId.name}</span>
                      )}
                      <span>•</span>
                      <span>{getRelativeTime(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-center italic text-secondary text-[13px] py-12">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
