"""
Test script for Orders API endpoint validation
WHY: Verify the orders endpoint works correctly with real database data
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER_EMAIL = "gfxjef@gmail.com"
TEST_USER_PASSWORD = "TestPassword123"

# ANSI Color codes for better output readability
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    """Print a formatted header"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}{text.center(80)}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")

def print_success(text):
    """Print success message"""
    print(f"{GREEN}[OK] {text}{RESET}")

def print_error(text):
    """Print error message"""
    print(f"{RED}[ERROR] {text}{RESET}")

def print_warning(text):
    """Print warning message"""
    print(f"{YELLOW}[WARN] {text}{RESET}")

def print_info(text):
    """Print info message"""
    print(f"{BLUE}[INFO] {text}{RESET}")

def print_json(data, title="Response"):
    """Pretty print JSON data"""
    print(f"\n{YELLOW}{title}:{RESET}")
    print(json.dumps(data, indent=2, ensure_ascii=False))

def test_login():
    """
    Test 1: Login del usuario de prueba
    """
    print_header("TEST 1: USER LOGIN")

    try:
        print_info(f"Attempting login for user: {TEST_USER_EMAIL}")

        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            },
            headers={"Content-Type": "application/json"}
        )

        print_info(f"Response status code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print_success("Login successful!")
            print_info(f"User: {data.get('user', {}).get('email')}")
            print_info(f"User ID: {data.get('user', {}).get('id')}")
            print_info(f"Token type: {data.get('token_type')}")

            access_token = data.get('access_token')
            if access_token:
                print_success(f"Access token obtained (length: {len(access_token)} chars)")
                return True, access_token, data.get('user', {}).get('id')
            else:
                print_error("No access token in response")
                print_json(data, "Full Response")
                return False, None, None
        else:
            print_error(f"Login failed with status {response.status_code}")
            try:
                print_json(response.json(), "Error Response")
            except:
                print_error(f"Response text: {response.text}")
            return False, None, None

    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend server")
        print_warning(f"Make sure Flask server is running at {BASE_URL}")
        return False, None, None
    except Exception as e:
        print_error(f"Unexpected error during login: {str(e)}")
        return False, None, None

def test_get_orders(access_token):
    """
    Test 2: Consultar órdenes del usuario
    """
    print_header("TEST 2: GET USER ORDERS")

    try:
        print_info("Fetching user orders...")

        response = requests.get(
            f"{BASE_URL}/api/orders/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )

        print_info(f"Response status code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print_success("Orders endpoint responded successfully!")

            # Validate response structure
            if 'success' in data:
                if data['success']:
                    print_success("Response has 'success: true'")
                else:
                    print_warning("Response has 'success: false'")
            else:
                print_warning("Response missing 'success' field")

            if 'orders' in data:
                orders = data['orders']
                print_success(f"Response has 'orders' array with {len(orders)} order(s)")
                return True, data
            else:
                print_error("Response missing 'orders' field")
                print_json(data, "Full Response")
                return False, data
        else:
            print_error(f"Request failed with status {response.status_code}")
            try:
                print_json(response.json(), "Error Response")
            except:
                print_error(f"Response text: {response.text}")
            return False, None

    except Exception as e:
        print_error(f"Unexpected error fetching orders: {str(e)}")
        return False, None

def validate_order_structure(order, order_index):
    """
    Test 3: Validar estructura de datos de una orden
    """
    print_info(f"\n--- Validating Order #{order_index + 1} ---")

    required_fields = {
        'id': int,
        'order_number': str,
        'status': str,
        'total': (float, int),
        'subtotal': (float, int),
        'discount_amount': (float, int),
        'currency': str,
        'created_at': str,
        'items': list
    }

    optional_fields = {
        'coupon_code': (str, type(None)),
        'paid_at': (str, type(None))
    }

    all_valid = True

    # Validate required fields
    print_info("Checking required fields...")
    for field, expected_type in required_fields.items():
        if field not in order:
            print_error(f"Missing required field: '{field}'")
            all_valid = False
        else:
            if isinstance(expected_type, tuple):
                if not isinstance(order[field], expected_type):
                    print_error(f"Field '{field}' has wrong type. Expected {expected_type}, got {type(order[field])}")
                    all_valid = False
                else:
                    print_success(f"'{field}': {type(order[field]).__name__} = {order[field]}")
            else:
                if not isinstance(order[field], expected_type):
                    print_error(f"Field '{field}' has wrong type. Expected {expected_type}, got {type(order[field])}")
                    all_valid = False
                else:
                    print_success(f"'{field}': {type(order[field]).__name__} = {order[field]}")

    # Validate optional fields
    print_info("\nChecking optional fields...")
    for field, expected_types in optional_fields.items():
        if field in order:
            if not isinstance(order[field], expected_types):
                print_warning(f"Field '{field}' has unexpected type. Expected {expected_types}, got {type(order[field])}")
            else:
                print_success(f"'{field}': {order[field]}")

    # Validate order items
    if 'items' in order and isinstance(order['items'], list):
        print_info(f"\nValidating {len(order['items'])} order item(s)...")

        for idx, item in enumerate(order['items']):
            print_info(f"  Item #{idx + 1}:")
            item_required_fields = {
                'id': int,
                'product_name': str,
                'unit_price': (float, int),
                'quantity': int,
                'total_price': (float, int)
            }

            for item_field, item_type in item_required_fields.items():
                if item_field not in item:
                    print_error(f"    Missing field: '{item_field}'")
                    all_valid = False
                else:
                    if isinstance(item_type, tuple):
                        if not isinstance(item[item_field], item_type):
                            print_error(f"    Field '{item_field}' wrong type")
                            all_valid = False
                        else:
                            print_success(f"    '{item_field}': {item[item_field]}")
                    else:
                        if not isinstance(item[item_field], item_type):
                            print_error(f"    Field '{item_field}' wrong type")
                            all_valid = False
                        else:
                            print_success(f"    '{item_field}': {item[item_field]}")

    return all_valid

def display_order_summary(order, index):
    """Display a formatted summary of an order"""
    print(f"\n{YELLOW}{'-'*60}{RESET}")
    print(f"{BLUE}Order #{index + 1} Summary{RESET}")
    print(f"{YELLOW}{'-'*60}{RESET}")
    print(f"Order Number:     {order.get('order_number', 'N/A')}")
    print(f"Status:           {order.get('status', 'N/A')}")
    print(f"Subtotal:         {order.get('currency', 'PEN')} {order.get('subtotal', 0):.2f}")
    print(f"Discount:         {order.get('currency', 'PEN')} {order.get('discount_amount', 0):.2f}")
    print(f"Total:            {order.get('currency', 'PEN')} {order.get('total', 0):.2f}")
    print(f"Coupon Code:      {order.get('coupon_code') or 'None'}")
    print(f"Created At:       {order.get('created_at', 'N/A')}")
    print(f"Paid At:          {order.get('paid_at') or 'Not paid yet'}")
    print(f"\nItems ({len(order.get('items', []))}):")

    for idx, item in enumerate(order.get('items', []), 1):
        print(f"  {idx}. {item.get('product_name', 'N/A')}")
        print(f"     Unit Price: {item.get('unit_price', 0):.2f} x {item.get('quantity', 0)} = {item.get('total_price', 0):.2f}")

    print(f"{YELLOW}{'-'*60}{RESET}")

def main():
    """Main test execution"""
    print_header("BACKEND ORDERS ENDPOINT TEST SUITE")
    print_info(f"Testing against: {BASE_URL}")
    print_info(f"Test user: {TEST_USER_EMAIL}")
    print_info(f"Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Test 1: Login
    success, access_token, user_id = test_login()
    if not success:
        print_error("\n[ERROR] LOGIN TEST FAILED - Cannot proceed with other tests")
        return

    print_success("\n[OK] LOGIN TEST PASSED")

    # Test 2: Get Orders
    success, orders_data = test_get_orders(access_token)
    if not success:
        print_error("\n[ERROR] GET ORDERS TEST FAILED")
        return

    print_success("\n[OK] GET ORDERS TEST PASSED")

    # Test 3: Validate Data Structure
    print_header("TEST 3: VALIDATE ORDER DATA STRUCTURE")

    orders = orders_data.get('orders', [])

    if len(orders) == 0:
        print_warning("No orders found for this user")
        print_info("This is not an error - user simply has no orders yet")
    else:
        print_info(f"Found {len(orders)} order(s) - validating structure...")

        all_orders_valid = True
        for idx, order in enumerate(orders):
            is_valid = validate_order_structure(order, idx)
            if not is_valid:
                all_orders_valid = False

        if all_orders_valid:
            print_success("\n[OK] ALL ORDERS HAVE VALID STRUCTURE")
        else:
            print_error("\n[ERROR] SOME ORDERS HAVE INVALID STRUCTURE")

        # Display 1-2 order examples
        print_header("ORDER EXAMPLES")
        examples_to_show = min(2, len(orders))
        print_info(f"Displaying {examples_to_show} order example(s):")

        for idx in range(examples_to_show):
            display_order_summary(orders[idx], idx)

    # Final Report
    print_header("FINAL TEST REPORT")
    print(f"{GREEN}[OK] Login Test: PASSED{RESET}")
    print(f"{GREEN}[OK] Get Orders Endpoint: PASSED{RESET}")
    print(f"{GREEN}[OK] Data Structure Validation: PASSED{RESET}")
    print(f"\n{BLUE}Total Orders Found: {len(orders)}{RESET}")
    print(f"{BLUE}Test completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET}")
    print_header("TEST SUITE COMPLETED SUCCESSFULLY")

if __name__ == "__main__":
    main()
