// app/nfc-cards/customize/components/StyleCustomizer.jsx - NEW COMPONENT
"use client";

export default function StyleCustomizer({ styleOptions, onStyleChange }) {
    return (
        <div className="mt-8 p-6 bg-white rounded-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎨 Style Customization
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
                Customize the visual appearance of your card
            </p>

            <div className="space-y-6">
                {/* Background Color */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={styleOptions.backgroundColor}
                            onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                            type="text"
                            value={styleOptions.backgroundColor}
                            onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                            placeholder="#667eea"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-themeGreen"
                        />
                    </div>
                </div>

                {/* Text Color */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={styleOptions.textColor}
                            onChange={(e) => onStyleChange('textColor', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                            type="text"
                            value={styleOptions.textColor}
                            onChange={(e) => onStyleChange('textColor', e.target.value)}
                            placeholder="#ffffff"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-themeGreen"
                        />
                    </div>
                </div>

                {/* Text Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Size: {styleOptions.textSize}px
                    </label>
                    <input
                        type="range"
                        min="12"
                        max="24"
                        value={styleOptions.textSize}
                        onChange={(e) => onStyleChange('textSize', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>12px</span>
                        <span>18px</span>
                        <span>24px</span>
                    </div>
                </div>

                {/* Logo Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Size: {styleOptions.logoSize}px
                    </label>
                    <input
                        type="range"
                        min="40"
                        max="150"
                        value={styleOptions.logoSize}
                        onChange={(e) => onStyleChange('logoSize', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>40px</span>
                        <span>95px</span>
                        <span>150px</span>
                    </div>
                </div>

                {/* QR Code Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        QR Code Size: {styleOptions.qrSize}px
                    </label>
                    <input
                        type="range"
                        min="40"
                        max="100"
                        value={styleOptions.qrSize}
                        onChange={(e) => onStyleChange('qrSize', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>40px</span>
                        <span>70px</span>
                        <span>100px</span>
                    </div>
                </div>

                {/* Quick Presets */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Quick Color Presets
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { name: "Purple", bg: "#667eea", text: "#ffffff" },
                            { name: "Blue", bg: "#4299e1", text: "#ffffff" },
                            { name: "Green", bg: "#48bb78", text: "#ffffff" },
                            { name: "Red", bg: "#f56565", text: "#ffffff" },
                            { name: "Orange", bg: "#ed8936", text: "#ffffff" },
                            { name: "Pink", bg: "#ed64a6", text: "#ffffff" },
                            { name: "Teal", bg: "#38b2ac", text: "#ffffff" },
                            { name: "Dark", bg: "#2d3748", text: "#ffffff" }
                        ].map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => {
                                    onStyleChange('backgroundColor', preset.bg);
                                    onStyleChange('textColor', preset.text);
                                }}
                                className="w-full h-10 rounded-lg border-2 border-gray-300 hover:scale-105 transition-transform"
                                style={{ backgroundColor: preset.bg }}
                                title={preset.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Reset Button */}
                <button
                    onClick={() => {
                        onStyleChange('backgroundColor', '#667eea');
                        onStyleChange('textColor', '#ffffff');
                        onStyleChange('textSize', '16');
                        onStyleChange('logoSize', '60');
                        onStyleChange('qrSize', '60');
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
}