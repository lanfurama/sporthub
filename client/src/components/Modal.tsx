import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDark?: boolean;
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
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity" />
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-xl shadow-2xl ${SIZE_CLASSES[size]} w-[calc(100%-32px)] max-h-[90vh] overflow-y-auto z-50 focus:outline-none`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#F9FAFB]">
            <Dialog.Title className="text-[14px] font-semibold text-text-primary tracking-tight">
              {title}
            </Dialog.Title>
            <Dialog.Close className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-gray-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="p-4">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
