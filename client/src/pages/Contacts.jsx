import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ContactDetailPanel from '../components/ContactDetailPanel';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentContact, setCurrentContact] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Detail drawer state
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/api/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenAddModal = () => {
    setModalType('add');
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'lead',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact, e) => {
    e.stopPropagation(); // Avoid opening detail drawer
    setModalType('edit');
    setCurrentContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      status: contact.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      return setFormError('Name and Email are required');
    }

    setSubmitting(true);
    try {
      if (modalType === 'add') {
        const res = await api.post('/api/contacts', formData);
        setContacts([res.data, ...contacts]);
      } else {
        const res = await api.put(`/api/contacts/${currentContact._id}`, formData);
        setContacts(contacts.map((c) => (c._id === currentContact._id ? res.data : c)));
        // Update drawer contact if it is the currently edited one
        if (selectedContact?._id === currentContact._id) {
          setSelectedContact(res.data);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Action failed';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (contactId, e) => {
    e.stopPropagation(); // Prevent drawer toggle

    if (deleteConfirmId === contactId) {
      // Confirmed on second click -> execute delete
      try {
        await api.delete(`/api/contacts/${contactId}`);
        setContacts(contacts.filter((c) => c._id !== contactId));
        if (selectedContact?._id === contactId) {
          setIsDrawerOpen(false);
        }
        setDeleteConfirmId(null);
      } catch (err) {
        console.error('Error deleting contact:', err);
      }
    } else {
      // First click -> set confirm state
      setDeleteConfirmId(contactId);
    }
  };

  // Reset delete confirmation if user clicks elsewhere
  useEffect(() => {
    const handleGlobalClick = () => {
      setDeleteConfirmId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleOpenDrawer = (contact) => {
    setSelectedContact(contact);
    setIsDrawerOpen(true);
  };

  const handleDrawerContactUpdate = (updatedContact) => {
    setContacts(contacts.map((c) => (c._id === updatedContact._id ? updatedContact : c)));
    setSelectedContact(updatedContact);
  };

  // Filter and Search Contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search));

    const matchesStatus = statusFilter === '' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
      {/* Top search & add bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-[260px]">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="crm-input pl-9 w-full py-1.5 text-[13px]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="crm-input w-full sm:w-[150px] py-1.5 text-[13px] cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="customer">Customer</option>
            <option value="churned">Churned</option>
          </select>
        </div>

        {/* Add Contact Button */}
        <button
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center gap-1.5 py-2 w-full sm:w-auto justify-center font-semibold text-[13px]"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {/* Main contacts content table / card */}
      <div className="crm-card !p-0 overflow-hidden">
        {filteredContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-borderTheme text-secondary text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3.5 font-semibold">Name</th>
                  <th className="px-6 py-3.5 font-semibold">Email</th>
                  <th className="px-6 py-3.5 font-semibold">Company</th>
                  <th className="px-6 py-3.5 font-semibold">Phone</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Created</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderTheme/50">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    onClick={() => handleOpenDrawer(contact)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-3.5 font-medium text-primary">
                      {contact.name}
                    </td>
                    <td className="px-6 py-3.5 text-secondary truncate max-w-[200px]">
                      {contact.email}
                    </td>
                    <td className="px-6 py-3.5 text-secondary">
                      {contact.company || <em className="text-mutedText">None</em>}
                    </td>
                    <td className="px-6 py-3.5 text-secondary">
                      {contact.phone || <em className="text-mutedText">None</em>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`badge ${
                        contact.status === 'lead'
                          ? 'badge-lead'
                          : contact.status === 'customer'
                          ? 'badge-customer'
                          : 'badge-churned'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-secondary">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {/* View Action */}
                        <button
                          onClick={() => handleOpenDrawer(contact)}
                          className="p-1.5 rounded-md hover:bg-muted text-secondary hover:text-primary transition-colors"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        
                        {/* Edit Action */}
                        <button
                          onClick={(e) => handleOpenEditModal(contact, e)}
                          className="p-1.5 rounded-md hover:bg-muted text-secondary hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Double-click confirmation delete */}
                        <button
                          onClick={(e) => handleDeleteClick(contact._id, e)}
                          className={`p-1.5 rounded-md border transition-all ${
                            deleteConfirmId === contact._id
                              ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                              : 'border-transparent text-secondary hover:bg-muted hover:text-red-500'
                          }`}
                          title={deleteConfirmId === contact._id ? 'Click again to confirm delete' : 'Delete'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
            <h3 className="text-base font-semibold text-primary mb-1">No contacts found</h3>
            <p className="text-[12px] text-secondary max-w-[300px] mb-4">
              {contacts.length === 0
                ? 'Create your very first contact to start tracking lead metrics.'
                : 'No contacts match the search terms or status criteria.'}
            </p>
            {contacts.length === 0 && (
              <button
                onClick={handleOpenAddModal}
                className="btn-primary flex items-center gap-1.5 py-1.5 text-[12px] font-semibold"
              >
                <Plus size={14} />
                Add Contact
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Add Contact' : 'Edit Contact'}
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-md text-[13px] font-medium text-center">
              {formError}
            </div>
          )}

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="crm-input w-full text-[13px]"
              placeholder="Full name"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="crm-input w-full text-[13px]"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="crm-input w-full text-[13px]"
              placeholder="e.g. +1 234 567 890"
            />
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="company">Company</label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="crm-input w-full text-[13px]"
              placeholder="e.g. Acme Inc"
            />
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="crm-input w-full text-[13px] cursor-pointer"
            >
              <option value="lead">Lead</option>
              <option value="customer">Customer</option>
              <option value="churned">Churned</option>
            </select>
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

      {/* Slide-out Drawer Panel */}
      <ContactDetailPanel
        contact={selectedContact}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleDrawerContactUpdate}
      />
    </div>
  );
};

export default Contacts;
