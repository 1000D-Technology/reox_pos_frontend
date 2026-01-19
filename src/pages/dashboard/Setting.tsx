import { useState, useEffect } from 'react';
import { Printer, Upload, Settings as SettingsIcon, Save, RefreshCw, Image, FileText, Ruler, DollarSign, ShoppingCart, Package, Bell, Lock, Globe, CreditCard, BarChart3 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { PrintSettings, POSSettings, SystemSettings, PaymentSettings } from '../../types/settingConfig';
import { RollSize, FontSize, Language, Timezone, DateFormat, TimeFormat, Theme, BackupFrequency, SettingsTab } from '../../enum/settings';

function Setting() {
    const [activeTab, setActiveTab] = useState<string>(SettingsTab.PRINT);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [printSettings, setPrintSettings] = useState<PrintSettings>({
        rollSize: RollSize.SIZE_80MM,
        fontSize: FontSize.MEDIUM,
        headerText: 'WELCOME TO OUR STORE',
        footerText: 'Thank you for your purchase!',
        showLogo: true,
        showBarcode: true,
        showQR: false,
        paperWidth: '80',
        copies: 1,
        autocut: true,
        printDate: true,
        printTime: true
    });

    const [posSettings, setPOSSettings] = useState<POSSettings>({
        storeName: 'My POS Store',
        storeAddress: '123 Main Street, City',
        storePhone: '+1 234 567 8900',
        storeEmail: 'store@example.com',
        taxRate: 10,
        currency: 'Rs.',
        defaultDiscount: 0,
        lowStockAlert: 10,
        enableSound: true,
        enableVibration: false,
        quickSaleMode: false,
        showCustomerDisplay: true
    });

    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        language: Language.ENGLISH,
        timezone: Timezone.UTC,
        dateFormat: DateFormat.DD_MM_YYYY,
        timeFormat: TimeFormat.TWENTY_FOUR_HOUR,
        theme: Theme.LIGHT,
        notifications: true,
        autoBackup: true,
        backupFrequency: BackupFrequency.DAILY
    });

    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        cash: true,
        card: true,
        digitalWallet: false,
        bankTransfer: false
    });

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedPrintSettings = localStorage.getItem('printSettings');
        const savedPOSSettings = localStorage.getItem('posSettings');
        const savedSystemSettings = localStorage.getItem('systemSettings');
        const savedPaymentSettings = localStorage.getItem('paymentSettings');
        const savedLogoPath = localStorage.getItem('logoPath');

        if (savedPrintSettings) {
            setPrintSettings(JSON.parse(savedPrintSettings));
        }
        if (savedPOSSettings) {
            setPOSSettings(JSON.parse(savedPOSSettings));
        }
        if (savedSystemSettings) {
            setSystemSettings(JSON.parse(savedSystemSettings));
        }
        if (savedPaymentSettings) {
            setPaymentSettings(JSON.parse(savedPaymentSettings));
        }
        if (savedLogoPath) {
            setLogoPreview(savedLogoPath);
        }
    }, []);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please upload a PNG, JPG, or SVG file');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrintSettingChange = (field: keyof PrintSettings, value: string | boolean | number) => {
        setPrintSettings(prev => ({ ...prev, [field]: value }));
    };

    const handlePOSSettingChange = (field: keyof POSSettings, value: string | boolean | number) => {
        setPOSSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSystemSettingChange = (field: keyof SystemSettings, value: string | boolean) => {
        setSystemSettings(prev => ({ ...prev, [field]: value }));
    };

    const handlePaymentSettingChange = (field: keyof PaymentSettings, value: boolean) => {
        setPaymentSettings(prev => ({ ...prev, [field]: value }));
    };

    const saveSettings = async () => {
        try {
            // Save settings to localStorage
            localStorage.setItem('printSettings', JSON.stringify(printSettings));
            localStorage.setItem('posSettings', JSON.stringify(posSettings));
            localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
            localStorage.setItem('paymentSettings', JSON.stringify(paymentSettings));

            // Save logo if uploaded
            if (logoFile) {
                // Store the logo as base64 in localStorage
                // In a real application, you would upload this to a server
                // For now, we'll save the base64 data URL
                localStorage.setItem('logoPath', logoPreview);
                toast.success('Logo saved successfully!');
            }

            toast.success('Settings saved successfully!');
            console.log('Saved settings:', { printSettings, posSettings, systemSettings, paymentSettings, logoPath: logoPreview });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        }
    };

    const resetSettings = () => {
        const tabNames: { [key: string]: string } = {
            [SettingsTab.PRINT]: 'Print Settings',
            [SettingsTab.POS]: 'POS Settings',
            [SettingsTab.SYSTEM]: 'System Settings',
            [SettingsTab.PAYMENT]: 'Payment Settings'
        };

        if (confirm(`Are you sure you want to reset ${tabNames[activeTab]} to default?`)) {
            switch (activeTab) {
                case SettingsTab.PRINT:
                    // Reset print settings and logo
                    localStorage.removeItem('printSettings');
                    localStorage.removeItem('logoPath');

                    setPrintSettings({
                        rollSize: RollSize.SIZE_80MM,
                        fontSize: FontSize.MEDIUM,
                        headerText: 'WELCOME TO OUR STORE',
                        footerText: 'Thank you for your purchase!',
                        showLogo: true,
                        showBarcode: true,
                        showQR: false,
                        paperWidth: '80',
                        copies: 1,
                        autocut: true,
                        printDate: true,
                        printTime: true
                    });

                    setLogoPreview('');
                    setLogoFile(null);

                    toast.success('Print settings reset to default successfully!');
                    break;

                case SettingsTab.POS:
                    // Reset POS settings only
                    localStorage.removeItem('posSettings');

                    setPOSSettings({
                        storeName: 'My POS Store',
                        storeAddress: '123 Main Street, City',
                        storePhone: '+1 234 567 8900',
                        storeEmail: 'store@example.com',
                        taxRate: 10,
                        currency: 'Rs.',
                        defaultDiscount: 0,
                        lowStockAlert: 10,
                        enableSound: true,
                        enableVibration: false,
                        quickSaleMode: false,
                        showCustomerDisplay: true
                    });

                    toast.success('POS settings reset to default successfully!');
                    break;

                case SettingsTab.SYSTEM:
                    // Reset system settings only
                    localStorage.removeItem('systemSettings');

                    setSystemSettings({
                        language: Language.ENGLISH,
                        timezone: Timezone.UTC,
                        dateFormat: DateFormat.DD_MM_YYYY,
                        timeFormat: TimeFormat.TWENTY_FOUR_HOUR,
                        theme: Theme.LIGHT,
                        notifications: true,
                        autoBackup: true,
                        backupFrequency: BackupFrequency.DAILY
                    });

                    toast.success('System settings reset to default successfully!');
                    break;

                case SettingsTab.PAYMENT:
                    // Reset payment settings to default
                    localStorage.removeItem('paymentSettings');

                    setPaymentSettings({
                        cash: true,
                        card: true,
                        digitalWallet: false,
                        bankTransfer: false
                    });

                    toast.success('Payment settings reset to default successfully!');
                    break;

                default:
                    toast.error('Unknown settings tab');
            }

            console.log(`${tabNames[activeTab]} reset to default`);
        }
    };

    const tabs = [
        { id: SettingsTab.PRINT, name: 'Print Settings', icon: Printer, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
        { id: SettingsTab.POS, name: 'POS Settings', icon: ShoppingCart, color: 'bg-gradient-to-br from-green-500 to-green-600' },
        { id: SettingsTab.SYSTEM, name: 'System Settings', icon: SettingsIcon, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
        { id: SettingsTab.PAYMENT, name: 'Payment Settings', icon: CreditCard, color: 'bg-gradient-to-br from-orange-500 to-orange-600' }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
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

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">System Settings</h1>
                <p className="text-gray-600">Configure your POS system, print settings, and preferences</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={saveSettings}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    Save All Settings
                </button>
                <button
                    onClick={resetSettings}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Reset to Default
                </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl shadow-lg hover:shadow-xl cursor-pointer group relative overflow-hidden ${activeTab === tab.id ? 'ring-2 ring-green-500' : ''
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className={`p-3 rounded-full ${tab.color} shadow-md relative z-10`}>
                            <tab.icon className="w-6 h-6 text-white" />
                        </div>

                        <div className="w-px h-10 bg-gray-200"></div>

                        <div className="relative z-10 flex-1">
                            <p className="text-sm font-bold text-gray-700">{tab.name}</p>
                            {activeTab === tab.id && (
                                <span className="text-xs text-green-600 font-medium">✓ Active</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Print Settings Tab */}
            {activeTab === SettingsTab.PRINT && (
                <div className="space-y-6">
                    {/* Logo Upload Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Image className="w-6 h-6 text-blue-600" />
                            Store Logo
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label htmlFor="logo-upload" className="cursor-pointer">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600">Click to upload logo</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Preview</label>
                                <div className="border-2 border-gray-300 rounded-lg p-6 h-48 flex items-center justify-center bg-gray-50">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Image className="w-16 h-16 mx-auto mb-2" />
                                            <p className="text-sm">No logo uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Print Configuration */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Printer className="w-6 h-6 text-blue-600" />
                            Print Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Ruler className="w-4 h-4 inline mr-1" />
                                    Roll Size
                                </label>
                                <select
                                    value={printSettings.rollSize}
                                    onChange={(e) => handlePrintSettingChange('rollSize', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={RollSize.SIZE_57MM}>57mm (2.25 inches)</option>
                                    <option value={RollSize.SIZE_80MM}>80mm (3.15 inches)</option>
                                    <option value={RollSize.SIZE_76MM}>76mm (3 inches)</option>
                                    <option value={RollSize.SIZE_58MM}>58mm (2.28 inches)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Paper Width (mm)</label>
                                <input
                                    type="number"
                                    value={printSettings.paperWidth}
                                    onChange={(e) => handlePrintSettingChange('paperWidth', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                                <select
                                    value={printSettings.fontSize}
                                    onChange={(e) => handlePrintSettingChange('fontSize', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={FontSize.SMALL}>Small</option>
                                    <option value={FontSize.MEDIUM}>Medium</option>
                                    <option value={FontSize.LARGE}>Large</option>
                                    <option value={FontSize.EXTRA_LARGE}>Extra Large</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Copies</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={printSettings.copies}
                                    onChange={(e) => handlePrintSettingChange('copies', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                                <input
                                    type="text"
                                    value={printSettings.headerText}
                                    onChange={(e) => handlePrintSettingChange('headerText', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                                <input
                                    type="text"
                                    value={printSettings.footerText}
                                    onChange={(e) => handlePrintSettingChange('footerText', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={printSettings.showLogo}
                                    onChange={(e) => handlePrintSettingChange('showLogo', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Show Logo</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={printSettings.showBarcode}
                                    onChange={(e) => handlePrintSettingChange('showBarcode', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Show Barcode</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={printSettings.showQR}
                                    onChange={(e) => handlePrintSettingChange('showQR', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Show QR Code</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={printSettings.autocut}
                                    onChange={(e) => handlePrintSettingChange('autocut', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Auto Cut</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={printSettings.printDate}
                                    onChange={(e) => handlePrintSettingChange('printDate', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Print Date</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={printSettings.printTime}
                                    onChange={(e) => handlePrintSettingChange('printTime', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Print Time</span>
                            </label>
                        </div>
                    </div>

                    {/* Bill Preview */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            Bill Preview
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto border-2 border-dashed border-gray-300">
                            <div className="bg-white p-4 rounded shadow">
                                {printSettings.showLogo && logoPreview && (
                                    <div className="text-center mb-3">
                                        <img src={logoPreview} alt="Logo" className="h-16 mx-auto" />
                                    </div>
                                )}
                                <div className="text-center border-b pb-2 mb-2">
                                    <p className="font-bold text-sm">{printSettings.headerText}</p>
                                </div>
                                <div className="text-xs space-y-1 mb-2">
                                    <div className="flex justify-between">
                                        <span>Item 1</span>
                                        <span>Rs. 100.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Item 2</span>
                                        <span>Rs. 200.00</span>
                                    </div>
                                </div>
                                <div className="border-t pt-2 mb-2">
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>Total</span>
                                        <span>Rs. 300.00</span>
                                    </div>
                                </div>
                                {(printSettings.printDate || printSettings.printTime) && (
                                    <div className="text-xs text-gray-600 text-center mb-2">
                                        {printSettings.printDate && <span>Date: {new Date().toLocaleDateString()}</span>}
                                        {printSettings.printDate && printSettings.printTime && <span> | </span>}
                                        {printSettings.printTime && <span>Time: {new Date().toLocaleTimeString()}</span>}
                                    </div>
                                )}
                                <div className="text-center text-xs text-gray-600 border-t pt-2">
                                    <p>{printSettings.footerText}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* POS Settings Tab */}
            {activeTab === SettingsTab.POS && (
                <div className="space-y-6">
                    {/* Store Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6 text-green-600" />
                            Store Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                <input
                                    type="text"
                                    value={posSettings.storeName}
                                    onChange={(e) => handlePOSSettingChange('storeName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
                                <input
                                    type="text"
                                    value={posSettings.storePhone}
                                    onChange={(e) => handlePOSSettingChange('storePhone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                                <input
                                    type="email"
                                    value={posSettings.storeEmail}
                                    onChange={(e) => handlePOSSettingChange('storeEmail', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                                <textarea
                                    value={posSettings.storeAddress}
                                    onChange={(e) => handlePOSSettingChange('storeAddress', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-green-600" />
                            Business Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <input
                                    type="text"
                                    value={posSettings.currency}
                                    onChange={(e) => handlePOSSettingChange('currency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={posSettings.taxRate}
                                    onChange={(e) => handlePOSSettingChange('taxRate', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Default Discount (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={posSettings.defaultDiscount}
                                    onChange={(e) => handlePOSSettingChange('defaultDiscount', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Package className="w-4 h-4 inline mr-1" />
                                    Low Stock Alert Threshold
                                </label>
                                <input
                                    type="number"
                                    value={posSettings.lowStockAlert}
                                    onChange={(e) => handlePOSSettingChange('lowStockAlert', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={posSettings.enableSound}
                                    onChange={(e) => handlePOSSettingChange('enableSound', e.target.checked)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Enable Sound Effects</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={posSettings.quickSaleMode}
                                    onChange={(e) => handlePOSSettingChange('quickSaleMode', e.target.checked)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Quick Sale Mode</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={posSettings.showCustomerDisplay}
                                    onChange={(e) => handlePOSSettingChange('showCustomerDisplay', e.target.checked)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Customer Display</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* System Settings Tab */}
            {activeTab === SettingsTab.SYSTEM && (
                <div className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Globe className="w-6 h-6 text-purple-600" />
                            General Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                <select
                                    value={systemSettings.language}
                                    onChange={(e) => handleSystemSettingChange('language', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={Language.ENGLISH}>English</option>
                                    <option value={Language.SPANISH}>Spanish</option>
                                    <option value={Language.FRENCH}>French</option>
                                    <option value={Language.GERMAN}>German</option>
                                    <option value={Language.CHINESE}>Chinese</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                <select
                                    value={systemSettings.timezone}
                                    onChange={(e) => handleSystemSettingChange('timezone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={Timezone.UTC}>UTC</option>
                                    <option value={Timezone.EST}>EST (Eastern)</option>
                                    <option value={Timezone.CST}>CST (Central)</option>
                                    <option value={Timezone.PST}>PST (Pacific)</option>
                                    <option value={Timezone.GMT}>GMT</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                                <select
                                    value={systemSettings.dateFormat}
                                    onChange={(e) => handleSystemSettingChange('dateFormat', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={DateFormat.DD_MM_YYYY}>DD/MM/YYYY</option>
                                    <option value={DateFormat.MM_DD_YYYY}>MM/DD/YYYY</option>
                                    <option value={DateFormat.YYYY_MM_DD}>YYYY-MM-DD</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                                <select
                                    value={systemSettings.timeFormat}
                                    onChange={(e) => handleSystemSettingChange('timeFormat', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={TimeFormat.TWELVE_HOUR}>12-hour (AM/PM)</option>
                                    <option value={TimeFormat.TWENTY_FOUR_HOUR}>24-hour</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                                <select
                                    value={systemSettings.theme}
                                    onChange={(e) => handleSystemSettingChange('theme', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={Theme.LIGHT}>Light</option>
                                    <option value={Theme.DARK}>Dark</option>
                                    <option value={Theme.AUTO}>Auto (System)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                                <select
                                    value={systemSettings.backupFrequency}
                                    onChange={(e) => handleSystemSettingChange('backupFrequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={BackupFrequency.HOURLY}>Hourly</option>
                                    <option value={BackupFrequency.DAILY}>Daily</option>
                                    <option value={BackupFrequency.WEEKLY}>Weekly</option>
                                    <option value={BackupFrequency.MONTHLY}>Monthly</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={systemSettings.notifications}
                                    onChange={(e) => handleSystemSettingChange('notifications', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700 flex items-center gap-1">
                                    <Bell className="w-4 h-4" />
                                    Enable Notifications
                                </span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={systemSettings.autoBackup}
                                    onChange={(e) => handleSystemSettingChange('autoBackup', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">Enable Auto Backup</span>
                            </label>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Lock className="w-6 h-6 text-purple-600" />
                            Security Settings
                        </h3>
                        <div className="space-y-4">
                            <button className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                                Change Password
                            </button>
                            <button className="w-full md:w-auto px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium ml-0 md:ml-3">
                                Enable Two-Factor Authentication
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Settings Tab */}
            {activeTab === SettingsTab.PAYMENT && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-orange-600" />
                            Payment Methods
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 transition-colors">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={paymentSettings.cash}
                                            onChange={(e) => handlePaymentSettingChange('cash', e.target.checked)}
                                            className="w-5 h-5 text-orange-600"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">Cash</p>
                                            <p className="text-sm text-gray-600">Accept cash payments</p>
                                        </div>
                                    </div>
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </label>
                            </div>

                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 transition-colors">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={paymentSettings.card}
                                            onChange={(e) => handlePaymentSettingChange('card', e.target.checked)}
                                            className="w-5 h-5 text-orange-600"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">Credit/Debit Card</p>
                                            <p className="text-sm text-gray-600">Accept card payments</p>
                                        </div>
                                    </div>
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                </label>
                            </div>

                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 transition-colors">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={paymentSettings.digitalWallet}
                                            onChange={(e) => handlePaymentSettingChange('digitalWallet', e.target.checked)}
                                            className="w-5 h-5 text-orange-600"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">Digital Wallet</p>
                                            <p className="text-sm text-gray-600">PayPal, Google Pay, Apple Pay</p>
                                        </div>
                                    </div>
                                    <Package className="w-6 h-6 text-purple-600" />
                                </label>
                            </div>

                            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 transition-colors">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={paymentSettings.bankTransfer}
                                            onChange={(e) => handlePaymentSettingChange('bankTransfer', e.target.checked)}
                                            className="w-5 h-5 text-orange-600"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">Bank Transfer</p>
                                            <p className="text-sm text-gray-600">Direct bank transfers</p>
                                        </div>
                                    </div>
                                    <BarChart3 className="w-6 h-6 text-teal-600" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Setting;