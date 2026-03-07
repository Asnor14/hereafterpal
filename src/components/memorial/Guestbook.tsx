'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, X, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

function EnvelopeIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 80 60"
      className="w-16 h-12 md:w-20 md:h-16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="15"
        width="76"
        height="43"
        rx="2"
        className="fill-memorial-surface dark:fill-memorialDark-surface stroke-memorial-accent dark:stroke-memorialDark-accent"
        strokeWidth="2"
      />
      {isOpen ? (
        <>
          <path
            d="M2 17L40 2L78 17"
            className="stroke-memorial-accent dark:stroke-memorialDark-accent fill-memorial-surfaceAlt dark:fill-memorialDark-surfaceAlt"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect
            x="12"
            y="8"
            width="56"
            height="30"
            rx="1"
            className="fill-white dark:fill-gray-200 stroke-memorial-border dark:stroke-memorialDark-border"
            strokeWidth="1"
          />
        </>
      ) : (
        <>
          <path
            d="M2 17L40 40L78 17"
            className="stroke-memorial-accent dark:stroke-memorialDark-accent"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="35" r="6" className="fill-memorial-accent dark:fill-memorialDark-accent" />
          <Heart size={8} className="absolute" style={{ left: '37px', top: '32px' }} />
        </>
      )}
    </svg>
  );
}

function EnvelopeCard({
  label,
  messages,
  onOpen,
  isLocked,
}: {
  label: string;
  messages: any[];
  onOpen: () => void;
  isLocked: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const count = messages.length;

  return (
    <motion.button
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center justify-between gap-3 p-4 md:p-6 rounded-memorial border border-memorial-border dark:border-memorialDark-border bg-memorial-surface dark:bg-memorialDark-surface hover:border-memorial-accent dark:hover:border-memorialDark-accent transition-all duration-300 cursor-pointer group w-[150px] md:w-[210px] h-[180px] md:h-[220px]"
    >
      <div className="relative flex-1 flex items-center justify-center">
        <EnvelopeIcon isOpen={isHovered} />
        {isLocked && (
          <div className="absolute top-0 right-0 p-1 bg-black/10 dark:bg-white/10 rounded-full">
            <Lock size={12} className="text-memorial-accent" />
          </div>
        )}
        {count > 0 && !isLocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-memorial-accent dark:bg-memorialDark-accent text-white dark:text-memorialDark-bg text-xs font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </div>
        )}
      </div>
      <div className="space-y-1 w-full text-center">
        <span className="text-sm md:text-base font-medium text-memorial-text dark:text-memorialDark-text block group-hover:text-memorial-accent dark:group-hover:text-memorialDark-accent transition-colors">
          {label}
        </span>
        <span className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary block">
          {isLocked ? 'Password required' : count === 0 ? 'No letters yet' : `${count} message${count > 1 ? 's' : ''}`}
        </span>
      </div>
    </motion.button>
  );
}

function LetterModal({
  title,
  messages,
  isOpen,
  onClose,
}: {
  title: string;
  messages: any[];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg max-h-[80vh] overflow-hidden memorial-card p-0 flex flex-col">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-memorial-divider dark:border-memorialDark-divider">
            <div className="flex items-center gap-3">
              <Mail size={24} className="text-memorial-accent dark:text-memorialDark-accent" />
              <h3 className="text-lg md:text-xl font-serif text-memorial-text dark:text-memorialDark-text">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt transition-colors"
            >
              <X size={20} className="text-memorial-textSecondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                <Mail size={48} className="mx-auto mb-4 opacity-30" />
                <p>No letters yet</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-4 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-border dark:border-memorialDark-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-memorial-text dark:text-memorialDark-text">
                      {msg.author_name || 'Anonymous'}
                    </h4>
                    <time className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                      {new Date(msg.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

type SenderFolder = {
  id: string;
  name: string;
  password_hash: string | null;
  is_active?: boolean;
};

export default function Guestbook({
  messages,
  senderFolders = [],
  onSubmit,
  isLoading,
}: {
  messages: any[];
  senderFolders?: SenderFolder[];
  onSubmit: any;
  isLoading: boolean;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBoxKey, setSelectedBoxKey] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingFolder, setPendingFolder] = useState<SenderFolder | null>(null);
  const [folderPassword, setFolderPassword] = useState('');
  const [verifiedFolderIds, setVerifiedFolderIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    senderFolderId: 'guest',
  });

  const prepared = useMemo(() => {
    const folders = (senderFolders || []).filter((f) => f?.is_active !== false);
    const buckets: Record<string, any[]> = {};
    const matchedMessageIds = new Set<string>();

    folders.forEach((folder) => {
      const folderMessages = (messages || []).filter((m) => {
        if (m.sender_folder_id === folder.id) return true;
        if (m.sender_folder_id) return false;
        const legacy = (m.role || m.sender_name || '').toString().trim().toLowerCase();
        return legacy && legacy === folder.name.trim().toLowerCase();
      });

      buckets[`folder:${folder.id}`] = folderMessages;
      folderMessages.forEach((m) => matchedMessageIds.add(m.id));
    });

    const guestMessages = (messages || []).filter((m) => !matchedMessageIds.has(m.id));
    buckets.guest = guestMessages;

    const cards = [
      ...folders.map((folder) => ({
        key: `folder:${folder.id}`,
        label: `From: ${folder.name}`,
        isLocked: !!folder.password_hash,
        folder,
      })),
      { key: 'guest', label: 'From: Starngers', isLocked: false, folder: null },
    ];

    return { buckets, cards, folders };
  }, [messages, senderFolders]);

  const openCard = (cardKey: string) => {
    if (cardKey === 'guest') {
      setSelectedBoxKey('guest');
      return;
    }

    const folderId = cardKey.replace('folder:', '');
    const folder = prepared.folders.find((f) => f.id === folderId);
    if (!folder) return;

    const isLocked = !!folder.password_hash;
    const isVerified = verifiedFolderIds.includes(folder.id);

    if (isLocked && !isVerified) {
      setPendingFolder(folder);
      setIsPasswordModalOpen(true);
      return;
    }

    setSelectedBoxKey(cardKey);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'senderFolderId' && value !== 'guest') {
      const folder = prepared.folders.find((f) => f.id === value);
      if (folder?.password_hash && !verifiedFolderIds.includes(folder.id)) {
        setPendingFolder(folder);
        setIsPasswordModalOpen(true);
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const verifyFolderPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFolder) return;

    // Note: this compares against the current DB value in password_hash.
    if (folderPassword === pendingFolder.password_hash) {
      setVerifiedFolderIds((prev) => (prev.includes(pendingFolder.id) ? prev : [...prev, pendingFolder.id]));
      setFormData((prev) => ({ ...prev, senderFolderId: pendingFolder.id }));
      toast.success(`Unlocked ${pendingFolder.name}`);
      setFolderPassword('');
      setPendingFolder(null);
      setIsPasswordModalOpen(false);
      return;
    }

    toast.error('Incorrect folder password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;

    const folder = prepared.folders.find((f) => f.id === formData.senderFolderId);

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        message: formData.message.trim(),
        senderFolderId: formData.senderFolderId === 'guest' ? null : formData.senderFolderId,
        senderName: folder?.name || 'Starngers',
        role: folder?.name || 'Starngers',
      });
      setFormData({ name: '', message: '', senderFolderId: 'guest' });
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMessages = selectedBoxKey ? prepared.buckets[selectedBoxKey] || [] : [];
  const selectedTitle = selectedBoxKey === 'guest'
    ? 'Letters from Starngers'
    : `Letters from ${prepared.folders.find((f) => `folder:${f.id}` === selectedBoxKey)?.name || 'Sender'}`;

  return (
    <>
      <div className="w-full">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-memorial-accent/30 border-t-memorial-accent dark:border-memorialDark-accent/30 dark:border-t-memorialDark-accent rounded-full animate-spin" />
            <p className="mt-4 text-memorial-textSecondary dark:text-memorialDark-textSecondary">Loading letters...</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 w-full">
            {prepared.cards.map((card) => (
              <EnvelopeCard
                key={card.key}
                label={card.label}
                messages={prepared.buckets[card.key] || []}
                isLocked={card.isLocked && !!card.folder && !verifiedFolderIds.includes(card.folder.id)}
                onOpen={() => openCard(card.key)}
              />
            ))}
          </div>
        )}
      </div>

      <LetterModal
        title={selectedTitle}
        messages={selectedMessages}
        isOpen={selectedBoxKey !== null}
        onClose={() => setSelectedBoxKey(null)}
      />

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsFormOpen(!isFormOpen)}
        className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 ${isFormOpen
          ? 'bg-memorial-text dark:bg-memorialDark-text'
          : 'bg-memorial-accent dark:bg-memorialDark-accent'
          }`}
        aria-label={isFormOpen ? 'Close letter form' : 'Write a letter'}
      >
        <AnimatePresence mode="wait">
          {isFormOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Mail size={24} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:bg-transparent md:backdrop-blur-none md:pointer-events-none"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-36 md:bottom-24 right-4 md:right-8 z-50 w-[calc(100%-2rem)] md:w-96 max-h-[70vh] overflow-y-auto"
            >
              <div className="memorial-card p-4 md:p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-serif text-memorial-text dark:text-memorialDark-text flex items-center gap-2">
                    <Mail size={20} className="text-memorial-accent dark:text-memorialDark-accent" />
                    Write a Letter
                  </h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="md:hidden p-2 text-memorial-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="floating-name" className="block text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="floating-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-accent dark:focus:border-memorialDark-accent transition-colors duration-200 text-sm"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="floating-role" className="block text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2">
                      Posting To
                    </label>
                    <select
                      id="floating-role"
                      name="senderFolderId"
                      value={formData.senderFolderId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-accent dark:focus:border-memorialDark-accent transition-colors duration-200 text-sm"
                    >
                      <option value="guest">Starngers / Friend</option>
                      {prepared.folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}{folder.password_hash ? ' (Password)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="floating-message" className="block text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2">
                      Your Letter *
                    </label>
                    <textarea
                      id="floating-message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-accent dark:focus:border-memorialDark-accent transition-colors duration-200 resize-none text-sm"
                      placeholder="Write your heartfelt message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim() || !formData.message.trim()}
                    className="w-full px-6 py-3 bg-memorial-accent dark:bg-memorialDark-accent text-white dark:text-memorialDark-bg rounded-memorial hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Letter
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-memorial-bg dark:bg-memorialDark-bg p-6 rounded-memorial shadow-memorial max-w-sm w-full border border-memorial-divider dark:border-memorialDark-divider"
            >
              <h3 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text mb-2">Folder Verification</h3>
              <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6">
                Enter password for <strong>{pendingFolder?.name}</strong>.
              </p>

              <form onSubmit={verifyFolderPassword} className="space-y-4">
                <input
                  type="password"
                  value={folderPassword}
                  onChange={(e) => setFolderPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  className="w-full bg-white dark:bg-memorialDark-surface border border-memorial-divider dark:border-memorialDark-divider rounded-memorial px-4 py-3 text-memorial-text dark:text-memorialDark-text outline-none focus:ring-2 focus:ring-memorial-accent/20"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setFolderPassword('');
                      setPendingFolder(null);
                    }}
                    className="flex-1 py-3 text-sm font-medium text-memorial-textSecondary hover:text-memorial-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-memorial-accent text-white rounded-memorial text-sm font-medium hover:opacity-90 transition-opacity">
                    Verify
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
