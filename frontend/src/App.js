import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Public pages
import Landing from './pages/public/Landing';
import Properties from './pages/public/Properties';
import PropertyDetails from './pages/public/PropertyDetails';
import Unauthorized from './pages/public/Unauthorized';
import NotFound from './pages/public/NotFound';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import ChangePassword from './pages/auth/ChangePassword';
import Notifications from './pages/auth/Notifications';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminPropertyCreate from './pages/admin/AdminPropertyCreate';
import AdminPropertyEdit from './pages/admin/AdminPropertyEdit';
import AdminPurchaseRequests from './pages/admin/AdminPurchaseRequests';
import AdminPurchaseRequestView from './pages/admin/AdminPurchaseRequestView';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomerView from './pages/admin/AdminCustomerView';
import AdminCustomerEdit from './pages/admin/AdminCustomerEdit';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserEdit from './pages/admin/AdminUserEdit';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminPayments from './pages/admin/AdminPayments';
import AdminChangeRequests from './pages/admin/AdminChangeRequests';
import AdminChangeRequestView from './pages/admin/AdminChangeRequestView';
import AdminConstructionRequests from './pages/admin/AdminConstructionRequests';
import AdminFeedback from './pages/admin/AdminFeedback';
import SalesAnalytics from './pages/admin/SalesAnalytics';
import AdminPaymentReports from './pages/admin/AdminPaymentReports';
import AdminProfileSettings from './pages/admin/AdminProfileSettings';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerProperties from './pages/customer/CustomerProperties';
import CustomerPropertyDetails from './pages/customer/CustomerPropertyDetails';
import CustomerPurchaseRequests from './pages/customer/CustomerPurchaseRequests';
import CustomerPurchaseRequestCreate from './pages/customer/CustomerPurchaseRequestCreate';
import CustomerDocuments from './pages/customer/CustomerDocuments';
import CustomerPayments from './pages/customer/CustomerPayments';
import CustomerPaymentCreate from './pages/customer/CustomerPaymentCreate';
import CustomerConstruction from './pages/customer/CustomerConstruction';
import CustomerChangeRequests from './pages/customer/CustomerChangeRequests';
import CustomerChangeRequestCreate from './pages/customer/CustomerChangeRequestCreate';
import CustomerFeedback from './pages/customer/CustomerFeedback';
import CustomerFeedbackCreate from './pages/customer/CustomerFeedbackCreate';

// Staff pages
import StaffAssignedProperties from './pages/staff/StaffAssignedProperties';
import StaffPropertyDetails from './pages/staff/StaffPropertyDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin routes */}
          <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="properties/create" element={<AdminPropertyCreate />} />
            <Route path="properties/edit/:id" element={<AdminPropertyEdit />} />
            <Route path="construction" element={<AdminConstructionRequests />} />
            <Route path="purchase-requests" element={<AdminPurchaseRequests />} />
            <Route path="purchase-requests/:id" element={<AdminPurchaseRequestView />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerView />} />
            <Route path="customers/:id/edit" element={<AdminCustomerEdit />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id/edit" element={<AdminUserEdit />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="payment-reports" element={<AdminPaymentReports />} />
            <Route path="change-requests" element={<AdminChangeRequests />} />
            <Route path="change-requests/:id" element={<AdminChangeRequestView />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="analytics" element={<SalesAnalytics />} />
            <Route path="analytics-sales" element={<SalesAnalytics />} />
            <Route path="profile" element={<AdminProfileSettings />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Customer routes */}
          <Route path="/customer" element={<DashboardLayout allowedRoles={['customer']} />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="properties" element={<CustomerProperties />} />
            <Route path="properties/:id" element={<CustomerPropertyDetails />} />
            <Route path="purchase-requests" element={<CustomerPurchaseRequests />} />
            <Route path="purchase-requests/new/:propertyId" element={<CustomerPurchaseRequestCreate />} />
            <Route path="documents" element={<CustomerDocuments />} />
            <Route path="payments" element={<CustomerPayments />} />
            <Route path="payments/new" element={<CustomerPaymentCreate />} />
            <Route path="construction" element={<CustomerConstruction />} />
            <Route path="change-requests" element={<CustomerChangeRequests />} />
            <Route path="change-requests/new" element={<CustomerChangeRequestCreate />} />
            <Route path="feedback" element={<CustomerFeedback />} />
            <Route path="feedback/new" element={<CustomerFeedbackCreate />} />
            <Route path="profile" element={<Profile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Staff routes */}
          <Route path="/staff" element={<DashboardLayout allowedRoles={['maintenance_staff']} />}>
            <Route index element={<StaffAssignedProperties />} />
            <Route path="properties" element={<StaffAssignedProperties />} />
            <Route path="properties/:id" element={<StaffPropertyDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
