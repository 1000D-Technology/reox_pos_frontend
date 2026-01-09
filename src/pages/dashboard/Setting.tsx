import { useState } from 'react';
import { Printer, Upload, Settings as SettingsIcon, Save, RefreshCw, Image, FileText, Ruler, DollarSign, Users, ShoppingCart, Package, Bell, Lock, Globe, CreditCard, BarChart3 } from 'lucide-react';

interface PrintSettings {
    rollSize: string;
    fontSize: string;
    headerText: string;
    footerText: string;
    showLogo: boolean;
    showBarcode: boolean;
    showQR: boolean;
    paperWidth: string;
    copies: number;
    autocut: boolean;
    printDate: boolean;
    printTime: boolean;
}

interface POSSettings {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
    taxRate: number;
    currency: string;
    defaultDiscount: number;
    lowStockAlert: number;
    enableSound: boolean;
    enableVibration: boolean;
    quickSaleMode: boolean;
    showCustomerDisplay: boolean;
}

interface SystemSettings {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    theme: string;
    notifications: boolean;
    autoBackup: boolean;
    backupFrequency: string;
}

function Setting() {
    const [activeTab, setActiveTab] = useState<string>('print');
    const [logoPreview, setLogoPreview] = useState<string>('');

    const [printSettings, setPrintSettings] = useState<PrintSettings>({
        rollSize: '80mm',
        fontSize: 'medium',
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
        language: 'english',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24-hour',
        theme: 'light',
        notifications: true,
        autoBackup: true,
        backupFrequency: 'daily'
    });

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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

    const saveSettings = () => {
        console.log('Saving settings:', { printSettings, posSettings, systemSettings });
        alert('Settings saved successfully!');
    };

    const resetSettings = () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            console.log('Resetting settings to default');
        }
    };

    const tabs = [
        { id: 'print', name: 'Print Settings', icon: Printer, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
        { id: 'pos', name: 'POS Settings', icon: ShoppingCart, color: 'bg-gradient-to-br from-green-500 to-green-600' },
        { id: 'system', name: 'System Settings', icon: SettingsIcon, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
        { id: 'payment', name: 'Payment Settings', icon: CreditCard, color: 'bg-gradient-to-br from-orange-500 to-orange-600' }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
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
                        className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl shadow-lg hover:shadow-xl cursor-pointer group relative overflow-hidden ${
                            activeTab === tab.id ? 'ring-2 ring-green-500' : ''
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
            {activeTab === 'print' && (
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
                                    <option value="57mm">57mm (2.25 inches)</option>
                                    <option value="80mm">80mm (3.15 inches)</option>
                                    <option value="76mm">76mm (3 inches)</option>
                                    <option value="58mm">58mm (2.28 inches)</option>
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
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="extra-large">Extra Large</option>
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
            {activeTab === 'pos' && (
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
            {activeTab === 'system' && (
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
                                    <option value="english">English</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                    <option value="german">German</option>
                                    <option value="chinese">Chinese</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                <select
                                    value={systemSettings.timezone}
                                    onChange={(e) => handleSystemSettingChange('timezone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="EST">EST (Eastern)</option>
                                    <option value="CST">CST (Central)</option>
                                    <option value="PST">PST (Pacific)</option>
                                    <option value="GMT">GMT</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                                <select
                                    value={systemSettings.dateFormat}
                                    onChange={(e) => handleSystemSettingChange('dateFormat', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                                <select
                                    value={systemSettings.timeFormat}
                                    onChange={(e) => handleSystemSettingChange('timeFormat', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="12-hour">12-hour (AM/PM)</option>
                                    <option value="24-hour">24-hour</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                                <select
                                    value={systemSettings.theme}
                                    onChange={(e) => handleSystemSettingChange('theme', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto (System)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                                <select
                                    value={systemSettings.backupFrequency}
                                    onChange={(e) => handleSystemSettingChange('backupFrequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
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
            {activeTab === 'payment' && (
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
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-600" />
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
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-600" />
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
                                        <input type="checkbox" className="w-5 h-5 text-orange-600" />
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
                                        <input type="checkbox" className="w-5 h-5 text-orange-600" />
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