import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, AlertCircle, Loader2, IndianRupee } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    contactId: '',
    value: '',
    stage: 'new',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDealsAndContacts = async () => {
    try {
      const [dealsRes, contactsRes] = await Promise.all([
        api.get('/api/deals'),
        api.get('/api/contacts'),
      ]);
      setDeals(dealsRes.data);
      setContacts(contactsRes.data);
    } catch (err) {
      console.error('Error fetching deals or contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealsAndContacts();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      contactId: contacts[0]?._id || '',
      value: '',
      stage: 'new',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.contactId || !formData.value) {
      return setFormError('All fields are required');
    }

    if (isNaN(formData.value) || parseFloat(formData.value) <= 0) {
      return setFormError('Value must be a positive number');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/deals', {
        ...formData,
        value: parseFloat(formData.value),
      });
      setDeals([res.data, ...deals]);
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Action failed';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable column
    if (!destination) return;

    // Dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    // Optimistic UI updates
    const updatedDeals = deals.map((deal) => {
      if (deal._id === draggableId) {
        return { ...deal, stage: destStage };
      }
      return deal;
    });
    setDeals(updatedDeals);

    try {
      // API call to update stage
      await api.put(`/api/deals/${draggableId}`, { stage: destStage });
    } catch (err) {
      console.error('Failed to update deal stage:', err);
      // Revert state if error occurs
      fetchDealsAndContacts();
    }
  };

  // Configure column attributes
  const columns = [
    { id: 'new', title: 'New' },
    { id: 'contacted', title: 'Contacted' },
    { id: 'qualified', title: 'Qualified' },
    { id: 'won', title: 'Won' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blueTheme" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[12px] font-semibold text-secondary uppercase tracking-wider">
            Kanban Board
          </h2>
        </div>
        <button
          onClick={handleOpenAddModal}
          disabled={contacts.length === 0}
          className="btn-primary flex items-center gap-1.5 py-2 font-semibold text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Add Deal
        </button>
      </div>

      {contacts.length === 0 && (
        <div className="p-4 bg-blueTheme/10 border border-blueTheme/20 rounded-md text-[13px] flex items-center gap-2 text-primary font-medium">
          <AlertCircle size={16} className="text-blueTheme" />
          Please create a Contact first before you can configure a Deal.
        </div>
      )}

      {/* Kanban Board Container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-start min-h-[450px]">
          {columns.map((column) => {
            const columnDeals = deals.filter((deal) => deal.stage === column.id);

            return (
              <div
                key={column.id}
                className="bg-surface border border-borderTheme rounded-[8px] p-4 flex flex-col gap-3 h-full min-h-[400px] max-h-[80vh] overflow-y-auto"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-borderTheme/50 pb-2">
                  <h3 className="font-semibold text-[13px] text-primary tracking-tight">
                    {column.title}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-muted border border-borderTheme/80 flex items-center justify-center text-[11px] font-semibold text-secondary">
                    {columnDeals.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-3.5 flex-1 rounded-md transition-colors ${
                        snapshot.isDraggingOver ? 'bg-muted/30' : ''
                      }`}
                    >
                      {columnDeals.length > 0 ? (
                        columnDeals.map((deal, index) => (
                          <Draggable key={deal._id} draggableId={deal._id} index={index}>
                            {(draggableProvided, draggableSnapshot) => (
                              <div
                                ref={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}
                                className={`p-3 bg-surface border rounded-lg shadow-none flex flex-col gap-2 relative ${
                                  draggableSnapshot.isDragging
                                    ? 'border-blueTheme ring-2 ring-blueTheme/10 z-30'
                                    : 'border-borderTheme hover:border-text-secondary/30'
                                }`}
                              >
                                {/* Drag Handle */}
                                <div
                                  {...draggableProvided.dragHandleProps}
                                  className="absolute right-2 top-2 text-secondary hover:text-primary cursor-grab"
                                >
                                  <GripVertical size={14} />
                                </div>

                                <div className="pr-4 flex flex-col gap-0.5">
                                  <h4 className="text-[13.5px] font-semibold text-primary tracking-tight leading-tight break-words">
                                    {deal.title}
                                  </h4>
                                  <span className="text-[11px] text-secondary truncate">
                                    {deal.contactId?.name || <em className="text-mutedText">Deleted Contact</em>}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center mt-2 border-t border-borderTheme/40 pt-2">
                                  <span className="text-[10px] text-mutedText">Value</span>
                                  <span className="text-[13px] font-semibold text-blueTheme">
                                    ₹{deal.value?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        /* Empty Stage Placeholder */
                        <div className="flex-1 border-2 border-dashed border-borderTheme rounded-lg flex items-center justify-center p-6 text-center text-secondary text-[12px] min-h-[120px] transition-colors">
                          Drop deals here
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Add Deal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Deal">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-md text-[13px] font-medium text-center">
              {formError}
            </div>
          )}

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="dealTitle">Deal Title *</label>
            <input
              id="dealTitle"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="crm-input w-full text-[13px]"
              placeholder="e.g. Q3 Software License"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="dealContact">Contact *</label>
            <select
              id="dealContact"
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
            <label className="crm-label" htmlFor="dealValue">Value (₹) *</label>
            <input
              id="dealValue"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="crm-input w-full text-[13px]"
              placeholder="e.g. 5000"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="crm-label" htmlFor="dealStage">Initial Stage</label>
            <select
              id="dealStage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="crm-input w-full text-[13px] cursor-pointer"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
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
    </div>
  );
};

export default Deals;
