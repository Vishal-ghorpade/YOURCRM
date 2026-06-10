import React, { useState } from 'react';
import { X, Calendar, Plus, Check, Loader2 } from 'lucide-react';
import api from '../api/axios';

const ContactDetailPanel = ({ contact, isOpen, onClose, onUpdate }) => {
  const [newNote, setNewNote] = useState('');
  const [reminderMsg, setReminderMsg] = useState(contact?.reminder?.message || '');
  const [reminderDate, setReminderDate] = useState(
    contact?.reminder?.date ? new Date(contact.reminder.date).toISOString().split('T')[0] : ''
  );
  const [loadingNote, setLoadingNote] = useState(false);
  const [loadingReminder, setLoadingReminder] = useState(false);

  // Sync state if contact changes
  React.useEffect(() => {
    if (contact) {
      setReminderMsg(contact.reminder?.message || '');
      setReminderDate(
        contact.reminder?.date ? new Date(contact.reminder.date).toISOString().split('T')[0] : ''
      );
    }
  }, [contact]);

  if (!isOpen || !contact) return null;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setLoadingNote(true);
    try {
      const res = await api.post(`/api/contacts/${contact._id}/notes`, { text: newNote });
      setNewNote('');
      onUpdate(res.data);
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setLoadingNote(false);
    }
  };

  const handleSetReminder = async (e) => {
    e.preventDefault();
    if (!reminderMsg.trim() || !reminderDate) return;

    setLoadingReminder(true);
    try {
      const res = await api.put(`/api/contacts/${contact._id}/reminder`, {
        message: reminderMsg,
        date: reminderDate,
        done: false,
      });
      onUpdate(res.data);
    } catch (err) {
      console.error('Error setting reminder:', err);
    } finally {
      setLoadingReminder(false);
    }
  };

  const handleMarkReminderDone = async () => {
    setLoadingReminder(true);
    try {
      const res = await api.put(`/api/contacts/${contact._id}/reminder`, {
        done: !contact.reminder?.done,
      });
      onUpdate(res.data);
    } catch (err) {
      console.error('Error toggling reminder status:', err);
    } finally {
      setLoadingReminder(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Drawer overlay */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>

      {/* Drawer Body */}
      <div className="w-[400px] h-full bg-surface border-l border-borderTheme relative z-10 flex flex-col slide-in-right-animate shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-borderTheme">
          <h2 className="font-semibold text-base tracking-tight text-primary">
            Contact Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-secondary hover:bg-muted hover:text-primary transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Contact Core Profile */}
          <div className="flex flex-col gap-3 pb-5 border-b border-borderTheme">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent text-accentFg font-bold text-lg flex items-center justify-center uppercase">
                {contact.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-semibold text-primary">{contact.name}</h3>
                <span className={`badge ${
                  contact.status === 'lead'
                    ? 'badge-lead'
                    : contact.status === 'customer'
                    ? 'badge-customer'
                    : 'badge-churned'
                }`}>
                  {contact.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-2 gap-x-1 mt-2 text-[13px]">
              <span className="text-secondary font-medium">Email:</span>
              <span className="col-span-2 text-primary truncate" title={contact.email}>
                {contact.email}
              </span>

              <span className="text-secondary font-medium">Phone:</span>
              <span className="col-span-2 text-primary">
                {contact.phone || <em className="text-mutedText">None</em>}
              </span>

              <span className="text-secondary font-medium">Company:</span>
              <span className="col-span-2 text-primary">
                {contact.company || <em className="text-mutedText">None</em>}
              </span>

              <span className="text-secondary font-medium">Created:</span>
              <span className="col-span-2 text-primary">
                {formatDate(contact.createdAt)}
              </span>
            </div>
          </div>

          {/* Reminder Management */}
          <div className="pb-5 border-b border-borderTheme flex flex-col gap-3">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
              Reminders
            </h4>

            {/* Set/Update Form */}
            <form onSubmit={handleSetReminder} className="flex flex-col gap-2">
              <input
                type="text"
                value={reminderMsg}
                onChange={(e) => setReminderMsg(e.target.value)}
                placeholder="Reminder message..."
                className="crm-input w-full py-1.5 px-3 text-[13px]"
                required
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="crm-input flex-1 py-1.5 px-3 text-[13px]"
                  required
                />
                <button
                  type="submit"
                  disabled={loadingReminder}
                  className="btn-primary flex items-center gap-1.5 py-1.5 text-[12px] font-semibold"
                >
                  {loadingReminder ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />}
                  Set
                </button>
              </div>
            </form>

            {/* Current Reminder Display */}
            {contact.reminder && (
              <div className={`mt-2 p-3 rounded-lg border flex items-start justify-between gap-2 transition-all ${
                contact.reminder.done 
                  ? 'bg-muted/30 border-borderTheme/50 text-secondary'
                  : 'bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20 text-primary'
              }`}>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className={`text-[13px] font-medium leading-tight break-words ${contact.reminder.done ? 'line-through text-mutedText' : ''}`}>
                    {contact.reminder.message}
                  </span>
                  <span className="text-[11px] text-secondary flex items-center gap-1">
                    <Calendar size={10} />
                    {formatDate(contact.reminder.date)}
                  </span>
                </div>
                <button
                  onClick={handleMarkReminderDone}
                  disabled={loadingReminder}
                  className={`p-1 rounded-md border transition-all shrink-0 ${
                    contact.reminder.done
                      ? 'bg-borderTheme/20 border-borderTheme text-mutedText hover:bg-borderTheme/40'
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20'
                  }`}
                  title={contact.reminder.done ? 'Mark Undone' : 'Mark Done'}
                >
                  <Check size={14} className={contact.reminder.done ? 'opacity-50' : ''} />
                </button>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
              Notes
            </h4>

            {/* Form */}
            <form onSubmit={handleAddNote} className="flex flex-col gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note..."
                rows={2}
                className="crm-input w-full text-[13px] resize-none"
                required
              />
              <button
                type="submit"
                disabled={loadingNote}
                className="btn-primary self-end flex items-center gap-1.5 py-1.5 text-[12px] font-semibold"
              >
                {loadingNote ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Add Note
              </button>
            </form>

            {/* Note History List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 mt-2">
              {contact.notes && contact.notes.length > 0 ? (
                contact.notes.slice().reverse().map((note) => (
                  <div key={note._id} className="p-3 bg-muted/50 border border-borderTheme/40 rounded-lg flex flex-col gap-1 text-[13px]">
                    <p className="text-primary leading-normal break-words whitespace-pre-wrap">{note.text}</p>
                    <span className="text-[10px] text-secondary self-end">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-secondary text-[13px] italic">
                  No notes logged for this contact.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPanel;
