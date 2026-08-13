'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Download, File } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { compressImage } from '@/lib/compress';

export interface FileData {
  id: string;
  project_id: string;
  name: string;
  url: string;
  version: number;
  uploaded_at: string;
  approved_by_client: boolean;
}

interface FileUploaderProps {
  projectId: string;
  files: FileData[];
  onRefresh: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  projectId,
  files,
  onRefresh,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const supabase = createClient();

  const handleUpload = async (file: File) => {
    // 1. Guard: Limit to 50MB
    const limit = 50 * 1024 * 1024;
    if (file.size > limit) {
      toast.error('File size exceeds the 50MB limit');
      return;
    }

    setUploading(true);
    toast.loading('Compressing and preparing asset...', { id: 'upload' });

    try {
      // Apply browser-side image compression
      const compressedFile = await compressImage(file);

      // Calculate next version number
      const nextVersion = files.length > 0 ? Math.max(...files.map(f => f.version)) + 1 : 1;
      
      // Clean up file name & define path
      const cleanedName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${projectId}/v${nextVersion}_${cleanedName}`;

      // 2. Upload file to Supabase deliverables bucket
      const { data, error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          throw new Error('Storage bucket "deliverables" not found. Please create it in your Supabase dashboard → Storage → New Bucket → name it "deliverables" (public).');
        }
        throw new Error(uploadError.message || 'Error uploading file to storage.');
      }

      // 3. Insert record into public.files table
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          project_id: projectId,
          name: file.name,
          url: data.path,
          version: nextVersion,
          approved_by_client: false,
        });

      if (dbError) throw dbError;

      // 4. Log event (non-critical, don't block upload on failure)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('logs').insert({
          event: 'file_uploaded',
          project_id: projectId,
          user_id: user?.id,
          meta: { name: file.name, version: nextVersion },
        });
      } catch { /* logging is non-critical */ }

      toast.success(`v${nextVersion} delivery shared successfully!`, { id: 'upload' });
      onRefresh();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'File upload failed.', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: FileData) => {
    try {
      const { data, error } = await supabase.storage
        .from('deliverables')
        .createSignedUrl(file.url, 3600); // 1 hour expiry

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to generate download URL');
    }
  };

  // Drag and Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="border-b border-brand-border pb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted flex items-center gap-1.5 font-mono">
          <UploadCloud size={12} />
          Deliverables & Versions
        </span>
        <span className="text-[9px] font-mono text-brand-muted uppercase">
          Max size: 50MB
        </span>
      </div>

      {/* Upload Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border border-dashed p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors ${
          dragActive
            ? 'border-brand-accent bg-brand-accent/5'
            : 'border-brand-border hover:border-brand-accent bg-brand-bg/20'
        }`}
      >
        <UploadCloud size={28} className={dragActive ? 'text-brand-accent animate-pulse' : 'text-brand-muted'} />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-brand-text">
            Drag files here or click to upload
          </span>
          <span className="text-[10px] text-brand-muted font-sans">
            Files are automatically compressed & versioned
          </span>
        </div>
        <label className="mt-2 cursor-pointer">
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                await handleUpload(e.target.files[0]);
              }
            }}
          />
           <span className="inline-flex items-center justify-center font-bold px-4 py-2 border border-brand-border bg-brand-bg hover:bg-black hover:text-[#C8F04B] hover:border-black uppercase tracking-wider text-[10px] text-brand-text transition-colors">
            Choose File
          </span>
        </label>
      </div>

      {/* Uploaded Files List */}
      {files.length === 0 ? (
        <div className="text-[11px] text-brand-muted font-sans text-center py-2">
          No files shared yet. Initiate first delivery above.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted font-mono">
            Uploaded Assets
          </span>

          <div className="flex flex-col border border-brand-border bg-brand-bg/30 divide-y divide-brand-border">
            {files.map((file) => (
              <div key={file.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-brand-surface border border-brand-border text-brand-text shrink-0">
                    <File size={16} />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-brand-text truncate">
                        {file.name}
                      </span>
                      <Badge variant="gray">v{file.version}</Badge>
                    </div>

                    <span className="text-[10px] text-brand-muted font-mono uppercase mt-0.5">
                      {new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  {file.approved_by_client ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase font-mono tracking-wider">
                      <CheckCircle2 size={12} />
                      Approved
                    </div>
                  ) : (
                    <span className="text-[9px] font-mono text-brand-muted uppercase font-semibold">
                      Awaiting approval
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1.5 border border-brand-border hover:border-brand-accent hover:bg-brand-bg hover:text-brand-accent bg-brand-surface transition-colors"
                    title="Download File"
                  >
                    <Download size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
