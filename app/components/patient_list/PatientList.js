import styles from '../../styles/Record.module.css';
import Patient from './Patient';

const PatientList = ({ records, action }) => {
    return (
        <ul className={styles.recordList}>
            {records.map((record) => (
                <Patient key={record.account.idx} {...record.account} publicKey={record.publicKey} action={action} />
            ))}
        </ul>
    );
};

export default PatientList;
