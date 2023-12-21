# views.py
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet
from xrpl.wallet import Wallet
from xrpl.core.addresscodec import classic_address_to_xaddress
from xrpl.account import get_balance
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from xrpl.models.requests import AccountInfo, AccountTx
from .models import XRPTestWallet, XRPRealWallet
from xrpl.core.addresscodec import xaddress_to_classic_address
from xrpl.models.transactions import Payment
from xrpl.transaction import autofill_and_sign, submit_and_wait
from datetime import datetime
from decouple import config 
import json
import requests

XRPL_BASE_OFFSET = 946684800  # Seconds from Unix Epoch to Ripple Epoch

# Creates a test wallet and returns the wallet in json format 
@csrf_exempt  # Exempt this view from CSRF verification, be cautious with this in production
@require_http_methods(["POST"])  # This view should only accept POST requests
def create_test_wallet(request):
    print("Headers:", request.headers)

    # Extract user_id from the request
    user_id = request.headers.get('Clerk-User-Id')  # Assuming the user_id is passed in headers

    # Connect to testnet
    JSON_RPC_URL = config('JSON_RPC_URL_TESTNET')
    client = JsonRpcClient(JSON_RPC_URL)

    # Generate a new test wallet
    wallet = generate_faucet_wallet(client, debug=True)

    # Get the balance of the new wallet store it in balance and display it 
    balance = get_balance(wallet.classic_address, client)
    print('User ID: ', user_id)
    print('balance: ', balance)
    print('seed: ', wallet.seed)
    print('address: ', wallet.address)
    print('public_key: ', wallet.public_key)
    print('private_key: ', wallet.private_key)

    # Create and save the wallet data to the database
    xrp_test_wallet = XRPTestWallet.objects.create(
        user_id=user_id,
        classic_address=wallet.classic_address,
        x_address=wallet.address,  # Assuming this method returns the x_address
        public_key=wallet.public_key,
        secret=wallet.seed,  # WARNING: Storing secrets like this is not recommended for production
        balance=balance,
    )

    # Return the wallet address and balance in JSON format
    # Note: Do not expose the secret in production. It's shown here for educational purposes.
    return JsonResponse({
        'x_address': wallet.address,  # Updated from classic_address to address
        'balance': balance,
        'secret': wallet.seed  # WARNING: This is insecure. Secrets should be kept private and not exposed.
    })

@require_http_methods(["GET"])
def list_test_wallets(request):
    user_id = request.GET.get('userId')
    if not user_id:
        return JsonResponse({'error': 'User ID is required'}, status=400)

    wallets = XRPTestWallet.objects.filter(user_id=user_id).values(
        'classic_address', 'x_address', 'public_key', 'balance', 'secret'
    )

    return JsonResponse(list(wallets), safe=False)


@csrf_exempt
@require_http_methods(["POST"])  # This view should only accept DELETE requests
def delete_test_wallet(request):
    # Parse the JSON body of the request

    try:
        data = json.loads(request.body)
        print("Deleting wallet: ", data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Get the classic_address from the DELETE data
    classic_address = data.get('classic_address')
    if not classic_address:
        return JsonResponse({'error': 'Missing classic_address'}, status=400)

    # Try to delete the wallet from the database
    try:
        wallet = XRPTestWallet.objects.get(classic_address=classic_address)
        wallet.delete()
        return JsonResponse({'success': True, 'message': f'Wallet {classic_address} deleted.'})
    except XRPTestWallet.DoesNotExist:
        return JsonResponse({'error': 'Wallet not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Creates a real wallet and returns the details in json format
@csrf_exempt  # Exempt this view from CSRF verification, be cautious with this in production
@require_http_methods(["POST"])  # This view should only accept POST requests
def create_wallet(request):
    print("Headers:", request.headers)

# Extract user_id from the request
    user_id = request.headers.get('Clerk-User-Id')  # Assuming the user_id is passed in headers

    # Connect to mainnet
    JSON_RPC_URL = config('JSON_RPC_URL_MAINNET')
    client = JsonRpcClient(JSON_RPC_URL)

    # Generate a new wallet
    wallet = Wallet.create()

    print('User ID', user_id)
    print('Classic address', wallet.classic_address)
    print('Public key', wallet.public_key)
    print('Store these securly')
    print('X-address: ', wallet.address)
    print('Seed', wallet.seed)
    print('Private key', wallet.private_key)

    try:
        # Attempt to get the balance of the new wallet
        balance = get_balance(wallet.classic_address, client)
        print(balance)
    except Exception as e:
        # If the account is not found, set balance to 0
        balance = 0
        print(balance)

    # Create and save the wallet data to the database
    xrp_real_wallet = XRPRealWallet.objects.create(
        user_id=user_id,
        classic_address=wallet.classic_address,
        x_address=wallet.address,  # Assuming this method returns the x_address
        public_key=wallet.public_key,
        secret=wallet.private_key,  # WARNING: Storing secrets like this is not recommended for production
        balance=balance,
    )

    # Return the wallet details in JSON format
    return JsonResponse({
        'classic_address': wallet.classic_address,
        'x_address': wallet.address,  # If needed
        'public_key': wallet.public_key,
        'seed': wallet.seed,  # Be cautious with exposing sensitive data
        'balance': balance,
    })


@require_http_methods(["GET"])
def list_real_wallets(request):
    user_id = request.GET.get('userId')
    if not user_id:
        return JsonResponse({'error': 'User ID is required'}, status=400)

    wallets = XRPRealWallet.objects.filter(user_id=user_id).values(
        'classic_address', 'x_address', 'public_key', 'balance'
    )

    return JsonResponse(list(wallets), safe=False)


@csrf_exempt
@require_http_methods(["POST"])
def delete_real_wallet(request):
    try:
        data = json.loads(request.body)
        print("Deleting wallet: ", data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Get the classic_address from the DELETE data
    classic_address = data.get('classic_address')
    if not classic_address:
        return JsonResponse({'error': 'Missing classic_address'}, status=400)

    # Try to delete the wallet from the database
    try:
        wallet = XRPRealWallet.objects.get(classic_address=classic_address)
        wallet.delete()
        return JsonResponse({'success': True, 'message': f'Wallet {classic_address} deleted.'})
    except XRPRealWallet.DoesNotExist:
        return JsonResponse({'error': 'Wallet not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def get_account_info(request):
    data = json.loads(request.body)
    address = data.get('address')

    # Connect to XRPL and fetch wallet info
    # Assuming you are connecting to a testnet or mainnet as needed
    JSON_RPC_URL = config('JSON_RPC_URL_MAINNET')
    client = JsonRpcClient(JSON_RPC_URL)

    try:
        # Fetch balance and other details for the address
        account_info = AccountInfo(account=address, ledger_index="validated")
        response = client.request(account_info)
        account_data = response.result.get('account_data', {})

         # Fetch account transactions
        account_tx_request = AccountTx(
            account=address,
            ledger_index_min=-1,  # -1 means earliest available ledger
            ledger_index_max=-1,   # -1 means latest available ledger
          # Adjust as necessary
            forward=True  # Adjust as necessary
        )
        account_tx_response = client.request(account_tx_request)
        transactions = account_tx_response.result.get('transactions', [])

        # Convert XRPL dates to standard format
        for transaction in transactions:
            xrpl_date = transaction.get('date', 0)  # Default to 0 if date is not present
            standard_date = datetime.fromtimestamp(xrpl_date + XRPL_BASE_OFFSET)
            transaction['date'] = standard_date.isoformat()  # Convert to ISO format
            print(transaction['date'])

        # Extract information
        balance = account_data.get('Balance')
        # Add more fields as needed, e.g., sequence, flags, etc.

        response_data = {
            'classic_address': address,
            'balance': balance,
            'transactions': transactions
            # Include other details as needed
        }
    except Exception as e:
        # Handle exceptions, return an error message
        return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse(response_data)


@csrf_exempt
@require_http_methods(["POST"])
def send_xrp_transaction(request):
    print("Headers:", request.headers)
    data = json.loads(request.body)
    sender_secret = data.get('senderSecret')
    receiver_address = data.get('receiverAddress')
    amount = data.get('amount')

    print("Data received:", data)  # Debugging print

    if not all([sender_secret, receiver_address, amount]):
        print("Missing data")  # Debugging print
        return JsonResponse({'success': False, 'error': 'Missing required data'})

    try:
        client = JsonRpcClient(config('JSON_RPC_URL_TESTNET'))
        sender_wallet = Wallet.from_seed(sender_secret)

        # Check sender's balance before attempting transaction
        sender_balance = get_balance(sender_wallet.classic_address, client)
        print("Sender's current balance:", sender_balance)

        if int(sender_balance) < amount:
            print("Insufficient funds for the transaction")
            return JsonResponse({'success': False, 'error': 'Insufficient funds for the transaction'})

        payment = Payment(
            account=sender_wallet.classic_address,
            destination=receiver_address,
            amount=str(amount),
        )

        response = submit_and_wait(payment, client, sender_wallet)
        print("Transaction response:", response)  # Debugging print

        # Fetch and update the new balances
        sender_new_balance = get_balance(sender_wallet.classic_address, client)
        receiver_new_balance = get_balance(receiver_address, client)
        print("New balances fetched")  # Debugging print

        # Update the balances in the database
        XRPTestWallet.objects.filter(classic_address=sender_wallet.classic_address).update(balance=sender_new_balance)
        XRPTestWallet.objects.filter(classic_address=receiver_address).update(balance=receiver_new_balance)
        print("Database updated")  # Debugging print

        # Prepare response
        formatted_response = {
            'transaction_id': response.result.get('hash', ''),
            'status': response.result.get('engine_result', ''),
            'engine_result_message': response.result.get('engine_result_message', ''),
            'sender_new_balance': sender_new_balance,
            'receiver_new_balance': receiver_new_balance
        }

        return JsonResponse({'success': True, 'response': formatted_response})
    except Exception as e:
        print("Exception:", str(e))  # Debugging print
        return JsonResponse({'success': False, 'error': str(e)})
