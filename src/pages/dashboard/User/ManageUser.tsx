import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    X,
    Users,
    Shield,
    CheckCircle,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Mail,
    Phone,
    Lock,
    UserCog
} from 'lucide-react';

import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { userRoleService } from '../../../services/userRoleService.ts';
import { userService } from '../../../services/userService';


interface User {
    id: number;
    no: string;
    name: string;
    email: string;
    contactNumber: string;
    role: string;
    isActive: boolean;
}

interface AddUserForm {
    name: string;
    email: string;
    contactNumber: string;
    role: string;
    password: string;
    confirmPassword: string;
}

interface EditUserForm {
    contactNumber: string;
    role: string;
    password: string;
    confirmPassword: string;
}

interface UserRole {
    id: number;
    user_role: string;
}

function ManageUser() {
    const [users, setUsers] = useState<User[]>([]);

    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const userData: User[] = currentUsers.map((user, index) => ({
        ...user,
        no: (startIndex + index + 1).toString()
    }));

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [addForm, setAddForm] = useState<AddUserForm>({
        name: '',
        email: '',
        contactNumber: '',
        role: '',
        password: '',
        confirmPassword: ''
    });

    const [editForm, setEditForm] = useState<EditUserForm>({
        contactNumber: '',
        role: '',
        password: '',
        confirmPassword: ''
    });

    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);

    // Stats calculation
    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        adminUsers: users.filter(u => u.role === 'Admin' && u.isActive).length
    };

    const summaryCards = [
        {
            icon: Users,
            label: 'Total Users',
            value: stats.totalUsers.toString(),
            trend: '+12%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: CheckCircle,
            label: 'Active Users',
            value: stats.activeUsers.toString(),
            trend: '+8%',
            color: 'bg-gradient-to-br from-green-400 to-green-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: Shield,
            label: 'Admin Users',
            value: stats.adminUsers.toString(),
            trend: '+5%',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
    ];

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);

        if (!query.trim()) {
            setFilteredUsers(users);
            return;
        }

        const lowercaseQuery = query.toLowerCase();
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(lowercaseQuery) ||
            user.email.toLowerCase().includes(lowercaseQuery) ||
            user.contactNumber.toLowerCase().includes(lowercaseQuery) ||
            user.role.toLowerCase().includes(lowercaseQuery)
        );

        setFilteredUsers(filtered);
    };

    // Fetch users on component mount
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await userService.getAllUsers();
            if (response.success && response.data) {
                const mappedUsers: User[] = response.data.map((user: any, index: number) => ({
                    id: user.id,
                    no: (index + 1).toString(),
                    name: user.name,
                    email: user.email,
                    contactNumber: user.contact,
                    role: user.role_name,
                    isActive: user.status_name === 'Active'
                }));
                setUsers(mappedUsers);
                setFilteredUsers(mappedUsers);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Fetch roles on component mount
    useEffect(() => {
        const fetchRoles = async () => {
            setIsLoadingRoles(true);
            try {
                const response = await userRoleService.getRoles();
                if (response.success && response.data) {
                    const roles: UserRole[] = response.data;
                    setUserRoles(roles);
                    // Set default role if roles are available
                    if (roles.length > 0) {
                        setAddForm(prev => ({ ...prev, role: roles[0].id.toString() }));
                        setEditForm(prev => ({ ...prev, role: roles[0].id.toString() }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch roles:', error);
                toast.error('Failed to load user roles');
                setUserRoles([]);
            } finally {
                setIsLoadingRoles(false);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev < userData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [userData.length]);

    const handleAddUser = () => {
        setAddForm({
            name: '',
            email: '',
            contactNumber: '',
            role: userRoles.length > 0 ? userRoles[0].id.toString() : '',
            password: '',
            confirmPassword: ''
        });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        const roleId = userRoles.find(r => r.user_role === user.role)?.id.toString() || (userRoles.length > 0 ? userRoles[0].id.toString() : '');
        setEditForm({
            contactNumber: user.contactNumber,
            role: roleId,
            password: '',
            confirmPassword: ''
        });
        setIsEditModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setAddForm({
            name: '',
            email: '',
            contactNumber: '',
            role: userRoles.length > 0 ? userRoles[0].id.toString() : '',
            password: '',
            confirmPassword: ''
        });
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setEditForm({
            contactNumber: '',
            role: userRoles.length > 0 ? userRoles[0].id.toString() : '',
            password: '',
            confirmPassword: ''
        });
    };

    const validateAddForm = (): boolean => {
        if (!addForm.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (!addForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) {
            toast.error('Valid email is required');
            return false;
        }
        if (!addForm.contactNumber.trim() || addForm.contactNumber.length !== 10) {
            toast.error('Contact number must be 10 digits');
            return false;
        }
        if (!addForm.password || addForm.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (addForm.password !== addForm.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const validateEditForm = (): boolean => {
        if (!editForm.contactNumber.trim() || editForm.contactNumber.length !== 10) {
            toast.error('Contact number must be 10 digits');
            return false;
        }
        if (editForm.password && editForm.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (editForm.password && editForm.password !== editForm.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmitAdd = async () => {
        if (!validateAddForm()) return;

        setIsProcessing(true);

        try {
            // Prepare user data for API
            const userData = {
                name: addForm.name,
                email: addForm.email,
                contact: addForm.contactNumber,
                password: addForm.password,
                confirmPassword: addForm.confirmPassword,
                role: parseInt(addForm.role)
            };

            // Call the API
            const response = await userService.addUser(userData);

            if (response.success) {
                toast.success(response.message || 'User added successfully!');
                handleCloseAddModal();
                fetchUsers(); // Refresh the list
            }
        } catch (error: any) {
            console.error('Error adding user:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to add user. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmitEdit = async () => {
        if (!selectedUser || !validateEditForm()) return;

        setIsProcessing(true);

        try {
            // Prepare user data for API
            const userData: any = {
                contact: editForm.contactNumber,
                role_id: parseInt(editForm.role)
            };

            // Add password if provided
            if (editForm.password) {
                userData.password = editForm.password;
                userData.confirmPassword = editForm.confirmPassword;
            }

            // Call the API
            const response = await userService.updateUser(selectedUser.id, userData);

            if (response.success) {
                toast.success(response.message || 'User updated successfully!');
                if (editForm.password) {
                    toast.success('Password updated successfully!');
                }
                handleCloseEditModal();
                fetchUsers(); // Refresh the list from backend
            }
        } catch (error: any) {
            console.error('Error updating user:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update user. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        try {
            const response = await userService.toggleUserStatus(userId, newStatus);
            if (response.success) {
                toast.success(response.message || `User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
                fetchUsers(); // Refresh the list from backend
            }
        } catch (error: any) {
            console.error('Error toggling status:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update user status.';
            toast.error(errorMessage);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(0);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            case 'Manager':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            case 'Cashier':
                return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
            case 'Staff':
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
        }
    };

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10b981',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#ef4444',
                        },
                    },
                }}
            />
            <div className={'flex flex-col gap-4 h-full'}>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Users</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Manage User</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Manage User
                        </h1>
                    </div>
                    <button

                        onClick={handleAddUser}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
                    >
                        <Plus size={20} />
                        Add User
                    </button>
                </div>

                <div className={'grid md:grid-cols-3 grid-cols-1 gap-4'}>
                    {summaryCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl border border-gray-200 cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className={`p-3 rounded-full ${stat.color} relative z-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>

                            <div className="w-px h-10 bg-gray-200"></div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    className="bg-white rounded-xl p-4 border border-gray-200"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search users by name, email, contact, or role..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div

                    className={'flex flex-col bg-white rounded-xl p-4 justify-between gap-8 border border-gray-200'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[550px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {['#', 'Name', 'Email', 'Contact Number', 'Role', 'Status', 'Actions'].map((header, i, arr) => (
                                        <th
                                            key={header}
                                            scope="col"
                                            className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider
                                                ${i === 0 ? "rounded-tl-lg" : ""}
                                                ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                                <span className="ml-3 text-gray-600">Loading users...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : userData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    userData.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${selectedIndex === index
                                                ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {user.no}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {user.contactNumber}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusToggle(user.id, user.isActive);
                                                    }}
                                                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all transform hover:scale-105 ${user.isActive
                                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                                                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                                                        }`}
                                                >
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(user);
                                                    }}
                                                    className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-bold text-gray-800">{userData.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                            <span className="font-bold text-gray-800">{filteredUsers.length}</span> users
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                            </button>
                            {getPageNumbers().map((page, index) =>
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="text-gray-400 px-2">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page as number)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === page
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div

                        className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Add New User</h2>
                            </div>
                            <button
                                onClick={handleCloseAddModal}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} />
                                            Full Name *
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        value={addForm.name}
                                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} />
                                            Email *
                                        </div>
                                    </label>
                                    <input
                                        type="email"
                                        value={addForm.email}
                                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} />
                                            Contact Number *
                                        </div>
                                    </label>
                                    <input
                                        type="tel"
                                        value={addForm.contactNumber}
                                        onChange={(e) => setAddForm({ ...addForm, contactNumber: e.target.value })}
                                        placeholder="0771234567"
                                        maxLength={10}
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <UserCog size={16} />
                                            User Role *
                                        </div>
                                    </label>
                                    <select
                                        value={addForm.role}
                                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                                        disabled={isLoadingRoles}
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingRoles ? (
                                            <option value="">Loading roles...</option>
                                        ) : (
                                            userRoles.map(role => (
                                                <option key={role.id} value={role.id}>{role.user_role}</option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Lock size={16} />
                                            Password *
                                        </div>
                                    </label>
                                    <input
                                        type="password"
                                        value={addForm.password}
                                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                        placeholder="Min 6 characters"
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Lock size={16} />
                                            Confirm Password *
                                        </div>
                                    </label>
                                    <input
                                        type="password"
                                        value={addForm.confirmPassword}
                                        onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                                        placeholder="Re-enter password"
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={handleCloseAddModal}
                                    className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitAdd}
                                    disabled={isProcessing}
                                    className={`px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isProcessing ? 'Adding User...' : 'Add User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div
                        className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                                <p className="text-sm text-emerald-100">{selectedUser.name}</p>
                            </div>
                            <button
                                onClick={handleCloseEditModal}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <p className="text-sm font-semibold text-gray-800">{selectedUser.email}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} />
                                            Contact Number *
                                        </div>
                                    </label>
                                    <input
                                        type="tel"
                                        value={editForm.contactNumber}
                                        onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                                        placeholder="0771234567"
                                        maxLength={10}
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <UserCog size={16} />
                                            User Role *
                                        </div>
                                    </label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    >
                                        {userRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.user_role}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Lock size={16} />
                                            New Password (Optional)
                                        </div>
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        placeholder="Leave blank to keep current"
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Lock size={16} />
                                            Confirm New Password
                                        </div>
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.confirmPassword}
                                        onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                                        placeholder="Re-enter new password"
                                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={handleCloseEditModal}
                                    className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitEdit}
                                    disabled={isProcessing}
                                    className={`px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isProcessing ? 'Updating...' : 'Update User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ManageUser;