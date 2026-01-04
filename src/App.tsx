import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SignIn from "./pages/auth/SignIn";

// Dashboard pages
import Dashboard from "./pages/dashboard/Dashboard";
import ManageInvoice from "./pages/dashboard/Sales/ManageInvoice";
import ManageSales from "./pages/dashboard/Sales/ManageSales";
import ManageUserSales from "./pages/dashboard/Sales/ManageUserSales";
import CreateProducts from "./pages/dashboard/Products/CreateProducts.tsx";
import StockList from "./pages/dashboard/Stock/StockList.tsx";
import CreateQuotation from "./pages/dashboard/Quotation/CreateQuotation.tsx";
import ManageSupplier from "./pages/dashboard/Supplier/ManageSupplier.tsx";
import SupplierPayment from "./pages/dashboard/Supplier/SupplierPayment";
import ManageCustomer from "./pages/dashboard/Customer/ManageCustomer.tsx";
import Accounts from "./pages/dashboard/Accounts";
import Reports from "./pages/dashboard/Reports";
import Setting from "./pages/dashboard/Setting";
import QuatationList from "./pages/dashboard/Quotation/QuatationList.tsx";
import OutOfStock from "./pages/dashboard/Stock/OutOfStock.tsx";
import DamagedStock from "./pages/dashboard/Stock/DamagedStock.tsx";
import LowStock from "./pages/dashboard/Stock/LowStock.tsx";
import ProductList from "./pages/dashboard/Products/ProductList.tsx";
import ManageUnit from "./pages/dashboard/Products/ManageUnit.tsx";
import ManageCategory from "./pages/dashboard/Products/ManageCategory.tsx";
import RemovedProducts from "./pages/dashboard/Products/RemovedProducts.tsx";
import CreateSupplier from "./pages/dashboard/Supplier/CreateSupplier.tsx";
import SupplierGRN from "./pages/dashboard/Supplier/SupplierGRN.tsx";

import CustomerSales from "./pages/dashboard/Customer/CustomerSales.tsx";
import ManageEmployee from "./pages/dashboard/Employee/ManageEmployee.tsx";
import AttendanceMark from "./pages/dashboard/Employee/AttendanceMark.tsx";
import AttendanceReport from "./pages/dashboard/Employee/Attendance Report.tsx";
import EmployeeSalary from "./pages/dashboard/Employee/EmployeeSalary.tsx";
import ManageUser from "./pages/dashboard/ManageUser.tsx";
import CreateGrn from "./pages/dashboard/grn/CreateGrn.tsx";
import ManageBrand from "./pages/dashboard/Products/ManageBrand.tsx";
import GrnList from "./pages/dashboard/grn/GrnList.tsx";

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Auth */}
                <Route path="/signin" element={<SignIn />} />

                {/* Dashboard layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sales/manage-invoice" element={<ManageInvoice />} />
                    <Route path="/sales/manage-sales" element={<ManageSales />} />
                    <Route path="/sales/manage-user-sales" element={<ManageUserSales />} />
                    <Route path="/quotation/create-quotation" element={<CreateQuotation />} />
                    <Route path="/quotation/quotation-list" element={<QuatationList />} />
                    <Route path="/stock/stock-list" element={<StockList />} />
                    <Route path="/stock/out-of-stock" element={<OutOfStock />} />
                    <Route path="/stock/damaged-stock" element={<DamagedStock />} />
                    <Route path="/stock/low-stock" element={<LowStock />} />
                    <Route path="/grn/create-grn" element={<CreateGrn />} />
                    <Route path="/grn/grn-list" element={<GrnList />} />

                    <Route path="/products/create-product" element={<CreateProducts />} />
                    <Route path="/products/product-list" element={<ProductList />} />
                    <Route path="/products/manage-unit" element={<ManageUnit />} />
                    <Route path="/products/manage-category" element={<ManageCategory />} />
                    <Route path="/products/manage-brand" element={<ManageBrand />} />
                    <Route path="/products/removed-products" element={<RemovedProducts />} />
                    <Route path="/supplier/create-supplier" element={<CreateSupplier />} />
                    <Route path="/supplier/manage-supplier" element={<ManageSupplier />} />
                    <Route path="/supplier/supplier-grn" element={<SupplierGRN />} />
                    <Route path="/supplier/supplier-payments" element={<SupplierPayment />} />

                    <Route path="/customer/manage-customer" element={<ManageCustomer />} />
                    <Route path="/customer/customer-sales" element={<CustomerSales />} />
                    <Route path="/employee/manage-employee" element={<ManageEmployee />} />
                    <Route path="/employee/attendance-mark" element={<AttendanceMark />} />
                    <Route path="/employee/attendance-mark" element={<AttendanceMark />} />
                    <Route path="/employee/attendance-report" element={<AttendanceReport />} />
                    <Route path="/employeeemployee-salary" element={<EmployeeSalary />} />
                    <Route path="/manage-users" element={<ManageUser />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/setting" element={<Setting />} />
                </Route>
            </Routes>
        </Router>
    );
}
