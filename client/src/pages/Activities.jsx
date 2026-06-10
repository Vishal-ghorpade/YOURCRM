import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Phone, Mail, Calendar, FileText } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'call',
    description: '',
    contactId: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchActivitiesAndContacts = async () => {
    try {
      const [activitiesRes, contactsRes] = await Promise.all([
        api.get('/api/activities'),
        api.get('/api/contacts'),
      ]);
      setActivities(activitiesRes.data);
      setContacts(contactsRes.data);
    } catch (err) {
      console.error('Error fetching activities or contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesAndContacts();
  }, []);

  const handleOpenLogModal = () => {
    setFormData({
      type: 'call',
      description: '',
      contactId: contacts[0]?._id || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.description.trim() || !formData.contactId) {
      return setFormError('All fields are required');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/activities', formData);
      setActivities([res.data, ...activities]);
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Action failed';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getActivityBadgeClass = (type) => {
    switch (type) {
      case 'call':
        return 'badge-call';
      case 'email':
        return 'badge-email';
      case 'meeting':
        return 'badge-meeting';
      default:
        return 'badge-activity-note';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return <Phone size={12} className="mr-1 shrink-0" />;
      case 'email':
        return <Mail size={12} className="mr-1 shrink-0" />;
      case 'meeting':
        return <Calendar size={12} className="mr-1 shrink-0" />;
      default:
        return <FileText size={12} className="mr-1 shrink-0" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blueTheme" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[12px] font-semibold text-secondary uppercase tracking-wider">
            Chronological History
          </h2>
        </div>
        <button
          onClick={handleOpenLogModal}
          disabled={contacts.length === 0}
          className="btn-primary flex items-center gap-1.5 py-2 font-semibold text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Log Activity
        </button>
      </div>

      {contacts.length === 0 && (
        <div className="p-4 bg-blueTheme/10 border border-blueTheme/20 rounded-md text-[13px] flex items-center gap-2 text-primary font-medium">
          <AlertCircle size={16} className="text-blueTheme" />
          Please create a Contact first before you can log an Activity.
        </div>
      )}

      {/* Activities Feed Table */}
      <div className="crm-card !p-0 overflow-hidden">
        {activities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-borderTheme text-secondary text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3.5 font-semibold">Type</th>
                  <th className="px-6 py-3.5 font-semibold">Description</th>
                  <th className="px-6 py-3.5 font-semibold">Contact</th>
                  <th className="px-6 py-3.5 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderTheme/50">
                {activities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="px-6 py-3.5">
                      <span className={`badge uppercase text-[10px] ${getActivityBadgeClass(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-primary break-words max-w-[350px]">
                      {activity.description}
                    </td>
                    <td className="px-6 py-3.5 text-secondary">
                      {activity.contactId?.name || <em className="text-mutedText">Deleted Contact</em>}
                    </td>
                    <td className="px-6 py-3.5 text-secondary">
                      {formatDate(activity.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center text-secondary">
            <AlertCircle size={36} className="text-mutedText mb-3" />
            <h3 className="text-base font-semibold text-primary mb-1">No activities logged</h3>
            <p className="text-[12px] text-secondary max-w-[300px] mb-4">
              {contacts.length === 0
                ? 'Create a contact first to start logging interactions.'
                : 'Get started by logging your first interaction with a contact.'}
            </p>
            {contacts.length > 0 && (
              <button
                onClick={handleOpenLogModal}
                className="btn-primary flex items-center gap-1.5 py-1.5 text-[12px] font-semibold"
              >
                <Plus size={14} />
                Log Activity
              </button>
            )}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Activity">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-md text-[13px] font-medium text-center">
              {formError}
            </div>
          )}

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="activityType">Activity Type</label>
            <select
              id="activityType"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="crm-input w-full text-[13px] cursor-pointer"
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="activityContact">Contact *</label>
            <select
              id="activityContact"
              value={formData.contactId}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
              className="crm-input w-full text-[13px] cursor-pointer"
              required
            >
              {contacts.map((contact) => (
                <option key={contact._id} value={contact._id}>
                  {contact.name} ({contact.company || 'No Company'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="activityDesc">Description *</label>
            <textarea
              id="activityDesc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="crm-input w-full text-[13px] resize-none"
              placeholder="e.g. Discussed licensing package pricing and agreed to send draft proposal tomorrow"
              rows={3}
              required
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-2.5 mt-2.5 border-t border-borderTheme/50 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-1.5 flex items-center gap-1"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities;
