import styles from '../../styles/Record.module.css';
import PatientList from './PatientList';

const PatientSection = ({ title, records, action }) => {
    return (
        <div className={styles.recordSection}>
            <h1 className="title">
                {title} - {records.length}
            </h1>
            <PatientList records={records} action={action} />
        </div>
    );
};

export default PatientSection;
