"""
API endpoints for invitation URL management.

Provides comprehensive CRUD operations for invitation URLs, including:
- URL creation with plan validation
- URL listing and filtering
- Visit tracking and analytics
- QR code generation
- Public redirection endpoint

WHY: Centralized URL management allows users to create multiple short URLs
per invitation with detailed analytics and QR code generation.
"""

from flask import Blueprint, request, jsonify, redirect, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.invitation_url import InvitationURL, VisitLog
from models.invitation import Invitation
from models.user import User
from utils.url_utils import (
    validate_plan_url_limits,
    validate_url_format,
    validate_title_format,
    generate_invitation_base_url,
    get_client_ip,
    sanitize_user_agent,
    is_valid_short_code
)
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import os

invitation_urls_bp = Blueprint('invitation_urls', __name__)


# ===== PROTECTED ENDPOINTS (Require Authentication) =====

@invitation_urls_bp.route('', methods=['GET'])
@jwt_required()
def get_user_urls():
    """
    Get all invitation URLs for the authenticated user.
    
    Query Parameters:
        - invitation_id: Filter by specific invitation
        - is_active: Filter by active status (true/false)
        - include_stats: Include visit statistics (true/false)
        - page: Page number for pagination (default: 1)
        - per_page: Items per page (default: 10, max: 50)
    """
    try:
        user_id = get_jwt_identity()
        
        # Parse query parameters
        invitation_id = request.args.get('invitation_id', type=int)
        is_active = request.args.get('is_active')
        include_stats = request.args.get('include_stats', 'false').lower() == 'true'
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        
        # Build query
        query = InvitationURL.query.filter_by(user_id=user_id)
        
        if invitation_id:
            query = query.filter_by(invitation_id=invitation_id)
        
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            query = query.filter_by(is_active=is_active_bool)
        
        # Order by creation date (newest first)
        query = query.order_by(InvitationURL.created_at.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        urls = pagination.items
        
        return jsonify({
            'success': True,
            'urls': [url.to_dict(include_stats=include_stats) for url in urls],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@invitation_urls_bp.route('', methods=['POST'])
@jwt_required()
def create_url():
    """
    Create a new invitation URL.
    
    Request Body:
        - invitation_id: ID of the invitation (required)
        - title: Descriptive title (required)
        - original_url: Full URL to redirect to (optional, will be generated if not provided)
        - generate_qr: Whether to generate QR code (optional, default: true)
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Request body is required'}), 400
        
        # Validate required fields
        invitation_id = data.get('invitation_id')
        title = data.get('title')
        
        if not invitation_id:
            return jsonify({'success': False, 'error': 'invitation_id is required'}), 400
        
        if not title:
            return jsonify({'success': False, 'error': 'title is required'}), 400
        
        # Validate title format
        title_validation = validate_title_format(title)
        if not title_validation['valid']:
            return jsonify({'success': False, 'error': title_validation['error']}), 400
        
        # Validate plan limits
        plan_validation = validate_plan_url_limits(user_id, invitation_id)
        if not plan_validation['can_create']:
            error_msg = plan_validation.get('error', 'URL limit exceeded for your plan')
            return jsonify({
                'success': False, 
                'error': error_msg,
                'plan_info': plan_validation
            }), 403
        
        # Generate or validate original URL
        original_url = data.get('original_url')
        if not original_url:
            # Generate default URL pointing to the invitation
            frontend_domain = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            original_url = generate_invitation_base_url(invitation_id, frontend_domain)
        else:
            # Validate provided URL
            url_validation = validate_url_format(original_url)
            if not url_validation['valid']:
                return jsonify({'success': False, 'error': url_validation['error']}), 400
        
        # Create the URL
        invitation_url = InvitationURL(
            invitation_id=invitation_id,
            user_id=user_id,
            title=title.strip(),
            original_url=original_url
        )
        
        db.session.add(invitation_url)
        db.session.commit()
        
        # Generate QR code if requested
        generate_qr = data.get('generate_qr', True)
        if generate_qr:
            backend_domain = os.getenv('BACKEND_URL', 'http://localhost:5000')
            invitation_url.generate_qr_code(backend_domain)
        
        return jsonify({
            'success': True,
            'message': 'Invitation URL created successfully',
            'url': invitation_url.to_dict(include_stats=True)
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Failed to create unique URL. Please try again.'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@invitation_urls_bp.route('/<int:url_id>', methods=['GET'])
@jwt_required()
def get_url(url_id):
    """
    Get a specific invitation URL by ID.
    
    Query Parameters:
        - include_stats: Include visit statistics (true/false)
    """
    try:
        user_id = get_jwt_identity()
        include_stats = request.args.get('include_stats', 'false').lower() == 'true'
        
        invitation_url = InvitationURL.query.filter_by(
            id=url_id,
            user_id=user_id
        ).first()
        
        if not invitation_url:
            return jsonify({'success': False, 'error': 'URL not found'}), 404
        
        return jsonify({
            'success': True,
            'url': invitation_url.to_dict(include_stats=include_stats)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@invitation_urls_bp.route('/<int:url_id>', methods=['PUT'])
@jwt_required()
def update_url(url_id):
    """
    Update an invitation URL.
    
    Request Body:
        - title: New title (optional)
        - original_url: New original URL (optional)
        - is_active: Active status (optional)
        - regenerate_qr: Whether to regenerate QR code (optional)
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Request body is required'}), 400
        
        invitation_url = InvitationURL.query.filter_by(
            id=url_id,
            user_id=user_id
        ).first()
        
        if not invitation_url:
            return jsonify({'success': False, 'error': 'URL not found'}), 404
        
        # Update fields if provided
        if 'title' in data:
            title_validation = validate_title_format(data['title'])
            if not title_validation['valid']:
                return jsonify({'success': False, 'error': title_validation['error']}), 400
            invitation_url.title = data['title'].strip()
        
        if 'original_url' in data:
            url_validation = validate_url_format(data['original_url'])
            if not url_validation['valid']:
                return jsonify({'success': False, 'error': url_validation['error']}), 400
            invitation_url.original_url = data['original_url']
        
        if 'is_active' in data:
            invitation_url.is_active = bool(data['is_active'])
        
        db.session.commit()
        
        # Regenerate QR code if requested
        if data.get('regenerate_qr', False):
            backend_domain = os.getenv('BACKEND_URL', 'http://localhost:5000')
            invitation_url.generate_qr_code(backend_domain)
        
        return jsonify({
            'success': True,
            'message': 'URL updated successfully',
            'url': invitation_url.to_dict(include_stats=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@invitation_urls_bp.route('/<int:url_id>', methods=['DELETE'])
@jwt_required()
def delete_url(url_id):
    """
    Delete an invitation URL and all associated visit logs.
    """
    try:
        user_id = get_jwt_identity()
        
        invitation_url = InvitationURL.query.filter_by(
            id=url_id,
            user_id=user_id
        ).first()
        
        if not invitation_url:
            return jsonify({'success': False, 'error': 'URL not found'}), 404
        
        # Delete QR code file if exists
        if invitation_url.qr_code_path and os.path.exists(invitation_url.qr_code_path):
            try:
                os.remove(invitation_url.qr_code_path)
            except Exception as e:
                print(f"Warning: Could not delete QR code file: {str(e)}")
        
        db.session.delete(invitation_url)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'URL deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@invitation_urls_bp.route('/<int:url_id>/stats', methods=['GET'])
@jwt_required()
def get_url_stats(url_id):
    """
    Get detailed statistics for a specific URL.
    
    Query Parameters:
        - days: Number of days to include in statistics (default: 7, max: 365)
    """
    try:
        user_id = get_jwt_identity()
        days = min(request.args.get('days', 7, type=int), 365)
        
        invitation_url = InvitationURL.query.filter_by(
            id=url_id,
            user_id=user_id
        ).first()
        
        if not invitation_url:
            return jsonify({'success': False, 'error': 'URL not found'}), 404
        
        # Get comprehensive stats
        since_date = datetime.utcnow() - timedelta(days=days)
        
        # Basic stats
        total_visits = invitation_url.visits.count()
        period_visits = invitation_url.visits.filter(
            VisitLog.visited_at >= since_date
        ).count()
        
        unique_visitors = invitation_url.visits.with_entities(
            VisitLog.ip_address
        ).distinct().count()
        
        # Daily breakdown
        daily_stats = db.session.query(
            db.func.date(VisitLog.visited_at).label('date'),
            db.func.count(VisitLog.id).label('visits'),
            db.func.count(db.func.distinct(VisitLog.ip_address)).label('unique_visitors')
        ).filter(
            VisitLog.invitation_url_id == url_id,
            VisitLog.visited_at >= since_date
        ).group_by(
            db.func.date(VisitLog.visited_at)
        ).all()
        
        # Device type breakdown
        device_stats = db.session.query(
            VisitLog.device_type,
            db.func.count(VisitLog.id).label('count')
        ).filter(
            VisitLog.invitation_url_id == url_id,
            VisitLog.visited_at >= since_date
        ).group_by(
            VisitLog.device_type
        ).all()
        
        # Browser breakdown
        browser_stats = db.session.query(
            VisitLog.browser,
            db.func.count(VisitLog.id).label('count')
        ).filter(
            VisitLog.invitation_url_id == url_id,
            VisitLog.visited_at >= since_date
        ).group_by(
            VisitLog.browser
        ).limit(10).all()  # Top 10 browsers
        
        return jsonify({
            'success': True,
            'stats': {
                'url_info': invitation_url.to_dict(),
                'period_days': days,
                'summary': {
                    'total_visits': total_visits,
                    'period_visits': period_visits,
                    'unique_visitors': unique_visitors,
                    'last_visited_at': invitation_url.last_visited_at.isoformat() if invitation_url.last_visited_at else None
                },
                'daily_breakdown': [
                    {
                        'date': str(day.date),
                        'visits': day.visits,
                        'unique_visitors': day.unique_visitors
                    } for day in daily_stats
                ],
                'device_breakdown': [
                    {
                        'device_type': device.device_type or 'Unknown',
                        'count': device.count
                    } for device in device_stats
                ],
                'browser_breakdown': [
                    {
                        'browser': browser.browser or 'Unknown',
                        'count': browser.count
                    } for browser in browser_stats
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ===== PUBLIC ENDPOINTS (No Authentication Required) =====

@invitation_urls_bp.route('/r/<string:short_code>', methods=['GET'])
def redirect_short_url(short_code):
    """
    Public endpoint to redirect short URLs to their original destinations.
    Also tracks visit analytics.
    
    WHY: This is the core functionality - when someone clicks a short link,
    they should be seamlessly redirected while we track the visit.
    """
    try:
        # Validate short code format
        if not is_valid_short_code(short_code):
            abort(404)
        
        # Find the URL
        invitation_url = InvitationURL.query.filter_by(
            short_code=short_code,
            is_active=True
        ).first()
        
        if not invitation_url:
            abort(404)
        
        # Track the visit
        try:
            # Create visit log entry
            visit_log = VisitLog.create_visit_log(invitation_url.id, request)
            
            # Update URL visit count
            invitation_url.increment_visit_count()
            
        except Exception as e:
            # Log error but don't fail the redirect
            print(f"Error tracking visit for {short_code}: {str(e)}")
        
        # Perform redirect
        return redirect(invitation_url.original_url, code=302)
        
    except Exception as e:
        print(f"Error in redirect for {short_code}: {str(e)}")
        abort(404)


# ===== ADMIN/DEBUG ENDPOINTS =====

@invitation_urls_bp.route('/debug/visits/<int:url_id>', methods=['GET'])
@jwt_required()
def get_url_visits(url_id):
    """
    Get raw visit logs for a URL (for debugging/admin purposes).
    
    Query Parameters:
        - limit: Number of visits to return (default: 50, max: 500)
    """
    try:
        user_id = get_jwt_identity()
        limit = min(request.args.get('limit', 50, type=int), 500)
        
        # Verify URL ownership
        invitation_url = InvitationURL.query.filter_by(
            id=url_id,
            user_id=user_id
        ).first()
        
        if not invitation_url:
            return jsonify({'success': False, 'error': 'URL not found'}), 404
        
        # Get recent visits
        visits = VisitLog.query.filter_by(
            invitation_url_id=url_id
        ).order_by(
            VisitLog.visited_at.desc()
        ).limit(limit).all()
        
        return jsonify({
            'success': True,
            'visits': [visit.to_dict() for visit in visits],
            'total_shown': len(visits),
            'url_info': invitation_url.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ===== ERROR HANDLERS =====

@invitation_urls_bp.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Resource not found'}), 404


@invitation_urls_bp.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'success': False, 'error': 'Internal server error'}), 500