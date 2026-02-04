import {HashRouter as Router, Routes, Route} from "react-router-dom";
import Layout from "./components/Layout";
import SignIn from "./pages/auth/SignIn";

// Dashboard pages
import Dashboard from "./pages/dashboard/Dashboard";
import ManageInvoice from "./pages/dashboard/Sales/ManageInvoice";
import ManageSales from "./pages/dashboard/Sales/ManageSales";
import ManageUserSales from "./pages/dashboard/Sales/ManageUserSales";
import ReturnList from "./pages/dashboard/Sales/ReturnList";
import CreateProducts from "./pages/dashboard/Products/CreateProducts.tsx";
import StockList from "./pages/dashboard/Stock/StockList.tsx";
import CreateQuotation from "./pages/dashboard/Quotation/CreateQuotation.tsx";
import ManageSupplier from "./pages/dashboard/Supplier/ManageSupplier.tsx";
import SupplierPayment from "./pages/dashboard/Supplier/SupplierPayment";
import ManageCustomer from "./pages/dashboard/Customer/ManageCustomer.tsx";
import Accounts from "./pages/dashboard/Accounts";
import Reports from "./pages/dashboard/Reports";
import Setting from "./pages/dashboard/Setting";
import QuotationList from "./pages/dashboard/Quotation/QuotationList.tsx";
import OutOfStock from "./pages/dashboard/Stock/OutOfStock.tsx";
import DamagedStock from "./pages/dashboard/Stock/DamagedStock.tsx";
import LowStock from "./pages/dashboard/Stock/LowStock.tsx";
import ProductList from "./pages/dashboard/Products/ProductList.tsx";
import ManageUnit from "./pages/dashboard/Products/ManageUnit.tsx";
import ManageCategory from "./pages/dashboard/Products/ManageCategory.tsx";
import DeactivatedProducts from "./pages/dashboard/Products/DeactivatedProducts.tsx";
import CreateSupplier from "./pages/dashboard/Supplier/CreateSupplier.tsx";
import ManageCompany from "./pages/dashboard/Supplier/ManageCompany.tsx";
import SupplierGRN from "./pages/dashboard/Supplier/SupplierGRN.tsx";
import ManageEmployee from "./pages/dashboard/Employee/ManageEmployee.tsx";
import AttendanceMark from "./pages/dashboard/Employee/AttendanceMark.tsx";
import AttendanceReport from "./pages/dashboard/Employee/Attendance Report.tsx";
import EmployeeSalary from "./pages/dashboard/Employee/EmployeeSalary.tsx";
import ManageUser from "./pages/dashboard/User/ManageUser.tsx";
import CreateGrn from "./pages/dashboard/grn/CreateGrn.tsx";
import ManageBrand from "./pages/dashboard/Products/ManageBrand.tsx";
import GrnList from "./pages/dashboard/grn/GrnList.tsx";
import POS from "./pages/dashboard/POS.tsx";
import ManageProductType from "./pages/dashboard/Products/ManageProductType.tsx";
import BackUp from "./pages/dashboard/BackUp.tsx";
import DatabaseSetup from "./pages/setup/DatabaseSetup.tsx";
import {PublicRoute} from "./components/PublicRoute.tsx";
import {ProtectedRoute} from "./components/ProtectedRoute.tsx";
import InternetStatusWrapper from "./components/InternetStatusWrapper";
import { UpdateNotification } from "./components/UpdateNotification";

import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
    return (
        <ThemeProvider>
            <Router>
            <InternetStatusWrapper>
                <UpdateNotification />
                <Routes>
                    {/* Auth */}
                    <Route path="/signin" element={
                        <PublicRoute>
                            <SignIn/>
                        </PublicRoute>
                    }/>
                    <Route path="/setup" element={<DatabaseSetup/>}/>
                    <Route path="/" element={
                        <PublicRoute>
                            <SignIn/>
                        </PublicRoute>
                    }/>
                    {/* Dashboard layout */}
                    <Route element={<Layout/>}>
                        {/* Dashboard - All authenticated users */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard/>
                            </ProtectedRoute>
                        }/>

                        {/* POS - Cashier & Admin */}
                        <Route path="/pos" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                                <POS/>
                            </ProtectedRoute>
                        }/>

                        {/* Sales - Cashier & Admin */}
                        <Route path="/sales" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                                <ManageInvoice/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/sales/manage-invoice" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                                <ManageInvoice/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/sales/manage-sales" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                                <ManageSales/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/sales/manage-user-sales" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <ManageUserSales/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/sales/return-history" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                                <ReturnList/>
                            </ProtectedRoute>
                        }/>

                        {/* Quotation - All roles */}
                        <Route path="/quotation" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier', 'Storekeeper']}>
                                <CreateQuotation/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/quotation/create-quotation" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier', 'Storekeeper']}>
                                <CreateQuotation/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/quotation/quotation-list" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier', 'Storekeeper']}>
                                <QuotationList/>
                            </ProtectedRoute>
                        }/>

                        {/* Stock - Storekeeper & Admin */}
                        <Route path="/stock" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <StockList/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/stock/stock-list" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <StockList/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/stock/out-of-stock" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <OutOfStock/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/stock/damaged-stock" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <DamagedStock/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/stock/low-stock" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <LowStock/>
                            </ProtectedRoute>
                        }/>

                        {/* GRN - Storekeeper & Admin */}
                        <Route path="/grn" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <CreateGrn/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/grn/create-grn" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <CreateGrn/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/grn/grn-list" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <GrnList/>
                            </ProtectedRoute>
                        }/>

                        {/* Products - Storekeeper & Admin */}
                        <Route path="/products" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <CreateProducts/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/products/create-product" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <CreateProducts/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/products/product-list" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <ProductList/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/products/manage-product-type" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <ManageProductType/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/products/manage-unit" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <ManageUnit/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/products/manage-category" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <ManageCategory/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/products/manage-brand" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Storekeeper']}>
                                <ManageBrand/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/products/deactivated-products" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <DeactivatedProducts/>
                            </ProtectedRoute>
                        }/>

                        {/* Supplier - Admin only */}
                        <Route path="/supplier" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <CreateSupplier/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/supplier/create-supplier" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <CreateSupplier/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/supplier/manage-supplier" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <ManageSupplier/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/supplier/manage-company" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <ManageCompany/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/supplier/supplier-grn" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <SupplierGRN/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/supplier/supplier-payments" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <SupplierPayment/>
                            </ProtectedRoute>
                        }/>

                        {/* Customer - Cashier & Admin */}
                        <Route path="/customer" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                                <ManageCustomer/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/customer/manage-customer" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                                <ManageCustomer/>
                            </ProtectedRoute>
                        }/>

                        {/* Employee - Admin only */}
                        <Route path="/employee" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <ManageEmployee/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/employee/manage-employee" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <ManageEmployee/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/employee/attendance-mark" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AttendanceMark/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/employee/attendance-report" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AttendanceReport/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/employee/employee-salary" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <EmployeeSalary/>
                            </ProtectedRoute>
                        }/>

                        {/* User Management - Admin only */}
                        <Route path="/manage-users" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <ManageUser/>
                            </ProtectedRoute>
                        }/>

                        {/* Accounts & Reports - Admin only */}
                        <Route path="/accounts" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <Accounts/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/reports" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <Reports/>
                            </ProtectedRoute>
                        }/>

                        {/* Settings & Backup - Admin only */}
                        <Route path="/setting" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <Setting/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/back-up" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <BackUp/>
                            </ProtectedRoute>
                        }/>

                    </Route>
                </Routes>
            </InternetStatusWrapper>
        </Router>
        </ThemeProvider>
    );
}
