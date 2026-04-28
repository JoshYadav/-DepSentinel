"""
DepSentinel Blockchain Integration
Stores and verifies package scan hashes on the Ethereum Sepolia testnet.
"""

import os
from dotenv import load_dotenv
from web3 import Web3

# Load environment variables from .env file
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(env_path)


def get_web3():
    """
    Connect to the Ethereum Sepolia testnet via Alchemy RPC.
    Returns a Web3 instance.
    Raises RuntimeError if connection fails.
    """
    rpc_url = os.getenv('ALCHEMY_RPC_URL')
    if not rpc_url:
        raise RuntimeError(
            "ALCHEMY_RPC_URL not found in .env — "
            "please add your Alchemy Sepolia RPC URL to backend/.env"
        )

    w3 = Web3(Web3.HTTPProvider(rpc_url))

    if not w3.is_connected():
        raise RuntimeError(
            f"Failed to connect to Sepolia via {rpc_url}. "
            "Check your Alchemy API key and network connectivity."
        )

    return w3


def store_hash_onchain(package_name, version, code_hash):
    """
    Record a package scan hash on the Sepolia blockchain.

    Sends a zero-value self-transaction with the scan data encoded in
    the transaction's input data field:
        DEPSENTINEL:{package_name}:{version}:{code_hash}

    Returns a dict with tx_hash, etherscan_url, block_number, status
    or None on any failure.
    """
    try:
        private_key = os.getenv('WALLET_PRIVATE_KEY')
        wallet_address = os.getenv('WALLET_ADDRESS')

        if not private_key or not wallet_address:
            print("[blockchain] WALLET_PRIVATE_KEY or WALLET_ADDRESS missing from .env")
            return None

        w3 = get_web3()

        # Encode scan data as hex in the transaction input
        payload = f"DEPSENTINEL:{package_name}:{version}:{code_hash}"

        base_nonce = w3.eth.get_transaction_count(wallet_address, 'pending')

        tx = {
            'from': wallet_address,
            'to': wallet_address,
            'value': 0,
            'gas': 50000,
            'gasPrice': w3.eth.gas_price,
            'data': w3.to_hex(text=payload),
            'chainId': 11155111  # Sepolia
        }

        try:
            tx['nonce'] = base_nonce
            signed_tx = w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        except Exception as e:
            if 'nonce' in str(e).lower() or 'replacement' in str(e).lower() or 'underpriced' in str(e).lower():
                tx['nonce'] = base_nonce + 1
                tx['gasPrice'] = int(w3.eth.gas_price * 1.1)
                signed_tx = w3.eth.account.sign_transaction(tx, private_key)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            else:
                raise e

        print(f"[blockchain] Tx sent: {tx_hash.hex()}")
        print(f"[blockchain] Waiting for confirmation (timeout=30s)...")

        try:
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        except Exception:
            return {
                'tx_hash': tx_hash.hex(),
                'etherscan_url': f"https://sepolia.etherscan.io/tx/{tx_hash.hex()}",
                'block_number': None,
                'status': 'pending'
            }

        result = {
            'tx_hash': receipt.transactionHash.hex(),
            'etherscan_url': f"https://sepolia.etherscan.io/tx/{receipt.transactionHash.hex()}",
            'block_number': receipt.blockNumber,
            'status': 'verified'
        }

        print(f"[blockchain] Confirmed in block #{receipt.blockNumber}")
        return result

    except Exception as e:
        import traceback
        print(f"[blockchain] Error storing hash on-chain: {e}")
        traceback.print_exc()
        return None


def verify_hash_onchain(tx_hash, expected_hash):
    """
    Verify that a transaction on Sepolia contains the expected hash.

    Fetches the transaction by hash, decodes the input data, and checks
    whether the expected_hash string is present in the decoded payload.

    Returns True if found, False otherwise.
    """
    try:
        w3 = get_web3()
        tx = w3.eth.get_transaction(tx_hash)

        # Decode the hex input data back to a UTF-8 string
        decoded_input = bytes.fromhex(tx.input.hex()[2:]).decode('utf-8')

        return expected_hash in decoded_input

    except Exception as e:
        print(f"[blockchain] Error verifying hash on-chain: {e}")
        return False


def test_connection():
    """Test connectivity to the Sepolia testnet."""
    try:
        w3 = get_web3()
        return w3.is_connected()
    except Exception as e:
        print(f"[blockchain] Connection test failed: {e}")
        return False


if __name__ == "__main__":
    print("Connection test:", test_connection())
