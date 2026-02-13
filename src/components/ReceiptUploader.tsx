'use client';

import { useState, useCallback } from 'react';
import { Upload, Loader2, Check, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ExtractedData {
    amount: number;
    currency: string;
    reference_no: string;
    payment_method: string;
    date: string;
    sender_name: string | null;
    status: string;
}

interface ReceiptUploaderProps {
    onExtracted: (data: ExtractedData, proofUrl: string) => void;
    onCancel?: () => void;
}

export default function ReceiptUploader({ onExtracted, onCancel }: ReceiptUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [extracting, setExtracting] = useState(false);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = useCallback((f: File) => {
        if (!f.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG)');
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setError(null);
        setExtracted(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const handleExtract = async () => {
        if (!file) return;
        setExtracting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('receipt', file);

            const res = await fetch('/api/receipt/extract', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Extraction failed');
            }

            setExtracted(result.data);
        } catch (err: any) {
            setError(err.message || 'Failed to extract receipt data');
        } finally {
            setExtracting(false);
        }
    };

    const handleConfirm = () => {
        if (extracted && preview) {
            onExtracted(extracted, preview);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!preview && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                        ${dragOver
                            ? 'border-memorial-accent bg-memorial-accent/5'
                            : 'border-memorial-borderLight dark:border-memorialDark-border hover:border-memorial-accent dark:hover:border-memorialDark-accent'
                        }`}
                    onClick={() => document.getElementById('receipt-input')?.click()}
                >
                    <Upload className="mx-auto mb-3 text-memorial-textTertiary dark:text-memorialDark-textTertiary" size={40} />
                    <p className="text-memorial-text dark:text-memorialDark-text font-medium mb-1">
                        Drop your receipt here or click to upload
                    </p>
                    <p className="text-sm text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                        Supports GCash, SeaBank, Maya receipts (JPG, PNG)
                    </p>
                    <input
                        id="receipt-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFile(f);
                        }}
                    />
                </div>
            )}

            {/* Preview + Actions */}
            {preview && (
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-48 h-64 rounded-lg overflow-hidden border border-memorial-borderLight dark:border-memorialDark-border flex-shrink-0">
                        <Image src={preview} alt="Receipt" fill className="object-contain bg-white" />
                        <button
                            onClick={() => { setPreview(null); setFile(null); setExtracted(null); }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <div className="flex-1 space-y-3">
                        {!extracted && !extracting && (
                            <button
                                onClick={handleExtract}
                                className="w-full py-3 px-4 bg-memorial-accent text-white rounded-lg hover:bg-memorial-accent/90 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <ImageIcon size={18} />
                                Extract Receipt Data with AI
                            </button>
                        )}

                        {extracting && (
                            <div className="flex items-center justify-center gap-3 py-6 text-memorial-accent">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="font-medium">Analyzing receipt...</span>
                            </div>
                        )}

                        {extracted && (
                            <div className="space-y-3">
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                    <p className="text-green-700 dark:text-green-300 font-medium text-sm flex items-center gap-2">
                                        <Check size={16} /> Data extracted successfully
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-3">
                                        <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase">Amount</p>
                                        <p className="text-lg font-bold text-memorial-text dark:text-memorialDark-text">
                                            {extracted.currency} {extracted.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-3">
                                        <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase">Payment Method</p>
                                        <p className="text-lg font-bold text-memorial-text dark:text-memorialDark-text">{extracted.payment_method}</p>
                                    </div>
                                    <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-3">
                                        <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase">Reference No.</p>
                                        <p className="text-sm font-mono font-medium text-memorial-text dark:text-memorialDark-text">{extracted.reference_no}</p>
                                    </div>
                                    <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-3">
                                        <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase">Date</p>
                                        <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">{extracted.date}</p>
                                    </div>
                                    {extracted.sender_name && (
                                        <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-3 col-span-2">
                                            <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase">Sender</p>
                                            <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">{extracted.sender_name}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> Confirm & Save
                                    </button>
                                    <button
                                        onClick={() => { setExtracted(null); }}
                                        className="py-2.5 px-4 border border-memorial-borderLight dark:border-memorialDark-border rounded-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:bg-memorial-bg dark:hover:bg-memorialDark-bg transition-colors"
                                    >
                                        Re-extract
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
            )}

            {onCancel && (
                <button
                    onClick={onCancel}
                    className="w-full py-2 text-sm text-memorial-textTertiary dark:text-memorialDark-textTertiary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors"
                >
                    Cancel
                </button>
            )}
        </div>
    );
}
