"""
Test Upgrade Flow End-to-End

This script tests the complete upgrade flow:
1. Calculate upgrade amount
2. Create upgrade order
3. Verify order details
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:5000/api"
INVITATION_ID = 1  # Basic plan invitation

# You need to get a valid JWT token first
# Login to get token
def login():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "user1@example.com",  # Replace with actual user email
            "password": "password123"       # Replace with actual password
        }
    )

    if response.status_code == 200:
        data = response.json()
        return data.get('access_token')
    else:
        print(f"Login failed: {response.text}")
        return None

def test_calculate_upgrade(token):
    """Test: Calculate upgrade amount"""
    print("\n" + "="*80)
    print("TEST 1: Calculate Upgrade Amount")
    print("="*80)

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/invitations/{INVITATION_ID}/calculate-upgrade",
        headers=headers
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        data = response.json()
        print("\n✓ SUCCESS: Upgrade calculation returned:")
        print(f"  - Current Plan: {data['current_plan']['name']} (S/ {data['current_plan']['price']})")
        print(f"  - New Plan: {data['new_plan']['name']} (S/ {data['new_plan']['price']})")
        print(f"  - Amount to Pay: S/ {data['amount_to_pay']}")
        return True
    else:
        print(f"\n✗ FAILED: {response.json().get('error')}")
        return False

def test_create_upgrade_order(token):
    """Test: Create upgrade order"""
    print("\n" + "="*80)
    print("TEST 2: Create Upgrade Order")
    print("="*80)

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/invitations/{INVITATION_ID}/upgrade-plan",
        headers=headers
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        data = response.json()
        print("\n✓ SUCCESS: Upgrade order created:")
        print(f"  - Order ID: {data['order_id']}")
        print(f"  - Order Number: {data['order_number']}")
        print(f"  - Order Type: {data['order_type']}")
        print(f"  - Amount: S/ {data['amount_to_pay']}")
        print(f"  - Invitation ID: {data['invitation_id']}")
        print(f"  - Previous Plan ID: {data['previous_plan_id']}")
        print(f"  - New Plan ID: {data['new_plan_id']}")
        print(f"\n  Checkout URL: http://localhost:3000/checkout?order_id={data['order_id']}")
        return data['order_id']
    else:
        print(f"\n✗ FAILED: {response.json().get('error')}")
        return None

def test_get_order(token, order_id):
    """Test: Get order details"""
    print("\n" + "="*80)
    print("TEST 3: Get Order Details")
    print("="*80)

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/orders/{order_id}",
        headers=headers
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        data = response.json()
        order = data['order']
        print("\n✓ SUCCESS: Order retrieved:")
        print(f"  - Order Number: {order['order_number']}")
        print(f"  - Status: {order['status']}")
        print(f"  - Subtotal: S/ {order['subtotal']}")
        print(f"  - Discount: S/ {order['discount_amount']}")
        print(f"  - Total: S/ {order['total']}")
        print(f"  - Items: {len(order['items'])}")
        for item in order['items']:
            print(f"    * {item['product_name']}: S/ {item['total_price']}")
        return True
    else:
        print(f"\n✗ FAILED: {response.json().get('error')}")
        return False

def main():
    print("="*80)
    print("UPGRADE FLOW END-TO-END TEST")
    print("="*80)
    print(f"Testing invitation ID: {INVITATION_ID}")
    print(f"Backend URL: {BASE_URL}")

    # Step 1: Login
    print("\n" + "="*80)
    print("STEP 0: Login")
    print("="*80)
    token = login()

    if not token:
        print("\n✗ Cannot proceed without authentication")
        print("Please update the login credentials in the script")
        return

    print(f"✓ Login successful, token obtained")

    # Step 2: Calculate upgrade
    if not test_calculate_upgrade(token):
        return

    # Step 3: Create upgrade order
    order_id = test_create_upgrade_order(token)
    if not order_id:
        return

    # Step 4: Get order details
    if not test_get_order(token, order_id):
        return

    print("\n" + "="*80)
    print("ALL TESTS PASSED!")
    print("="*80)
    print("\nNext steps:")
    print(f"1. Open: http://localhost:3000/checkout?order_id={order_id}")
    print("2. Fill in billing information")
    print("3. Proceed to payment")
    print("4. Verify invitation plan_id is updated to 2 (Premium) after payment")

if __name__ == "__main__":
    main()
