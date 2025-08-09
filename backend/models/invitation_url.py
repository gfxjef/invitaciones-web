from extensions import db
from datetime import datetime
import secrets
import string
import os


class InvitationURL(db.Model):
    """
    Model for managing unique URLs for invitations.
    Each URL represents a shortened link that redirects to the full invitation.
    
    WHY: This allows users to create multiple short URLs for different guest groups,
    with individual tracking and QR code generation capabilities.
    """
    __tablename__ = 'invitation_urls'
    
    id = db.Column(db.Integer, primary_key=True)
    invitation_id = db.Column(db.Integer, db.ForeignKey('invitations.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # URL Configuration
    short_code = db.Column(db.String(8), unique=True, nullable=False, index=True)
    original_url = db.Column(db.String(500), nullable=False)  # Full invitation URL
    title = db.Column(db.String(100), nullable=False)  # Descriptive title like "Novios", "Padrinos"
    
    # Status and Tracking
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    visit_count = db.Column(db.Integer, default=0, nullable=False)
    last_visited_at = db.Column(db.DateTime)
    
    # QR Code
    qr_code_path = db.Column(db.String(200))  # Path to generated QR code file
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    visits = db.relationship('VisitLog', backref='invitation_url', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.short_code:
            self.short_code = self.generate_unique_short_code()
    
    @staticmethod
    def generate_unique_short_code(length=8):
        """
        Generate a unique 8-character alphanumeric code.
        
        WHY: We avoid confusing characters (0, O, I, 1) to prevent user errors
        when manually typing the URLs.
        """
        # Characters excluding confusing ones: 0, O, I, 1
        safe_chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        
        max_attempts = 100
        for _ in range(max_attempts):
            code = ''.join(secrets.choice(safe_chars) for _ in range(length))
            
            # Check if code already exists
            if not InvitationURL.query.filter_by(short_code=code).first():
                return code
        
        # Fallback: use timestamp-based code if random generation fails
        timestamp = str(int(datetime.utcnow().timestamp()))[-6:]
        return f"INV{timestamp}"
    
    def generate_qr_code(self, base_url="http://localhost:5000"):
        """
        Generate QR code for this short URL and save to file.
        
        Args:
            base_url: Base URL for the application
            
        Returns:
            str: Path to generated QR code file
        """
        try:
            import qrcode
            
            # Create QR code
            short_url = f"{base_url}/r/{self.short_code}"
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(short_url)
            qr.make(fit=True)
            
            # Create image
            qr_img = qr.make_image(fill_color="black", back_color="white")
            
            # Ensure QR codes directory exists
            qr_dir = os.path.join("static", "qr_codes")
            os.makedirs(qr_dir, exist_ok=True)
            
            # Generate filename
            filename = f"qr_{self.short_code}_{int(datetime.utcnow().timestamp())}.png"
            filepath = os.path.join(qr_dir, filename)
            
            # Save image
            qr_img.save(filepath)
            
            # Update model with path
            self.qr_code_path = filepath
            db.session.commit()
            
            return filepath
            
        except Exception as e:
            print(f"Error generating QR code: {str(e)}")
            return None
    
    def increment_visit_count(self):
        """
        Increment visit count and update last visited timestamp.
        
        WHY: Atomic operation to prevent race conditions when multiple
        users access the same URL simultaneously.
        """
        self.visit_count += 1
        self.last_visited_at = datetime.utcnow()
        db.session.commit()
    
    def get_visit_stats(self):
        """
        Get comprehensive visit statistics for this URL.
        
        Returns:
            dict: Statistics including total visits, unique visitors, etc.
        """
        total_visits = self.visits.count()
        unique_visitors = self.visits.with_entities(VisitLog.ip_address).distinct().count()
        
        # Recent visits (last 7 days)
        from datetime import timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_visits = self.visits.filter(VisitLog.visited_at >= week_ago).count()
        
        # Group by day for chart data
        daily_visits = db.session.query(
            db.func.date(VisitLog.visited_at).label('date'),
            db.func.count(VisitLog.id).label('count')
        ).filter(
            VisitLog.invitation_url_id == self.id,
            VisitLog.visited_at >= week_ago
        ).group_by(
            db.func.date(VisitLog.visited_at)
        ).all()
        
        return {
            'total_visits': total_visits,
            'unique_visitors': unique_visitors,
            'recent_visits': recent_visits,
            'last_visited_at': self.last_visited_at.isoformat() if self.last_visited_at else None,
            'daily_visits': [{'date': str(day.date), 'count': day.count} for day in daily_visits]
        }
    
    def to_dict(self, include_stats=False):
        """
        Convert model to dictionary representation.
        
        Args:
            include_stats: Whether to include visit statistics
        """
        data = {
            'id': self.id,
            'invitation_id': self.invitation_id,
            'short_code': self.short_code,
            'original_url': self.original_url,
            'title': self.title,
            'is_active': self.is_active,
            'visit_count': self.visit_count,
            'last_visited_at': self.last_visited_at.isoformat() if self.last_visited_at else None,
            'qr_code_path': self.qr_code_path,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_stats:
            data['stats'] = self.get_visit_stats()
            
        return data


class VisitLog(db.Model):
    """
    Model for logging individual visits to invitation URLs.
    
    WHY: Detailed visit tracking allows analytics and helps users understand
    how their invitations are being accessed by guests.
    """
    __tablename__ = 'visit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    invitation_url_id = db.Column(db.Integer, db.ForeignKey('invitation_urls.id'), nullable=False)
    
    # Visit Information
    ip_address = db.Column(db.String(45))  # IPv6 support
    user_agent = db.Column(db.String(500))
    referrer = db.Column(db.String(500))
    
    # Geographic and Device Info (can be populated via IP lookup)
    country = db.Column(db.String(100))
    city = db.Column(db.String(100))
    device_type = db.Column(db.String(50))  # 'mobile', 'desktop', 'tablet'
    browser = db.Column(db.String(100))
    
    # Timestamp
    visited_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invitation_url_id': self.invitation_url_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'referrer': self.referrer,
            'country': self.country,
            'city': self.city,
            'device_type': self.device_type,
            'browser': self.browser,
            'visited_at': self.visited_at.isoformat()
        }
    
    @staticmethod
    def create_visit_log(invitation_url_id, request_data):
        """
        Create a new visit log entry from Flask request data.
        
        Args:
            invitation_url_id: ID of the InvitationURL being visited
            request_data: Flask request object with visitor information
        """
        from user_agents import parse
        
        try:
            # Parse user agent for device/browser info
            user_agent = parse(request_data.headers.get('User-Agent', ''))
            
            # Determine device type
            if user_agent.is_mobile:
                device_type = 'mobile'
            elif user_agent.is_tablet:
                device_type = 'tablet'
            else:
                device_type = 'desktop'
            
            visit_log = VisitLog(
                invitation_url_id=invitation_url_id,
                ip_address=request_data.remote_addr,
                user_agent=request_data.headers.get('User-Agent'),
                referrer=request_data.headers.get('Referer'),
                device_type=device_type,
                browser=f"{user_agent.browser.family} {user_agent.browser.version_string}"
            )
            
            db.session.add(visit_log)
            db.session.commit()
            
            return visit_log
            
        except Exception as e:
            print(f"Error creating visit log: {str(e)}")
            db.session.rollback()
            return None