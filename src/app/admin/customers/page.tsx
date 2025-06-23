// page.tsx - الصفحة الرئيسية المبسطة
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, ArrowLeft, LogOut, X } from 'lucide-react'

// Components
import CustomerFilters from './components/CustomerFilters'
import CustomerList from './components/CustomerList'
import CustomerViewModal from './components/modals/CustomerViewModal'
import CustomerEditModal from './components/modals/CustomerEditModal'
import CustomerAddModal from './components/modals/CustomerAddModal'
import CustomerDeleteModal from './components/modals/CustomerDeleteModal'

// Hooks
import { useCustomers } from './hooks/useCustomers'
import { useCustomerModals } from './hooks/useCustomerModals'

export default function AdminCustomersPage() {
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
  }, [router])

  // Customer management
  const {
    customers,
    stats,
    loading,
    error,
    refreshing,
    pagination,
    pageSize,
    currentPageInfo,
    filters,
    fetchCustomers,
    refreshCustomers,
    changePageSize,
    changePage,
    updateFilters,
    resetFilters
  } = useCustomers({
    initialPageSize: 100,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  })

  // Modal management
  const {
    viewingCustomer,
    editingCustomer,
    addingCustomer,
    deletingCustomer,
    editForm,
    addForm,
    saving,
    deleting,
    openViewModal,
    openEditModal,
    openAddModal,
    openDeleteModal,
    closeAllModals,
    saveCustomer,
    addCustomer,
    deleteCustomer,
    updateEditForm,
    updateAddForm,
    isEditFormValid,
    isAddFormValid
  } = useCustomerModals(fetchCustomers)

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center text-purple-600 hover:text-purple-800">
              <ArrowLeft className="w-5 h-5 ml-2" />
              العودة للوحة التحكم
            </Link>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <h1 className="text-xl font-bold text-gray-800">إدارة العملاء</h1>
              <Users className="w-6 h-6 text-purple-600" />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 hover:text-red-800 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <CustomerFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          onAddCustomer={openAddModal}
          onRefresh={refreshCustomers}
          pageSize={pageSize}
          onPageSizeChange={changePageSize}
          currentPageInfo={currentPageInfo}
          stats={stats}
          refreshing={refreshing}
        />

        {/* Customer List */}
        <CustomerList
          customers={customers}
          loading={loading}
          pagination={pagination}
          pageSize={pageSize}
          onPageChange={changePage}
          currentPageInfo={currentPageInfo}
          onViewCustomer={openViewModal}
          onEditCustomer={openEditModal}
          onDeleteCustomer={openDeleteModal}
        />
      </div>

      {/* Modals */}
      {viewingCustomer && (
        <CustomerViewModal
          customer={viewingCustomer}
          onClose={closeAllModals}
        />
      )}

      {editingCustomer && (
        <CustomerEditModal
          customer={editingCustomer}
          form={editForm}
          onFormChange={updateEditForm}
          onSave={saveCustomer}
          onClose={closeAllModals}
          saving={saving}
          isValid={isEditFormValid}
        />
      )}

      {addingCustomer && (
        <CustomerAddModal
          form={addForm}
          onFormChange={updateAddForm}
          onAdd={addCustomer}
          onClose={closeAllModals}
          saving={saving}
          isValid={isAddFormValid}
        />
      )}

      {deletingCustomer && (
        <CustomerDeleteModal
          customer={deletingCustomer}
          onDelete={deleteCustomer}
          onClose={closeAllModals}
          deleting={deleting}
        />
      )}
    </div>
  )
}