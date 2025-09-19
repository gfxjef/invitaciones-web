"""
Invitation Response Model

This module defines the InvitationResponse model for managing guest RSVP responses
to wedding invitations including attendance confirmation, guest counts, and preferences.

WHY: Modern wedding planning requires detailed RSVP management beyond simple yes/no
responses. This model enables comprehensive guest response tracking with dietary
restrictions, special requests, and event-specific attendance.
"""

from extensions import db
from datetime import datetime
from typing import Dict, Any, List, Optional
import json


class ResponseStatus:
    """
    Enumeration of possible RSVP response statuses.
    
    WHY: Standardizes response tracking and enables proper workflow
    management for wedding planning.
    """
    PENDING = 'pending'           # No response yet
    ATTENDING = 'attending'       # Confirmed attendance
    NOT_ATTENDING = 'not_attending'  # Declined attendance
    MAYBE = 'maybe'              # Tentative response
    PARTIAL = 'partial'          # Attending some but not all events
    
    @classmethod
    def get_all(cls) -> List[str]:
        """Get all available response statuses."""
        return [cls.PENDING, cls.ATTENDING, cls.NOT_ATTENDING, cls.MAYBE, cls.PARTIAL]


class InvitationResponse(db.Model):
    """
    Manages guest responses to wedding invitation RSVP requests.
    
    This model stores comprehensive RSVP information including attendance status,
    guest count, dietary restrictions, special requests, and event-specific
    responses for multi-event celebrations.
    
    WHY: Wedding planning requires detailed guest response tracking for catering,
    seating arrangements, and logistics planning. This model enables comprehensive
    RSVP management with support for complex scenarios like partial attendance
    and detailed guest preferences.
    
    Examples:
        - Full attendance: Guest attending all events with dietary restrictions
        - Partial attendance: Guest attending ceremony but not reception
        - Group response: Family response with multiple guest counts
        - Special requests: Accessibility needs, seating preferences
    """
    __tablename__ = 'invitation_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    invitation_id = db.Column(
        db.Integer,
        db.ForeignKey('invitations.id', ondelete='CASCADE'),
        nullable=False,
        index=True  # WHY: Primary query pattern is by invitation_id
    )
    
    # Guest identification (can be linked to Guest model or standalone)
    guest_id = db.Column(
        db.Integer,
        db.ForeignKey('guests.id', ondelete='SET NULL'),
        nullable=True,
        index=True,
        comment="Optional link to Guest record for personalized invitations"
    )
    
    # Response identification and contact
    guest_name = db.Column(
        db.String(200),
        nullable=False,
        comment="Name of person responding (may differ from Guest if family response)"
    )
    
    guest_email = db.Column(
        db.String(120),
        nullable=True,
        comment="Email for response confirmation and updates"
    )
    
    guest_phone = db.Column(
        db.String(20),
        nullable=True,
        comment="Phone number for urgent communication"
    )
    
    # Primary RSVP response
    response_status = db.Column(
        db.Enum(*ResponseStatus.get_all(), name='response_status_enum'),
        nullable=False,
        default=ResponseStatus.PENDING,
        index=True,
        comment="Overall attendance status for the invitation"
    )
    
    # Guest count information
    total_guests = db.Column(
        db.Integer,
        nullable=False,
        default=1,
        comment="Total number of guests attending (including respondent)"
    )
    
    adults_count = db.Column(
        db.Integer,
        nullable=False,
        default=1,
        comment="Number of adult guests for catering and seating"
    )
    
    children_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        comment="Number of children for special arrangements and meals"
    )
    
    # Guest preferences and requirements
    dietary_restrictions = db.Column(
        db.Text,
        nullable=True,
        comment="Dietary restrictions, allergies, or food preferences"
    )
    
    special_requests = db.Column(
        db.Text,
        nullable=True,
        comment="Special requests: seating, accessibility, transportation, etc."
    )
    
    additional_notes = db.Column(
        db.Text,
        nullable=True,
        comment="Additional comments or messages from guest"
    )
    
    # Event-specific responses for multi-event invitations
    event_responses = db.Column(
        db.JSON,
        nullable=True,
        comment="Event-specific attendance: {event_id: {attending: bool, guests: int}}"
    )
    
    # Response metadata and tracking
    response_method = db.Column(
        db.String(50),
        nullable=True,
        comment="How response was received: web_form, phone, email, whatsapp, etc."
    )
    
    response_language = db.Column(
        db.String(10),
        nullable=True,
        default='es',
        comment="Language used for response: es, en, etc."
    )
    
    # Contact preferences
    preferred_contact_method = db.Column(
        db.String(50),
        nullable=True,
        comment="Guest's preferred contact method for updates"
    )
    
    allow_contact = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
        comment="Whether guest allows contact for wedding updates"
    )
    
    # Response validation and confirmation
    is_confirmed = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        comment="Whether response has been confirmed (for verification workflows)"
    )
    
    confirmation_token = db.Column(
        db.String(100),
        nullable=True,
        unique=True,
        comment="Token for email confirmation of RSVP response"
    )
    
    confirmed_at = db.Column(
        db.DateTime,
        nullable=True,
        comment="When response was confirmed by guest"
    )
    
    # Admin notes and tracking
    admin_notes = db.Column(
        db.Text,
        nullable=True,
        comment="Internal notes for wedding coordinators"
    )
    
    # Audit timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    # Response tracking for analytics
    response_ip = db.Column(
        db.String(45),
        nullable=True,
        comment="IP address of response for analytics and security"
    )
    
    user_agent = db.Column(
        db.String(500),
        nullable=True,
        comment="User agent string for analytics"
    )
    
    # Relationships
    invitation = db.relationship(
        'Invitation',
        backref=db.backref(
            'responses',
            lazy='dynamic',
            cascade='all, delete-orphan',
            order_by='InvitationResponse.created_at.desc()'
        )
    )
    
    guest = db.relationship(
        'Guest',
        backref=db.backref(
            'responses',
            lazy='dynamic',
            cascade='all, delete-orphan'
        )
    )
    
    # Composite indexes for performance
    __table_args__ = (
        db.Index('idx_invitation_status', 'invitation_id', 'response_status'),
        db.Index('idx_invitation_confirmed', 'invitation_id', 'is_confirmed'),
        db.Index('idx_response_date', 'invitation_id', 'created_at'),
        db.Index('idx_guest_response', 'guest_id', 'response_status'),
    )
    
    def __init__(self, **kwargs):
        """
        Initialize InvitationResponse with validation and defaults.
        
        WHY: Ensures proper initialization with validation of guest counts
        and automatic calculation of totals.
        """
        super().__init__(**kwargs)
        
        # Auto-calculate total guests if not provided
        if not self.total_guests and (self.adults_count or self.children_count):
            self.total_guests = (self.adults_count or 0) + (self.children_count or 0)
    
    def set_guest_counts(self, adults: int, children: int = 0) -> None:
        """
        Set guest counts with automatic total calculation.
        
        Args:
            adults: Number of adult guests
            children: Number of child guests
            
        WHY: Ensures consistency between individual counts and total,
        preventing data inconsistencies in guest planning.
        """
        if adults < 0 or children < 0:
            raise ValueError("Guest counts cannot be negative")
        
        self.adults_count = adults
        self.children_count = children
        self.total_guests = adults + children
        self.updated_at = datetime.utcnow()
    
    def set_event_response(self, event_id: int, attending: bool, guest_count: Optional[int] = None) -> None:
        """
        Set attendance response for a specific event.
        
        Args:
            event_id: ID of the event
            attending: Whether attending this event
            guest_count: Number of guests for this event (defaults to total_guests)
            
        WHY: Enables partial attendance tracking for multi-event invitations
        like ceremony-only or reception-only attendance.
        """
        if self.event_responses is None:
            self.event_responses = {}
        
        self.event_responses[str(event_id)] = {
            'attending': attending,
            'guest_count': guest_count or self.total_guests,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Update overall status based on event responses
        self._update_overall_status()
        self.updated_at = datetime.utcnow()
        # WHY: Explicitly mark as modified for SQLAlchemy to detect JSON changes
        db.session.merge(self)
    
    def _update_overall_status(self) -> None:
        """
        Update overall response status based on event-specific responses.
        
        WHY: Maintains consistency between event-specific and overall
        attendance status for proper invitation analytics.
        """
        if not self.event_responses:
            return
        
        attending_events = [
            event for event in self.event_responses.values()
            if event.get('attending', False)
        ]
        
        total_events = len(self.event_responses)
        attending_count = len(attending_events)
        
        if attending_count == 0:
            self.response_status = ResponseStatus.NOT_ATTENDING
        elif attending_count == total_events:
            self.response_status = ResponseStatus.ATTENDING
        else:
            self.response_status = ResponseStatus.PARTIAL
    
    def get_event_response(self, event_id: int) -> Optional[Dict[str, Any]]:
        """
        Get response for a specific event.
        
        Args:
            event_id: ID of the event
            
        Returns:
            Event response data or None if not set
            
        WHY: Provides convenient access to event-specific responses
        for template rendering and event planning.
        """
        if self.event_responses:
            return self.event_responses.get(str(event_id))
        return None
    
    def is_attending_event(self, event_id: int) -> bool:
        """
        Check if guest is attending a specific event.
        
        Args:
            event_id: ID of the event
            
        Returns:
            True if attending this event
            
        WHY: Simplifies event attendance checks for catering and
        logistics calculations.
        """
        event_response = self.get_event_response(event_id)
        return event_response.get('attending', False) if event_response else False
    
    def get_event_guest_count(self, event_id: int) -> int:
        """
        Get guest count for a specific event.
        
        Args:
            event_id: ID of the event
            
        Returns:
            Number of guests attending this event
            
        WHY: Enables per-event guest counting for accurate catering
        and seating arrangements.
        """
        event_response = self.get_event_response(event_id)
        if event_response and event_response.get('attending', False):
            return event_response.get('guest_count', self.total_guests)
        return 0
    
    def confirm_response(self, confirmation_token: str = None) -> bool:
        """
        Confirm the RSVP response.
        
        Args:
            confirmation_token: Optional token for email confirmation
            
        Returns:
            True if confirmation successful
            
        WHY: Enables email verification workflow to prevent spam
        responses and ensure valid contact information.
        """
        if confirmation_token and self.confirmation_token != confirmation_token:
            return False
        
        self.is_confirmed = True
        self.confirmed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return True
    
    def has_dietary_restrictions(self) -> bool:
        """Check if guest has dietary restrictions."""
        return bool(self.dietary_restrictions and self.dietary_restrictions.strip())
    
    def has_special_requests(self) -> bool:
        """Check if guest has special requests."""
        return bool(self.special_requests and self.special_requests.strip())
    
    def is_attending(self) -> bool:
        """Check if guest is attending (any level of attendance)."""
        return self.response_status in [ResponseStatus.ATTENDING, ResponseStatus.PARTIAL]
    
    def get_response_summary(self) -> Dict[str, Any]:
        """
        Get a summary of the response for reporting.
        
        Returns:
            Dictionary with response summary statistics
            
        WHY: Provides aggregate data for wedding planning dashboards
        and guest management reports.
        """
        return {
            'status': self.response_status,
            'total_guests': self.total_guests,
            'adults': self.adults_count,
            'children': self.children_count,
            'has_dietary_restrictions': self.has_dietary_restrictions(),
            'has_special_requests': self.has_special_requests(),
            'is_confirmed': self.is_confirmed,
            'response_date': self.created_at.isoformat() if self.created_at else None,
            'event_attendance': {
                event_id: self.is_attending_event(int(event_id))
                for event_id in (self.event_responses or {}).keys()
            }
        }
    
    @classmethod
    def get_invitation_stats(cls, invitation_id: int) -> Dict[str, Any]:
        """
        Get response statistics for an invitation.
        
        Args:
            invitation_id: ID of the invitation
            
        Returns:
            Dictionary with invitation response statistics
            
        WHY: Provides quick overview of RSVP status for wedding
        planning and guest management dashboards.
        """
        responses = cls.query.filter_by(invitation_id=invitation_id).all()
        
        stats = {
            'total_responses': len(responses),
            'attending': 0,
            'not_attending': 0,
            'pending': 0,
            'maybe': 0,
            'partial': 0,
            'total_guests': 0,
            'total_adults': 0,
            'total_children': 0,
            'confirmed_responses': 0,
            'dietary_restrictions_count': 0,
            'special_requests_count': 0
        }
        
        for response in responses:
            # Count by status
            stats[response.response_status] += 1
            
            # Sum guest counts for attending responses
            if response.is_attending():
                stats['total_guests'] += response.total_guests
                stats['total_adults'] += response.adults_count
                stats['total_children'] += response.children_count
            
            # Count confirmed responses
            if response.is_confirmed:
                stats['confirmed_responses'] += 1
            
            # Count special requirements
            if response.has_dietary_restrictions():
                stats['dietary_restrictions_count'] += 1
            
            if response.has_special_requests():
                stats['special_requests_count'] += 1
        
        # Calculate percentages
        if stats['total_responses'] > 0:
            stats['response_rate'] = round(
                (stats['total_responses'] - stats['pending']) / stats['total_responses'] * 100, 1
            )
            stats['attendance_rate'] = round(
                (stats['attending'] + stats['partial']) / stats['total_responses'] * 100, 1
            )
        else:
            stats['response_rate'] = 0
            stats['attendance_rate'] = 0
        
        return stats
    
    def to_dict(self, include_admin: bool = False) -> Dict[str, Any]:
        """
        Serialize invitation response to dictionary.
        
        Args:
            include_admin: Whether to include admin-only fields
            
        Returns:
            Dictionary representation for API responses
            
        WHY: Provides consistent API response format with optional
            admin fields for different access levels.
        """
        data = {
            'id': self.id,
            'invitation_id': self.invitation_id,
            'guest_id': self.guest_id,
            'guest_name': self.guest_name,
            'guest_email': self.guest_email,
            'guest_phone': self.guest_phone,
            'response_status': self.response_status,
            'total_guests': self.total_guests,
            'adults_count': self.adults_count,
            'children_count': self.children_count,
            'dietary_restrictions': self.dietary_restrictions,
            'special_requests': self.special_requests,
            'additional_notes': self.additional_notes,
            'event_responses': self.event_responses,
            'response_method': self.response_method,
            'response_language': self.response_language,
            'preferred_contact_method': self.preferred_contact_method,
            'allow_contact': self.allow_contact,
            'is_confirmed': self.is_confirmed,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Include admin fields if requested
        if include_admin:
            data.update({
                'admin_notes': self.admin_notes,
                'response_ip': self.response_ip,
                'user_agent': self.user_agent,
                'confirmation_token': self.confirmation_token
            })
        
        # Add computed fields
        data['response_summary'] = self.get_response_summary()
        
        return data
    
    def __repr__(self):
        return f'<InvitationResponse {self.invitation_id}:{self.guest_name}:{self.response_status}>'