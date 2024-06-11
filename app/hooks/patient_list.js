import * as anchor from '@project-serum/anchor';
import { useEffect, useMemo, useState } from 'react';
import { RECORD_PROGRAM_PUBKEY } from '../constants';
import { IDL as profileIdl } from '../constants/idl';
import toast from 'react-hot-toast';
import { SystemProgram } from '@solana/web3.js';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { authorFilter } from '../utils';

export function usePatient() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const anchorWallet = useAnchorWallet();

    const [initialized, setInitialized] = useState(false);
    const [lastRecord, setLastRecord] = useState(0);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [transactionPending, setTransactionPending] = useState(false);
    const [input, setInput] = useState("");

    const program = useMemo(() => {
        if (anchorWallet) {
            const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
            return new anchor.Program(profileIdl, RECORD_PROGRAM_PUBKEY, provider)
        }
    }, [connection, anchorWallet])

    useEffect(() => {
        const findProfileAccounts = async () => {
            if (program && publicKey && !transactionPending) {
                try {
                    setLoading(true);
                    const [profilePda, profileBump] = await findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId);
                    const profileAccount = await program.account.userProfile.fetch(profilePda);

                    if (profileAccount) {
                        setLastRecord(profileAccount.lastRecord);
                        setInitialized(true);

                        const recordAccounts = await program.account.recordAccount.all([authorFilter(publicKey.toString())]);
                        setRecords(recordAccounts);
                    } else {
                        setInitialized(false);
                    }
                } catch (error) {
                    console.log(error);
                    setInitialized(false);
                    setRecords([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        findProfileAccounts();
    }, [publicKey, program, transactionPending]);

    const initializeUser = async () => {
        if (program && publicKey) {
            try {
                setTransactionPending(true);
                const [profilePda, profileBump] = findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId);

                const tx = await program.methods
                    .initializeUser()
                    .accounts({
                        userProfile: profilePda,
                        authority: publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();
                setInitialized(true);
                toast.success('Successfully initialized user.');
            } catch (error) {
                console.log(error);
                toast.error(error.toString());
            } finally {
                setTransactionPending(false);
            }
        }
    };

    const addRecord = async (e) => {
        e.preventDefault();
        if (program && publicKey) {
            try {
                setTransactionPending(true);
                const [profilePda, profileBump] = findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId);
                const [recordPda, recordBump] = findProgramAddressSync([utf8.encode('RECORD_STATE'), publicKey.toBuffer(), Uint8Array.from([lastRecord])], program.programId);

                await program.methods
                    .addRecord(input)
                    .accounts({
                        userProfile: profilePda,
                        recordAccount: recordPda,
                        authority: publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();
                toast.success('Successfully added patient record.');
                setInput("");
            } catch (error) {
                console.log(error);
                toast.error(error.toString());
            } finally {
                setTransactionPending(false);
            }
        }
    };

    const markRecord = async (recordPda, recordIdx) => {
        if (program && publicKey) {
            try {
                setTransactionPending(true);
                setLoading(true);
                const [profilePda, profileBump] = findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId);

                await program.methods
                    .markRecord(recordIdx)
                    .accounts({
                        userProfile: profilePda,
                        recordAccount: recordPda,
                        authority: publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();
                toast.success('Successfully marked patient as recovered.');
            } catch (error) {
                console.log(error);
                toast.success(error.toString());
            } finally {
                setLoading(false);
                setTransactionPending(false);
            }
        }
    };

    const removeRecord = async (recordPda, recordIdx) => {
        if (program && publicKey) {
            try {
                setTransactionPending(true);
                setLoading(true);
                const [profilePda, profileBump] = findProgramAddressSync([utf8.encode('USER_STATE'), publicKey.toBuffer()], program.programId);

                await program.methods
                    .removeRecord(recordIdx)
                    .accounts({
                        userProfile: profilePda,
                        recordAccount: recordPda,
                        authority: publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();
                toast.success('Successfully removed patient record.');
            } catch (error) {
                console.log(error);
                toast.error(error.toString());
            } finally {
                setLoading(false);
                setTransactionPending(false);
            }
        }
    };

    const handleChange = (e) => {
        setInput(e.target.value);
    };

    const incompleteRecords = useMemo(() => records.filter((record) => !record.account.marked), [records]);
    const completedRecords = useMemo(() => records.filter((record) => record.account.marked), [records]);

    return { 
        initialized, 
        initializeUser, 
        loading, 
        transactionPending, 
        completedRecords, 
        incompleteRecords, 
        addRecord, 
        markRecord, 
        removeRecord,
        handleChange,
        input
    };
}
