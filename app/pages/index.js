import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { usePatient } from '../hooks/patient_list';
import Loading from '../components/Loading';
import PatientSection from '../components/patient_list/PatientSection';
import styles from '../styles/Home.module.css';

const Home = () => {
    const { 
        initialized, 
        initializeUser, 
        loading, 
        transactionPending, 
        completedRecords, 
        incompleteRecords, 
        addRecord, 
        markRecord, 
        removeRecord, 
        input, 
        handleChange 
    } = usePatient();

    return (
        <div className={styles.container}>
            <div className={styles.actionsContainer}>
                {initialized ? (
                    <div className={styles.recordInput}>
                        <div className={`${styles.recordCheckbox} ${styles.checked}`} />
                        <div className={styles.inputContainer}>
                            <form onSubmit={addRecord}>
                                <input 
                                    value={input} 
                                    onChange={handleChange} 
                                    id={styles.inputField} 
                                    type="text" 
                                    placeholder='Add a new patient record...' 
                                />
                            </form>
                        </div>
                        <div className={styles.iconContainer}>
                        </div>
                    </div>
                ) : (
                    <button type="button" className={styles.button} onClick={() => initializeUser()} disabled={transactionPending}>
                        Initialize
                    </button>
                )}
                <WalletMultiButton />
            </div>

            <div className={styles.mainContainer}>
                <Loading loading={loading}>
                    <PatientSection title="Current Patients" records={incompleteRecords} action={markRecord} />
                    <PatientSection title="Recovered Patients" records={completedRecords} action={removeRecord} />
                </Loading>
            </div>
        </div>
    );
};

export default Home;
