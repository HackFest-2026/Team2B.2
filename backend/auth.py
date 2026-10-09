"""
Authentication, Token Generation and Clearance Validation
"""
import hmac
import hashlib
import base64
import json
import time
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from backend.config import SECRET_KEY, DEFAULT_USERS

def create_access_token(user_data: Dict[str, Any]) -> str:
    """Generate an HMAC-SHA256 signed bearer token."""
    payload = {
        "sub": user_data["username"],
        "role": user_data["role"],
        "clearance": user_data["clearance"],
        "iat": int(time.time()),
        "exp": int(time.time()) + (3600 * 24)
    }
    raw_json = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    b64_payload = base64.urlsafe_b64encode(raw_json).decode('utf-8').rstrip('=')
    
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        b64_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"{b64_payload}.{signature}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify cryptographic signature and decode token payload."""
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        b64_payload, signature = parts
        
        expected_sig = hmac.new(
            SECRET_KEY.encode('utf-8'),
            b64_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            return None
            
        # Add padding if needed
        rem = len(b64_payload) % 4
        padded_b64 = b64_payload + ('=' * (4 - rem) if rem else '')
        raw_json = base64.urlsafe_b64decode(padded_b64.encode('utf-8')).decode('utf-8')
        payload = json.loads(raw_json)
        
        # Check expiry
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None

def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Verify credentials against the secure default account store."""
    user = DEFAULT_USERS.get(username)
    if not user:
        return None
    if user["password"] != password:
        return None
    return user

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency to extract and validate the active user from the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    username = payload.get("sub")
    user = DEFAULT_USERS.get(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists"
        )
    return user
