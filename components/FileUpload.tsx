import React, { useRef, useState } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface FileUploadProps {
    onUpload: (url: string) => void;
    accept?: string;
    label?: string;
    className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUpload,
    accept = "image/*",
    label = "Subir archivo",
    className = ""
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }

        setIsUploading(true);
        setError(null);

        try {
            const response = await api.uploadFile(file);
            onUpload(response.url);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
            setError("Error al subir archivo");
            setPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const clearPreview = () => {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
            />

            {!preview ? (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg hover:border-neon-pink hover:text-neon-pink transition-all w-full text-gray-400"
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Upload className="w-5 h-5" />
                    )}
                    <span>{isUploading ? 'Subiendo...' : label}</span>
                </button>
            ) : (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                        type="button"
                        onClick={clearPreview}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-red-500/80 transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-1 right-1 p-1 bg-green-500/80 rounded-full">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};
