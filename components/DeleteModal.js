import { useEffect } from 'react';
import styles from './DeleteModal.module.css';

export default function DeleteModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    chatTitle = "this chat",
    onSettingsClick 
}) {
    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Delete chat?</h2>
                </div>
                
                <div className={styles.modalBody}>
                    <p className={styles.modalText}>
                        This will delete <strong>{chatTitle}</strong>.
                    </p>
                    <p className={styles.modalText}>
                        Visit <button 
                            className={styles.settingsLink} 
                            onClick={onSettingsClick}
                        >
                            settings
                        </button> to delete any memories saved during this chat.
                    </p>
                </div>
                
                <div className={styles.modalActions}>
                    <button 
                        className={styles.cancelButton} 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        className={styles.deleteButton} 
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

