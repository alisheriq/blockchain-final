import styles from '../../styles/Record.module.css';
import { CalendarIcon, TrashIcon } from '@heroicons/react/outline';

const Patient = ({ idx, content, marked, dateline, publicKey, action }) => {
    const handleMarkRecord = () => {
        // Only allow unchecked record to be marked
        if (marked) return;

        action(publicKey, idx);
    };

    const handleRemoveRecord = () => {
        action(publicKey, idx);
    };

    return (
        <li key={idx} className={styles.recordItem}>
            <div onClick={handleMarkRecord} className={`${styles.recordCheckbox} ${marked && styles.checked}`} />
            <div>
                <span className="recordText">{content}</span>
                {dateline && (
                    <div className={styles.recordDateline}>
                        <CalendarIcon className={styles.calendarIcon} />
                        <span>{dateline}</span>
                    </div>
                )}
            </div>
            <div className={styles.iconContainer}>
                <TrashIcon onClick={handleRemoveRecord} className={styles.trashIcon} />
            </div>
        </li>
    );
};

export default Patient;
