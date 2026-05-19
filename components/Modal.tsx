'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, onOpenChange, title, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-2xl shadow-sport-xl ${SIZE_CLASSES[size]} w-[calc(100%-32px)] max-h-[90vh] overflow-y-auto z-50 focus:outline-none`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <Dialog.Title className="text-base font-display font-bold text-ink tracking-tight">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close dialog"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
