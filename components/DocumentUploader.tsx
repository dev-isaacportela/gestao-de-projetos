"use client";
import { useState, useRef } from "react";
import { Upload, File, X, Check } from "lucide-react";

interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

interface Props {
  projectId: string;
  onDocumentAdded?: (doc: Document) => void;
}

export default function DocumentUploader({ projectId, onDocumentAdded }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    await handleFiles(files);
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (files) {
      await handleFiles(files);
    }
  }

  async function handleFiles(files: FileList) {
    setUploading(true);
    
    const newDocs: Document[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const doc: Document = {
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toLocaleDateString("pt-BR"),
      };
      newDocs.push(doc);
      onDocumentAdded?.(doc);
    }
    
    setDocuments(prev => [...prev, ...newDocs]);
    setUploading(false);
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeDocument(id: string) {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-outline_variant/30 hover:border-primary/50 bg-surface_container_low/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-on_surface_variant/60" />
          <div>
            <p className="text-sm font-medium text-on_surface">
              {uploading ? "Enviando..." : "Arraste documentos aqui"}
            </p>
            <p className="text-xs text-on_surface_variant mt-1">
              ou{" "}
              <button
                onClick={() => inputRef.current?.click()}
                className="text-primary hover:underline font-medium"
              >
                clique para selecionar
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-on_surface">
            Documentos ({documents.length})
          </h3>
          <div className="space-y-2">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-surface_container_low rounded-lg group hover:bg-surface_container_low/80 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <File size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on_surface truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-on_surface_variant">
                      {formatFileSize(doc.size)} • {doc.uploadedAt}
                    </p>
                  </div>
                  <Check size={16} className="text-emerald-500 flex-shrink-0" />
                </div>
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-surface_container/60 transition-all"
                >
                  <X size={16} className="text-error" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
