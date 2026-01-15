import React, { useRef, useState } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface FileUploadProps {
    onUpload: (urls: string | string[]) => void;
    accept?: string;
    label?: string;
    className?: string;
    multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUpload,
    accept = "image/*",
    label = "Subir archivo",
    className = "",
    multiple = false
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Preview (only first one)
        if (files[0].type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(files[0]);
        }

        setIsUploading(true);
        setError(null);

        try {
            const uploadPromises = files.map(file => api.uploadFile(file));
            const responses = await Promise.all(uploadPromises);
            const urls = responses.map(r => r.url);

            if (multiple) {
                onUpload(urls);
            } else {
                onUpload(urls[0]);
            }

            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
            setError("Error al subir archivo(s)");
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
                multiple={multiple}
                className="hidden"
            />

            {!preview ? (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg hover:border-neon-pink hover:text-neon-pink transition-all w-full text-gray-400 py-8"
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Upload className="w-5 h-5" />
                    )}
                    <span>{isUploading ? `Subiendo ${multiple ? 'archivos' : 'archivo'}...` : label}</span>
                </button>
            ) : (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-700 opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold bg-black/50 px-2 py-1 rounded">
                            {isUploading ? 'Subiendo...' : '¡Subido!'}
                        </span>
                    </div>
                    {!isUploading && (
                        <button
                            type="button"
                            onClick={clearPreview}
                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-red-500/80 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    )}
                </div>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};
