'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image';
import { AiOutlineSearch } from 'react-icons/ai';
import { UserButton } from "@clerk/nextjs";
import axios from 'axios'
import { useUser, clerkClient } from '@clerk/nextjs'

// Define the shape of your wallet data using TypeScript interfaces
interface WalletData {
  x_address: string;
  balance: number;
  secret: string;
  // ... any other properties that wallet data should have
}

// Define the shape of the realWallet state object
interface RealWalletData {
  classicAddress: string;
  xAddress: string;
  publicKey: string;
  seed: string;
  balance: string;
}

interface Transaction {
  tx: {
    Account: string;
    Fee: string;
    Flags: number;
    LastLedgerSequence: number;
    OfferSequence: number;
    Sequence: number;
    SigningPubKey: string;
    TakerGets: {
      currency: string;
      issuer: string;
      value: string;
    };
    TakerPays: string;
    TransactionType: string;
    TxnSignature: string;
    date: number;
    hash: string;
    inLedger: number;
    ledger_index: number;
  };
  validated: boolean;
}

export default function Home() { 
  //is wallet added true or false
  //wallet data after api call
  //default value is testWallet because its best if someone learns how to use this first before switching to main
  const [walletInfo, setWalletInfo] = useState<WalletData[]>([]);
  const [realWallets, setRealWallets] = useState<RealWalletData[]>([]);
  const [error, setError] = useState('');
  const [selectedWalletType, setSelectedWalletType] = useState('testWallet');
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [walletSet, isWalletSet] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useUser();
  const [userId, setUserId] = useState('');
  const [transactionId, setTransactionId] = useState('');


  // Assuming these are the correct types for your state:
  const [sendTxData, setSendTxData] = useState<{
    senderSecret: string;
    receiverAddress: string;
    senderAddress: string;
    amount: number;
    sequence: number;
  }>({
    senderSecret: '',
    receiverAddress: '',
    senderAddress: '',
    amount: 0, // Amount in drops
    sequence: 0,
  });


  useEffect(() => {
    const getUserId = async () => {
      if (user) {
          setUserId(user.id); 
      }
      else {
        setUserId('');
      }
    }
    getUserId();
  });

  useEffect(() => {
    const fetchWallets = async () => {
      if (user) {
        try {
          const userId = user.id; // or user.email for email
          const response = await axios.get(`https://xrp-dashboard-backend-e11b4f6d709d.herokuapp.com/xrpapp/listtestwallets/?userId=${userId}`);
          setWalletInfo(response.data);
        } catch (error) {
          console.error('Error fetching wallets:', error);
          setError('Failed to fetch wallets');
        }
      }
    };
  
    fetchWallets();
  }, [user]);


  useEffect(() => {
    const fetchWallets = async () => {
      if (user) {
        try {
          const userId = user.id; // or user.email for email
          const response = await axios.get(`https://xrp-dashboard-backend-e11b4f6d709d.herokuapp.com/xrpapp/listrealwallets/?userId=${userId}`);
          setRealWallets(response.data);
        } catch (error) {
          console.error('Error fetching wallets:', error);
          setError('Failed to fetch wallets');
        }
      }
    };
  
    fetchWallets();
  }, [user]);

  const deleteWallet = async (walletIndex: number): Promise<void> => {
    // Get the wallet to delete using the index
    const walletToDelete = walletInfo[walletIndex];
    console.log(walletToDelete);
  
    if (!walletToDelete) {
      console.error('Wallet not found.');
      setError('Wallet not found.');
      return;
    }
  
    try {
      const response = await axios.post('https://xrp-dashboard-backend-e11b4f6d709d.herokuapp.com/xrpapp/deletetestwallet/', JSON.stringify({ classic_address: walletToDelete.x_address }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check the response from the backend
      if (response.data.success) {
        // If successful, filter out the deleted wallet from the walletInfo state
        const updatedWallets = walletInfo.filter((_, index) => index !== walletIndex);
        setWalletInfo(updatedWallets);
  
        console.log('Wallet successfully deleted');
      } else {
        // If the backend returns an error, handle it here
        setError('Failed to delete wallet: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      setError('Error deleting wallet');
    }
  };
  


  const handleSendXrp = async (senderAddress: string): Promise<void> => {  
    if (!sendTxData.senderSecret || !sendTxData.receiverAddress || sendTxData.amount <= 0) {  
      setError('Please fill all transaction details correctly.');  
      return;  
    }  
    
    try {  
      const amountInDrops = sendTxData.amount; // Convert XRP to drops  
      const transactionData = {  
        senderSecret: sendTxData.senderSecret,  
        receiverAddress: sendTxData.receiverAddress,  
        amount: amountInDrops * 1000000,  // Amount in XRP  
        // ... other data if necessary  
      };  
    
      const response = await axios.post('http://localhost:8000/xrpapp/sendxrptransaction/', transactionData);  
      console.log(response);
      if (response.data.success) {  
        console.log('Transaction Successful:', response.data.response);  
        setTransactionId(response.data.response.transaction_id);
        fetchWalletData(transactionData.receiverAddress); // Update receiver wallet  
        fetchWalletData(senderAddress); // Update sender wallet  
      } else {  
        console.error('Transaction Failed:', response.data.error);  
      }  
    } catch (error) {  
      console.error('Error sending XRP:', error);  
    }  
  };  

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAddress(event.target.value); // Update the state when the public key input changes
  };

  const fetchWalletData = async (address: string): Promise<void> => {
    try {
      const response = await axios.post('http://localhost:8000/xrpapp/getaccountinfo/', { address });
      if (response.data) {
        const updatedWallets = walletInfo.map(wallet => 
          wallet.x_address === address ? { ...wallet, balance: response.data.balance } : wallet
        );
        setWalletInfo(updatedWallets); // Update the state with the new wallet data
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  // Call this function when the dropdown changes
  const handleWalletTypeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedWalletType(event.target.value);
    // Additional logic to load the wallet info based on the selection
  };

  // Function to initiate the search for the account details using the public key
  const fetchAccountDetails = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8000/xrpapp/getaccountinfo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: address })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      } else {
        const data = await response.json();
        console.log('Received data:', data); // Check the data structure
        
        if (data.classic_address && data.balance) {
          setAddress(data.classic_address);
          console.log(address);
          setBalance(data.balance / 1000000);
          console.log(balance);
          setTransactions(data.transactions); // Update this line to set the transactions
          console.log('Transactions:', data.transactions);
          isWalletSet(true);
        }
        else {
          console.log('Address or Balance is null');
        }
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to fetch account details:', error);
    }
  };

  // Render Transaction
  const renderTransaction = (tx: Transaction, index: number): JSX.Element => {
    const transactionDate = new Date(tx.tx.date).toLocaleString();

    const renderTakerGets = (takerGets: { currency: string; issuer: string; value: string } | string): JSX.Element => {
      if (takerGets && typeof takerGets === 'object' && 'currency' in takerGets) {
        return (
          <span>
            {takerGets.value} {takerGets.currency} (Issuer: {takerGets.issuer})
          </span>
        );
      } else if (typeof takerGets === 'string') {
        return <span>{takerGets} XRP</span>;
      } else {
        return <span>Data unavailable</span>;
      }
    };
  
    const renderTakerPays = (takerPays: { currency: string; issuer: string; value: string } | string): JSX.Element => {
      if (takerPays && typeof takerPays === 'object' && 'currency' in takerPays) {
        return (
          <span>
            {takerPays.value} {takerPays.currency} (Issuer: {takerPays.issuer})
          </span>
        );
      } else if (typeof takerPays === 'string') {
        return <span>{takerPays} XRP</span>;
      } else {
        return <span>Data unavailable</span>;
      }
    };
  
    // Render Transaction
    const renderTransaction = (tx: Transaction, index: number) => {
      const transactionDate = new Date(tx.tx.date * 1000).toLocaleString();
      return (
        <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm mb-4">
          <p><strong>Index:</strong> {index}</p>
          <p><strong>Account:</strong> {tx.tx.Account}</p>
          <p><strong>Fee:</strong> {tx.tx.Fee}</p>
          <p><strong>Transaction Type:</strong> {tx.tx.TransactionType}</p>
          <p><strong>Amount Taker Gets:</strong> {renderTakerGets(tx.tx.TakerGets)}</p>
          <p><strong>Amount Taker Pays:</strong> {renderTakerPays(tx.tx.TakerPays)}</p>
          <p><strong>Date:</strong> {transactionDate}</p>
          <p><strong>Validated:</strong> {tx.validated ? 'Yes' : 'No'}</p>
        </div>
      );
    };
    

    return (
      <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm mb-4">
        {/* Other transaction details */}
        <p><strong>Account:</strong> {tx.tx.Account}</p>
        <p><strong>Fee:</strong> {tx.tx.Fee}</p>
        <p><strong>Transaction Type:</strong> {tx.tx.TransactionType}</p>
        <p><strong>Amount Taker Gets:</strong> {renderTakerGets(tx.tx.TakerGets)}</p>
        <p><strong>Amount Taker Pays:</strong> {renderTakerPays(tx.tx.TakerPays)}</p>
        <p><strong>Date:</strong> {transactionDate}</p>
        <p><strong>Validated:</strong> {tx.validated ? 'Yes' : 'No'}</p>
      </div>
    );
  };


  const handleAddWalletClick = async (): Promise<void> => {
    const userId = user?.id;
  
    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
  
    // Only add the "Clerk-User-Id" header if userId is not undefined
    if (userId) {
      headers["Clerk-User-Id"] = userId;
    }
  
    try {
      const response = await fetch('http://localhost:8000/xrpapp/createtestwallet/', {
        method: 'POST',
        headers: headers,  // Directly using the headers object
      });
  
      // Check if the HTTP response status code is in the 200 range
      if (!response.ok) {
        // Handle HTTP errors
        setError(`HTTP error! Status: ${response.status}`);
      } else {
        // Parse the JSON response body
        const data = await response.json();
        if (data.x_address && typeof data.balance === 'number') {
          setWalletInfo(currentWallets => [...currentWallets, data]);
        }
        else {
          // Handle the case where JSON is returned but not the expected data
          setError('Invalid data format received from the server.');
        }
      }
    } catch (error: any) {
      // Handle network errors and show a user-friendly message
      console.error('Failed to add wallet:', error);
      setError('Network error. Please check your connection and try again.');
    }
  };
  

  const handleNewWallet = async (): Promise<void> => {
    // Ensure the user object is not undefined before proceeding
    if (!user) {
      setError("User not found. Please log in.");
      return;
    }
  
    const userId = user.id; // Assuming user object is available and has an id property
  
    // Setting up the headers with correct type
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      // Directly use the userId as it's already checked for undefined
      'Clerk-User-Id': userId,
    };
  
    try {
      const response = await fetch('http://localhost:8000/xrpapp/createwallet/', {
        method: 'POST',
        headers: headers,
      });
  
      if (!response.ok) {
        // Handle HTTP errors
        setError(`HTTP error! Status: ${response.status}`);
      } else {
        // Parse the JSON response body
        const data = await response.json();
        console.log("New real wallet data: ", data);
        setRealWallets(currentWallets => [...currentWallets, data]);
      }
    } catch (error: any) {
      // Handle network errors and show a user-friendly message
      console.error('Failed to create new wallet:', error);
      setError('Network error. Please check your connection and try again.');
    }
  };
  

  const deleteRealWallet = async (walletIndex: number): Promise<void> => {
    const walletToDelete = realWallets[walletIndex];
    console.log('I am deleting this wallet:', walletToDelete);
    console.log('I am deleting this address: ', walletToDelete.classicAddress)


    if (!walletToDelete) {
        console.error('Wallet not found.');
        setError('Wallet not found.');
        return;
    }

    try {
        const response = await axios.post('http://localhost:8000/xrpapp/deleterealwallet/', JSON.stringify({
            classic_address: walletToDelete.classicAddress
        }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            const updatedWallets = realWallets.filter((_, index) => index !== walletIndex);
            setRealWallets(updatedWallets);
            console.log('Real Wallet successfully deleted');
        } else {
            setError('Failed to delete real wallet: ' + response.data.error);
        }
    } catch (error) {
        console.error('Error deleting real wallet:', error);
        setError('Error deleting real wallet');
    }
};


  return (
    <div className="bg-gray-600">
      <div className="container mx-auto p-8 text-black">
            <header className="bg-white shadow-md p-4 mb-4 flex justify-between items-center rounded-md">
              <div className="flex items-center space-x-3">
                <Image src="/logo.png" alt="Platform Logo" width={40} height={40} className="rounded-full" />
                <h1 className="text-gray-900 text-2xl font-bold">Dashboard<span className="text-blue-600">X</span></h1>
              </div>
              <div className="flex items-center space-x-3 bg-gray-100 rounded-full border-2 border-gray-200">
                <input
                  type="text"
                  className="flex-grow py-2 px-4 bg-gray-100 rounded-l-full focus:outline-none"
                  placeholder="Search profiles..."
                />
                <button
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-full focus:outline-none"
                  aria-label="Search">
                  <AiOutlineSearch size={24} />
                </button>
              </div>
              <div className="flex items-center space-x-4">
                {/* Placeholder for user avatar; replace with actual user data as needed */}

                <UserButton afterSignOutUrl="/" >
                  {/* The UserButton component will be styled accordingly by the Clerk library */}
                </UserButton>
              </div>
            </header>


            {/* ... Rest of your dashboard code ... */ }
            <div className="grid grid-cols-3 gap-8">
              <aside className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow-lg">
                <div className="mb-8 flex items-center space-x-4">
                  <img src="pic.png" alt="User Avatar" className="h-16 w-16 rounded-full border-4 border-white shadow-sm transition-all hover:scale-105" />
                  <div>
                    <h1 className="text-xl font-extrabold text-white">Greetings, Nick</h1>
                    <p className="text-sm text-purple-200">Your last login was 3 hours ago</p>
                  </div>
                </div>
                <nav>
                <ul className="space-y-4">
                  {['Dashboard', 'Budget', 'Invest', 'Stake', 'Borrow', 'Settings'].map((text, index) => (
                    <li key={index} className="group">
                      <a href={`/${text.toLowerCase()}`} className="flex items-center justify-center p-3 rounded-lg transition-all bg-purple-700 bg-opacity-0 group-hover:bg-opacity-20 text-white">
                        <span className="capitalize">{text}</span>
                      </a>
                    </li>
                  ))}
                </ul>

                </nav>
                <div className="flex justify-between items-center mt-8 text-white text-opacity-70">
                { userId ?
                    <p className="text-sm text-purple-200">Your user id is {userId}</p>
                :
                    <p className="text-sm text-purple-200">You are not logged in</p>
                }
                </div>
                <div className="mt-4">
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Emergency Logout
                  </button>
                </div>
                <div className="mt-6">
                  <p className="text-xs text-center text-purple-200">Encounter issues? <a href="#" className="underline">Get Help</a></p>
                </div>
              </aside>

              <main className="col-span-2 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Your Wallets</h2>
                  <div className="relative">
                    <select
                      value={selectedWalletType}
                      onChange={handleWalletTypeChange}
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    >
                      <option value="testWallet">Test Wallet</option>
                      <option value="wallet">Real Wallet</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.576 0 0.436 0.445 0.408 1.197 0 1.615l-4.695 4.502c-0.408 0.392-1.141 0.392-1.549 0l-4.695-4.502c-0.408-0.418-0.436-1.17 0-1.615z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dynamic content for Wallet information */}
                <div className={`${walletInfo.length > 2 ? 'max-h-96 overflow-y-auto' : ''} grid grid-cols-1 gap-4`}>
                  {/* Test Wallets Rendering Section */}
                  {selectedWalletType === 'testWallet' && (
                    <div className={`${walletInfo.length > 2 ? 'max-h-96 overflow-y-auto' : ''} grid grid-cols-1 gap-4`}>
                      {walletInfo.length === 0 ? (
                        <p className="text-center text-gray-600">No test wallets added yet.</p>
                      ) : (
                        walletInfo.map((wallet, index) => (
                          <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                              <div className="">
                                  <h3 className="text-lg font-semibold mb-2">Wallet {index + 1}</h3>
                              </div>
                              <p className="text-xl font-medium text-gray-800"><strong>Balance:</strong> {wallet.balance} XRP</p>  
                              <div className="mt-4">
                                <input
                                  type="password"
                                  className="form-input w-full border-2 p-2 rounded-md"
                                  placeholder="Sender's Secret"
                                  onChange={(e) => setSendTxData({ ...sendTxData, senderSecret: e.target.value })}
                                />
                                <input
                                  className="form-input w-full border-2 p-2 rounded-md"
                                  placeholder="Amount XRP"
                                  onChange={(e) => setSendTxData({ ...sendTxData, amount: parseFloat(e.target.value) || 0 })}
                                />
                                <input
                                  className="form-input w-full border-2 p-2 rounded-md" 
                                  placeholder="Destination Address"
                                  onChange={(e) => setSendTxData({ ...sendTxData, receiverAddress: e.target.value })}
                                />
                                <div className="flex flex-col">
                                  <button
                                    className="mb-4 mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition ease-in-out duration-150"
                                    onClick={() => handleSendXrp(wallet.x_address)}
                                  >
                                    Send XRP
                                  </button>

                                  <button 
                                    onClick={() => deleteWallet(index)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
                                  >
                                    Delete Wallet
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm mt-2 text-gray-500"><b>Seed:</b> {wallet.secret}</p>
                              <p className="text-sm mt-2 text-gray-500"><b>Public Key:</b> {wallet.x_address}</p>
                              <p className="text-sm mt-2 text-gray-500"><b>XRP Amount:</b> [EXAMPLE: 5 XRP will be converted to 5000000 drops automatically]</p>
                              <b>Transaction ID:</b> {transactionId || 'N/A'}
                            </div>
                            <div className="text-right">
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Dynamic content for Wallet information */}
                  <div className={`${realWallets.length > 2 ? 'max-h-96 overflow-y-auto' : ''} grid grid-cols-1 gap-4`}>
                    {/* Test Wallets Rendering Section */}
                    {selectedWalletType === 'wallet' && (
                      <div className={`${realWallets.length > 2 ? 'max-h-96 overflow-y-auto' : ''} grid grid-cols-1 gap-4`}>
                        {realWallets.length === 0 ? (
                          <p className="text-center text-gray-600">No real wallets added yet.</p>
                        ) : (
                          realWallets.map((wallet, index) => (
                            <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-semibold mb-2">Wallet {index + 1}</h3>
                                <p className="text-xl font-medium text-gray-800"><strong>Balance:</strong> {wallet.balance} XRP</p>  
                                <div className="mt-4">
                                  <input 
                                    type="password" 
                                    className="form-input w-full border-2 p-2 rounded-md" 
                                    placeholder="Sender's Secret"
                                    onChange={(e) => setSendTxData({ ...sendTxData, senderSecret: e.target.value })}
                                  />
                                  <input 
                                    className="form-input w-full border-2 p-2 rounded-md" 
                                    placeholder="Amount XRP"
                                    onChange={(e) => setSendTxData({ ...sendTxData, amount: parseFloat(e.target.value) || 0 })}
                                  />
                                  <input 
                                    className="form-input w-full border-2 p-2 rounded-md" 
                                    placeholder="Destination Address"
                                    onChange={(e) => setSendTxData({ ...sendTxData, receiverAddress: e.target.value })}
                                  />
                                  <div className="flex flex-col">
                                    <button
                                      className="mb-4 mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition ease-in-out duration-150"
                                      onClick={() => handleSendXrp(wallet.classicAddress)}  // Adjusted property access
                                    >
                                      Send XRP
                                    </button>

                                    <button 
                                      onClick={() => deleteRealWallet(index)}
                                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
                                    >
                                      Delete Wallet
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm mt-2 text-gray-500">Public Key: {wallet.classicAddress}</p>  {/* Adjusted property access */}
                              </div>
                              <div className="text-right">
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Wallet management buttons */}
            <div className="mt-6 grid grid-cols-1 gap-4">
              <button onClick={handleAddWalletClick} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition ease-in-out duration-150">
                Add New Test Wallet
              </button>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <button onClick={handleNewWallet} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition ease-in-out duration-150">
                Create New Wallet
              </button>
            </div>
            </main>
            </div>

            <section className="bg-white p-6 rounded-lg shadow-md mt-4">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Account Lookup</h3>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                  <input 
                    className="form-input w-full sm:w-auto flex-grow border-2 border-gray-300 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Enter public address here" 
                    aria-label="Search account by public address"
                    value={address}
                    onChange={handleAddressChange}
                  />
                  <button 
                    className="mt-4 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={fetchAccountDetails}
                  >
                    Search
                  </button>
                </div>
              </div>
              { walletSet ? (
                <div className="bg-gray-100 p-6 rounded-lg shadow-inner mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Account Details</h4>
                <div className="flex flex-wrap -mx-2">
                  <div className="px-2 w-full sm:w-1/2 lg:w-1/4 mb-4">
                    <p className="text-sm font-semibold text-gray-600">Balance</p>
                    <p className="text-lg text-gray-900">{balance}</p>
                  </div>
                  <div className="px-2 w-full sm:w-1/2 sm: text-smlg:w-1/4 mb-4">
                    <p className="text-sm font-semibold text-gray-600">Classic Address</p>
                    <p className="text-lg text-gray-900">{address}</p>
                  </div>
                </div>
              </div>
              ) : (
                <div className="bg-gray-100 p-6 rounded-lg shadow-inner mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Account Details</h4>
                <div className="flex flex-wrap -mx-2">
                  <div className="px-2 w-full sm:w-1/2 lg:w-1/4 mb-4">
                    <p className="text-sm font-semibold text-gray-600">Balance</p>
                    <p className="text-lg text-gray-900">0</p>
                  </div>
                  <div className="px-2 w-full sm:w-1/2 lg:w-1/4 mb-4">
                    <p className="text-sm font-semibold text-gray-600">Classic Address</p>
                    <p className="text-lg text-gray-900">N/A</p>
                  </div>
                </div>
              </div>
              )}

              {/* ... Add more transactions similarly ... */}
            </section>


            {/* Transactions here */}
            <div className="grid grid-cols-2 gap-4 mt-4 sticky mb-4">
                {/* Transactions for Wallet1 */}
                <section className="col-span-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Wallet 1 Transactions</h3>
                  <div className="overflow-y-auto max-h-96">
                    {transactions && transactions.length > 0 ? (
                      transactions.map(renderTransaction)
                    ) : (
                      <p className="text-center text-gray-600">No transactions found.</p>
                    )}
                  </div>
                </section>

                {/* Loans for Wallet1 */}
                <section className="bg-white p-6 rounded shadow-md border-2 border-yellow-600">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Wallet 1 Loans</h3>

                  <div className="mb-6 flex justify-between items-center">
                    <div className="text-lg font-medium text-gray-900">All Loans</div>
                    <div className="flex space-x-2">
                      <button className="bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all">Past Month</button>
                      <button className="bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all">Past Week</button>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">Today</h4>
                      <p className="text-xl font-semibold text-gray-900">$0.00</p>
                    </div>
                    <p className="text-sm text-gray-500">Last activity: 22 August 2023, 08:59 AM</p>
                  </div>

                    {/* ... Add more loans similarly ... */}
                </section>
            </div>

            {/* Footer Section */}
            <footer className="w-full mt-auto bg-white border-t-2 border-gray-200">
              <div className="container mx-auto py-6 px-8">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-gray-900 text-xl font-bold">Dashboard<span className="text-blue-600">X</span></h2>
                  </div>
                  <div className="text-gray-700 text-sm">
                    <p>&copy; 2023 Nick Lopacki. All Rights Reserved.</p>
                  </div>
                </div>
              </div>
            </footer>
      </div>
    </div>
  )
}





