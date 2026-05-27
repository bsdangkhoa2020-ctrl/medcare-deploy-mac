import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function FileUploader({ onUpload, file, setFile, isLoading }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...getRootProps()}
            className={clsx(
              "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 px-6 py-10 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out bg-white/40 backdrop-blur-sm",
              isDragActive ? "border-gold-DEFAULT bg-gold-light/50" : "border-gold-DEFAULT/30 hover:border-gold-DEFAULT hover:bg-gold-light/20",
              isDragReject && "border-danger bg-red-50",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="p-4 mb-4 rounded-full bg-gold-light text-gold-dark group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <UploadCloud className="w-10 h-10" />
            </div>
            
            <h3 className="mb-2 text-lg font-semibold text-ink font-serif">
              {isDragActive ? "Thả file vào đây..." : "Kéo thả file xét nghiệm"}
            </h3>
            
            <p className="text-sm text-ink-muted text-center max-w-xs">
              Hỗ trợ định dạng Ảnh (JPG, PNG) hoặc PDF. Tối đa 10MB.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-3xl p-6 relative overflow-hidden"
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-dark animate-spin mb-3" />
                <p className="text-sm font-medium text-ink animate-pulse">Đang tải lên & phân tích AI...</p>
              </div>
            )}

            <button 
              onClick={() => !isLoading && setFile(null)}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 bg-red-50 text-danger rounded-full hover:bg-red-100 transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gold-light flex items-center justify-center flex-shrink-0 border border-gold-DEFAULT/20">
                <FileType className="w-8 h-8 text-gold-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate mb-1" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-ink-muted">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={onUpload}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-ink text-gold-DEFAULT font-semibold rounded-xl shadow-md hover:bg-ink/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiến hành tải lên & Phân tích
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
