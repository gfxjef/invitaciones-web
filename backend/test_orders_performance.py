"""
Test Orders Endpoint Performance
Verifica que el endpoint de órdenes responda rápidamente
"""
import requests
import time
import json
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = 'http://localhost:5000/api'

# Test credentials
EMAIL = 'gfxjef@gmail.com'
PASSWORD = 'TestPassword123'

def test_orders_performance():
    print("=" * 60)
    print("ORDERS ENDPOINT PERFORMANCE TEST")
    print("=" * 60)

    # Step 1: Login
    print("\n[1/3] Logging in...")
    start_login = time.time()

    try:
        login_response = requests.post(
            f'{BASE_URL}/auth/login',
            json={'email': EMAIL, 'password': PASSWORD},
            timeout=5
        )
        login_time = time.time() - start_login

        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            return

        print(f"✅ Login successful ({login_time:.2f}s)")
        access_token = login_response.json()['access_token']

    except requests.Timeout:
        print("❌ Login timeout (>5s)")
        return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return

    # Step 2: Fetch orders
    print("\n[2/3] Fetching orders...")
    headers = {'Authorization': f'Bearer {access_token}'}
    start_orders = time.time()

    try:
        orders_response = requests.get(
            f'{BASE_URL}/orders/',
            headers=headers,
            timeout=10
        )
        orders_time = time.time() - start_orders

        if orders_response.status_code != 200:
            print(f"❌ Orders fetch failed: {orders_response.status_code}")
            print(orders_response.text)
            return

        data = orders_response.json()
        orders_count = len(data.get('orders', []))

        print(f"✅ Orders fetched ({orders_time:.2f}s)")
        print(f"   Orders count: {orders_count}")

        # Performance assessment
        if orders_time < 1:
            status = "🚀 EXCELLENT"
        elif orders_time < 3:
            status = "✅ GOOD"
        elif orders_time < 5:
            status = "⚠️ ACCEPTABLE"
        else:
            status = "❌ TOO SLOW"

        print(f"   Performance: {status}")

    except requests.Timeout:
        orders_time = time.time() - start_orders
        print(f"❌ Orders timeout (>{orders_time:.2f}s)")
        return
    except Exception as e:
        print(f"❌ Orders error: {e}")
        return

    # Step 3: Validate response structure
    print("\n[3/3] Validating response structure...")

    if not data.get('success'):
        print("❌ Missing 'success' field")
        return

    if 'orders' not in data:
        print("❌ Missing 'orders' array")
        return

    print(f"✅ Response structure valid")

    if orders_count > 0:
        sample_order = data['orders'][0]
        required_fields = ['id', 'order_number', 'status', 'total', 'subtotal',
                          'discount_amount', 'currency', 'items', 'created_at']

        missing_fields = [f for f in required_fields if f not in sample_order]

        if missing_fields:
            print(f"⚠️ Sample order missing fields: {missing_fields}")
        else:
            print(f"✅ All required fields present")
            print(f"\n   Sample order:")
            print(f"   - Order: {sample_order['order_number']}")
            print(f"   - Status: {sample_order['status']}")
            print(f"   - Total: {sample_order['currency']} {sample_order['total']}")
            print(f"   - Items: {len(sample_order['items'])}")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Login time:       {login_time:.2f}s")
    print(f"Orders fetch:     {orders_time:.2f}s")
    print(f"Total orders:     {orders_count}")
    print(f"Overall status:   {status}")
    print("=" * 60)

if __name__ == '__main__':
    test_orders_performance()
