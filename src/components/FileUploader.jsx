import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function FileUploader({ onUpload, files, setFiles, isLoading }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles].slice(0, 10)); // Max 10
    }
  }, [setFiles]);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 10,
    disabled: isLoading
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {files.length === 0 ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...getRootProps()}
            className={clsx(
              "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 px-6 py-10 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out bg-white/40 backdrop-blur-sm",
              isDragActive ? "border-gold bg-gold-light/50" : "border-gold/30 hover:border-gold hover:bg-gold-light/20",
              isDragReject && "border-danger bg-red-50",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="p-4 mb-4 rounded-full bg-gold-light text-gold-dark group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <UploadCloud className="w-10 h-10" />
            </div>
            
            <h3 className="mb-2 text-lg font-semibold text-ink font-serif">
              {isDragActive ? "Thả file vào đây..." : "Kéo thả file kết quả xét nghiệm"}
            </h3>
            
            <p className="text-sm text-ink-muted text-center max-w-xs">
              Hỗ trợ định dạng Ảnh (JPG, PNG) hoặc PDF. Tối đa 10 file cùng lúc.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-3xl p-6 relative overflow-hidden border border-gold/30"
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-dark animate-spin mb-3" />
                <p className="text-sm font-medium text-ink animate-pulse">Đang đẩy dữ liệu lên hệ thống ({files.length} file)...</p>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-semibold text-ink">Đã chọn {files.length} file</h3>
              <button 
                onClick={() => !isLoading && setFiles([])}
                disabled={isLoading}
                className="text-xs text-danger font-medium hover:underline disabled:opacity-50"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center gap-4 bg-white/50 p-3 rounded-xl border border-gold/10">
                  <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center flex-shrink-0 border border-gold/20">
                    <FileType className="w-6 h-6 text-gold-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Unknown'}
                    </p>
                  </div>
                  <button 
                    onClick={() => !isLoading && removeFile(idx)}
                    disabled={isLoading}
                    className="p-1.5 bg-red-50 text-danger rounded-full hover:bg-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Thêm khu vực drop để kéo thêm file */}
            {files.length < 10 && !isLoading && (
               <div 
                 {...getRootProps()}
                 className="mt-3 p-3 border-2 border-dashed border-gold/30 rounded-xl text-center cursor-pointer hover:bg-gold-light/20 transition-colors"
               >
                 <input {...getInputProps()} />
                 <p className="text-sm font-medium text-gold-dark">+ Kéo thả hoặc bấm để thêm file (tối đa 10)</p>
               </div>
            )}

            <div className="mt-6 flex gap-3">
              <button 
                onClick={onUpload}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-ink text-gold font-semibold rounded-xl shadow-md hover:bg-ink/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận Tải lên ({files.length} file)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
