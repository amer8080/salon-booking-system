// hooks/useCustomerModals.ts
import { useState } from 'react'
import { Customer, CustomerFormData } from '../types/customer.types'

export const useCustomerModals = (onDataChange?: () => void) => {
  // Modal states
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

  // Form states
  const [editForm, setEditForm] = useState<CustomerFormData>({
    name: '',
    phone: '',
    notes: '',
    status: 'active'
  })

  const [addForm, setAddForm] = useState<CustomerFormData>({
    name: '',
    phone: '',
    notes: '',
    status: 'active'
  })

  // Loading states
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Open modals
  const openViewModal = (customer: Customer) => {
    setViewingCustomer(customer)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes || '',
      status: customer.status
    })
  }

  const openAddModal = () => {
    setAddingCustomer(true)
    setAddForm({
      name: '',
      phone: '',
      notes: '',
      status: 'active'
    })
  }

  const openDeleteModal = (customer: Customer) => {
    setDeletingCustomer(customer)
  }

  // Close modals
  const closeAllModals = () => {
    setViewingCustomer(null)
    setEditingCustomer(null)
    setAddingCustomer(false)
    setDeletingCustomer(null)
  }

  // Save customer (edit)
  const saveCustomer = async (): Promise<boolean> => {
    if (!editingCustomer) return false

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (data.success) {
        setEditingCustomer(null)
        if (onDataChange) onDataChange()
        return true
      } else {
        alert('فشل في تحديث العميل: ' + data._error)
        return false
      }
    } catch (_error) {
      alert('خطأ في الاتصال بالخادم')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Add customer
  const addCustomer = async (): Promise<boolean> => {
    if (!addForm.name || !addForm.phone) {
      alert('يرجى إدخال الاسم ورقم الهاتف')
      return false
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      })

      const data = await response.json()

      if (data.success) {
        setAddingCustomer(false)
        setAddForm({ name: '', phone: '', notes: '', status: 'active' })
        if (onDataChange) onDataChange()
        return true
      } else {
        alert('فشل في إضافة العميل: ' + data._error)
        return false
      }
    } catch (_error) {
      alert('خطأ في الاتصال بالخادم')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Delete customer
  const deleteCustomer = async (): Promise<boolean> => {
    if (!deletingCustomer) return false

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/customers/${deletingCustomer.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setDeletingCustomer(null)
        if (onDataChange) onDataChange()
        return true
      } else {
        alert('فشل في حذف العميل: ' + data._error)
        return false
      }
    } catch (_error) {
      alert('خطأ في الاتصال بالخادم')
      return false
    } finally {
      setDeleting(false)
    }
  }

  // Form handlers
  const updateEditForm = (updates: Partial<CustomerFormData>) => {
    setEditForm(prev => ({ ...prev, ...updates }))
  }

  const updateAddForm = (updates: Partial<CustomerFormData>) => {
    setAddForm(prev => ({ ...prev, ...updates }))
  }

  // Validation
  const isEditFormValid = editForm.name.trim() !== '' && editForm.phone.trim() !== ''
  const isAddFormValid = addForm.name.trim() !== '' && addForm.phone.trim() !== ''

  return {
    // Modal states
    viewingCustomer,
    editingCustomer,
    addingCustomer,
    deletingCustomer,

    // Form data
    editForm,
    addForm,

    // Loading states
    saving,
    deleting,

    // Actions
    openViewModal,
    openEditModal,
    openAddModal,
    openDeleteModal,
    closeAllModals,

    // CRUD operations
    saveCustomer,
    addCustomer,
    deleteCustomer,

    // Form handlers
    updateEditForm,
    updateAddForm,

    // Validation
    isEditFormValid,
    isAddFormValid,

    // Quick access to open states
    hasOpenModal: !!(viewingCustomer || editingCustomer || addingCustomer || deletingCustomer)
  }
}