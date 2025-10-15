"""
Short URL Generator for Invitations

WHY: Generate ultra-short, memorable URLs for invitations
Format: {code}/{names} (e.g., w3d/Carlos&Maria)

WHAT: Utilities to generate short codes and sanitize couple names
"""

import random
import string
import re
from unidecode import unidecode


def generate_short_code(length=3):
    """
    Generate ultra-short random code (3-4 chars)

    Format: lowercase letters + digits (base36)
    Examples: w3d, xv2, b7z, q9c, e1m

    Args:
        length: Code length (default 3, can be 4 for more combinations)

    Returns:
        Random code (e.g., "w3d")
    """
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choices(chars, k=length))


def check_code_available(code, db_session):
    """
    Check if code is available (not taken)

    Args:
        code: Short code to check
        db_session: SQLAlchemy session

    Returns:
        True if available, False if taken
    """
    from models.invitation import Invitation
    existing = db_session.query(Invitation).filter_by(short_code=code).first()
    return existing is None


def generate_unique_code(db_session, length=3, max_attempts=50):
    """
    Generate unique short code with collision handling

    Strategy:
    1. Try 3-char codes first (46,656 combinations)
    2. If exhausted, try 4-char codes (1,679,616 combinations)

    Args:
        db_session: SQLAlchemy session
        length: Starting length (default 3)
        max_attempts: Max attempts per length

    Returns:
        Unique code guaranteed available

    Raises:
        Exception if cannot generate unique code
    """
    # Try initial length
    for _ in range(max_attempts):
        code = generate_short_code(length)
        if check_code_available(code, db_session):
            return code

    # Fallback: try longer code
    for _ in range(max_attempts):
        code = generate_short_code(length=4)
        if check_code_available(code, db_session):
            return code

    raise Exception("Could not generate unique short code after all attempts")


def sanitize_name(name):
    """
    Sanitize single name for URL

    Rules:
    - Remove accents: María → Maria
    - Remove spaces: José Luis → JoseLuis
    - Remove special chars: O'Connor → OConnor
    - Keep numbers: XV15 → XV15, 11 → 11
    - Capitalize first letter

    Args:
        name: Name to sanitize

    Returns:
        Clean name (e.g., "Carlos", "XV15", "11")

    Examples:
        "María José" → "Mariajose"
        "Carlos André" → "Carlosandre"
        "José Luis" → "Joseluis"
        "O'Connor" → "Oconnor"
        "XV 15" → "Xv15"
        "11" → "11"
    """
    if not name:
        return ""

    # Remove accents: María → Maria
    clean = unidecode(name.strip())

    # Remove spaces and special characters, keep only letters AND numbers
    clean = re.sub(r'[^a-zA-Z0-9]', '', clean)

    # Capitalize first letter (if it's a letter, not number)
    if clean and clean[0].isalpha():
        clean = clean[0].upper() + clean[1:].lower()
    elif clean:
        # If starts with number, just lowercase the rest
        clean = clean.lower()

    return clean


def sanitize_couple_names(groom_name, bride_name):
    """
    Sanitize couple names for URL

    Rules:
    - Remove accents: María → Maria
    - Remove spaces: José Luis → JoseLuis
    - Remove special chars
    - Join with "y": Carlos + María → CarlosyMaria

    WHY: Using "y" instead of "&" avoids URL encoding issues
         "&" is a special character in URLs (query param separator)

    Args:
        groom_name: Groom's name
        bride_name: Bride's name

    Returns:
        Sanitized couple names joined with "y"

    Examples:
        ("Carlos", "María") → "CarlosyMaria"
        ("José Luis", "Ana María") → "JoseluisyAnamaria"
        ("1111", "333") → "1111y333"
        ("Isabella", "") → "Isabella"
        ("", "Sofía") → "Sofia"
    """
    groom_clean = sanitize_name(groom_name)
    bride_clean = sanitize_name(bride_name)

    if groom_clean and bride_clean:
        return f"{groom_clean}y{bride_clean}"  # Using "y" instead of "&"
    elif bride_clean:
        return bride_clean
    elif groom_clean:
        return groom_clean
    else:
        return "Invitacion"


def generate_full_short_url(groom_name, bride_name, db_session):
    """
    Generate complete short URL: {code}/{names}

    Args:
        groom_name: Groom's name
        bride_name: Bride's name
        db_session: SQLAlchemy session

    Returns:
        Tuple: (short_code, custom_names)
        Example: ("w3d", "Carlos&Maria")
    """
    short_code = generate_unique_code(db_session)
    custom_names = sanitize_couple_names(groom_name, bride_name)

    return short_code, custom_names
