import styles from './chat.module.css';

export default function Chat({ role, content }) {
    return (
        <div className={styles.chatContainer}>
            <div className={styles[role]}>
                <div className={styles.messageContent}>
                    {content}
                </div>
            </div>
        </div>
    );
}