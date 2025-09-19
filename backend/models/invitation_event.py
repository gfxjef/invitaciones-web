"""
Invitation Event Model

This module defines the InvitationEvent model for managing wedding itinerary
events such as ceremony, reception, cocktail hour, and other celebration events.

WHY: Wedding invitations typically include multiple events with different
locations, times, and details. This model enables flexible event management
with proper geolocation support and rich event descriptions.
"""

from extensions import db
from datetime import datetime, date
from typing import Dict, Any, List, Optional, Tuple
import json


class EventIcon:
    """
    Enumeration of available event icons for better UX.
    
    WHY: Standardizes event iconography across templates and provides
    visual consistency for different event types.
    """
    CHURCH = 'church'
    RINGS = 'rings'
    PARTY = 'party'
    DINNER = 'dinner'
    COCKTAIL = 'cocktail'
    DANCE = 'dance'
    CAKE = 'cake'
    FLOWERS = 'flowers'
    CAR = 'car'
    PHOTO = 'photo'
    MUSIC = 'music'
    HEART = 'heart'
    LOCATION = 'location'
    TIME = 'time'
    
    @classmethod
    def get_all(cls) -> List[str]:
        """Get all available event icons."""
        return [
            cls.CHURCH, cls.RINGS, cls.PARTY, cls.DINNER, cls.COCKTAIL,
            cls.DANCE, cls.CAKE, cls.FLOWERS, cls.CAR, cls.PHOTO,
            cls.MUSIC, cls.HEART, cls.LOCATION, cls.TIME
        ]


class InvitationEvent(db.Model):
    """
    Manages individual events within a wedding invitation itinerary.
    
    This model stores detailed information about each event in the wedding
    celebration including timing, location, description, and geographic data
    for map integration.
    
    WHY: Modern wedding invitations require detailed itineraries with multiple
    events. This model enables rich event management with geolocation support,
    proper ordering, and flexible event descriptions for better guest experience.
    
    Examples:
        - Religious Ceremony: Church location with exact address and timing
        - Civil Ceremony: City hall or venue with different timing
        - Cocktail Hour: Pre-reception event with specific duration
        - Reception/Party: Main celebration venue with detailed info
        - After Party: Optional late-night venue for continued celebration
    """
    __tablename__ = 'invitation_events'
    
    id = db.Column(db.Integer, primary_key=True)
    invitation_id = db.Column(
        db.Integer,
        db.ForeignKey('invitations.id', ondelete='CASCADE'),
        nullable=False,
        index=True  # WHY: Primary query pattern is by invitation_id
    )
    
    # Event identification and description
    event_name = db.Column(
        db.String(200),
        nullable=False,
        comment="Name of the event: 'Ceremonia Religiosa', 'Recepción', etc."
    )
    
    event_description = db.Column(
        db.Text,
        nullable=True,
        comment="Detailed description of the event for guests"
    )
    
    # Event timing
    event_datetime = db.Column(
        db.DateTime,
        nullable=False,
        index=True,  # WHY: Events are often queried by date/time
        comment="Full date and time when event starts"
    )
    
    event_end_datetime = db.Column(
        db.DateTime,
        nullable=True,
        comment="Optional end time for events with specific duration"
    )
    
    # Location information
    event_venue = db.Column(
        db.String(200),
        nullable=True,
        comment="Venue name: 'Iglesia San José', 'Salón Los Jardines', etc."
    )
    
    event_address = db.Column(
        db.Text,
        nullable=True,
        comment="Full address for GPS navigation and guest directions"
    )
    
    # Geographic coordinates for map integration
    event_lat = db.Column(
        db.Numeric(precision=10, scale=8),
        nullable=True,
        comment="Latitude for map display and navigation (-90 to 90)"
    )
    
    event_lng = db.Column(
        db.Numeric(precision=11, scale=8),
        nullable=True,
        comment="Longitude for map display and navigation (-180 to 180)"
    )
    
    # Visual and organizational elements
    event_icon = db.Column(
        db.String(50),
        nullable=True,
        default=EventIcon.HEART,
        comment="Icon identifier for visual representation in templates"
    )
    
    event_order = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        comment="Display order in itinerary (0 = first event)"
    )
    
    # Event-specific configuration
    event_metadata = db.Column(
        db.JSON,
        nullable=True,
        comment="Additional event data: dress code, parking info, special instructions"
    )
    
    # Display and visibility options
    is_visible = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
        comment="Whether this event should be displayed to guests"
    )
    
    requires_rsvp = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        comment="Whether guests need to confirm attendance for this specific event"
    )
    
    # Audit timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    # Relationships
    invitation = db.relationship(
        'Invitation',
        backref=db.backref(
            'events',
            lazy='dynamic',
            cascade='all, delete-orphan',
            order_by='InvitationEvent.event_order, InvitationEvent.event_datetime'
        )
    )
    
    # Composite indexes for performance
    __table_args__ = (
        db.Index('idx_invitation_event_order', 'invitation_id', 'event_order'),
        db.Index('idx_invitation_event_datetime', 'invitation_id', 'event_datetime'),
        db.Index('idx_event_location', 'event_lat', 'event_lng'),  # For geo queries
    )
    
    def __init__(self, **kwargs):
        """
        Initialize InvitationEvent with validation and auto-ordering.
        
        WHY: Ensures proper initialization with automatic event ordering
        and validation of geographic coordinates.
        """
        super().__init__(**kwargs)
        
        # Auto-assign event order if not provided
        if self.event_order == 0 and self.invitation_id:
            self.event_order = self._get_next_order()
    
    def _get_next_order(self) -> int:
        """
        Get the next available event order number.
        
        WHY: Ensures proper sequential ordering of events when
        order is not explicitly specified.
        """
        max_order = db.session.query(
            db.func.max(InvitationEvent.event_order)
        ).filter_by(invitation_id=self.invitation_id).scalar()
        
        return (max_order or 0) + 1
    
    def set_coordinates(self, lat: float, lng: float) -> None:
        """
        Set geographic coordinates with validation.
        
        Args:
            lat: Latitude (-90 to 90)
            lng: Longitude (-180 to 180)
            
        WHY: Validates coordinate ranges to prevent invalid geographic data
        that could break map integrations.
        """
        if not (-90 <= lat <= 90):
            raise ValueError(f"Invalid latitude: {lat}. Must be between -90 and 90.")
        if not (-180 <= lng <= 180):
            raise ValueError(f"Invalid longitude: {lng}. Must be between -180 and 180.")
        
        self.event_lat = lat
        self.event_lng = lng
    
    def get_coordinates(self) -> Optional[Tuple[float, float]]:
        """
        Get coordinates as a tuple.
        
        Returns:
            Tuple of (latitude, longitude) or None if not set
            
        WHY: Provides convenient access to coordinates for map integrations
        and geolocation services.
        """
        if self.event_lat is not None and self.event_lng is not None:
            return (float(self.event_lat), float(self.event_lng))
        return None
    
    def has_location(self) -> bool:
        """Check if event has location information."""
        return bool(self.event_venue or self.event_address or self.get_coordinates())
    
    def get_duration_minutes(self) -> Optional[int]:
        """
        Calculate event duration in minutes.
        
        Returns:
            Duration in minutes or None if end time not set
            
        WHY: Enables duration display and scheduling calculations
        for event planning and guest information.
        """
        if self.event_end_datetime and self.event_datetime:
            delta = self.event_end_datetime - self.event_datetime
            return int(delta.total_seconds() / 60)
        return None
    
    def is_same_day(self, other_event: 'InvitationEvent') -> bool:
        """
        Check if this event is on the same day as another event.
        
        Args:
            other_event: Another InvitationEvent to compare
            
        Returns:
            True if events are on the same date
            
        WHY: Enables proper event grouping by date in itinerary displays
        and timeline views.
        """
        return self.event_datetime.date() == other_event.event_datetime.date()
    
    def get_time_until_event(self) -> Optional[int]:
        """
        Get minutes until event starts.
        
        Returns:
            Minutes until event or None if event has passed
            
        WHY: Enables countdown displays and real-time event status
        for guest interfaces.
        """
        if self.event_datetime > datetime.utcnow():
            delta = self.event_datetime - datetime.utcnow()
            return int(delta.total_seconds() / 60)
        return None
    
    def get_google_maps_url(self) -> Optional[str]:
        """
        Generate Google Maps URL for navigation.
        
        Returns:
            Google Maps URL or None if no location data
            
        WHY: Provides direct navigation links for guests using
        the most common mapping service.
        """
        coords = self.get_coordinates()
        if coords:
            lat, lng = coords
            return f"https://maps.google.com/maps?q={lat},{lng}"
        elif self.event_address:
            # URL encode the address
            import urllib.parse
            encoded_address = urllib.parse.quote(self.event_address)
            return f"https://maps.google.com/maps?q={encoded_address}"
        return None
    
    def get_waze_url(self) -> Optional[str]:
        """
        Generate Waze URL for navigation.
        
        Returns:
            Waze URL or None if no location data
            
        WHY: Provides alternative navigation option popular in Latin America
        for better traffic-aware routing.
        """
        coords = self.get_coordinates()
        if coords:
            lat, lng = coords
            return f"https://waze.com/ul?ll={lat},{lng}&navigate=yes"
        return None
    
    def update_metadata(self, key: str, value: Any) -> None:
        """
        Update specific metadata field.
        
        Args:
            key: Metadata key to update
            value: New value for the key
            
        WHY: Provides convenient method for updating event metadata
        without replacing the entire JSON object.
        """
        if self.event_metadata is None:
            self.event_metadata = {}
        
        self.event_metadata[key] = value
        self.updated_at = datetime.utcnow()
        # WHY: Explicitly mark as modified for SQLAlchemy to detect JSON changes
        db.session.merge(self)
    
    @classmethod
    def get_events_by_date(cls, invitation_id: int) -> Dict[str, List['InvitationEvent']]:
        """
        Get events grouped by date.
        
        Args:
            invitation_id: ID of the invitation
            
        Returns:
            Dictionary with date strings as keys and event lists as values
            
        WHY: Enables organized display of multi-day wedding celebrations
        with proper date grouping for better UX.
        """
        events = cls.query.filter_by(
            invitation_id=invitation_id,
            is_visible=True
        ).order_by(cls.event_datetime).all()
        
        grouped = {}
        for event in events:
            date_str = event.event_datetime.strftime('%Y-%m-%d')
            if date_str not in grouped:
                grouped[date_str] = []
            grouped[date_str].append(event)
        
        return grouped
    
    @classmethod
    def get_next_event(cls, invitation_id: int) -> Optional['InvitationEvent']:
        """
        Get the next upcoming event for an invitation.
        
        Args:
            invitation_id: ID of the invitation
            
        Returns:
            Next event or None if no upcoming events
            
        WHY: Enables highlighting of next event in invitation displays
        and countdown functionality.
        """
        return cls.query.filter(
            cls.invitation_id == invitation_id,
            cls.is_visible == True,
            cls.event_datetime > datetime.utcnow()
        ).order_by(cls.event_datetime).first()
    
    @classmethod
    def reorder_events(cls, invitation_id: int, event_ids: List[int]) -> None:
        """
        Reorder events for an invitation.
        
        Args:
            invitation_id: ID of the invitation
            event_ids: List of event IDs in desired order
            
        WHY: Enables drag-and-drop reordering in admin interface
        for custom event sequencing beyond chronological order.
        """
        for index, event_id in enumerate(event_ids):
            event = cls.query.filter_by(
                id=event_id,
                invitation_id=invitation_id
            ).first()
            
            if event:
                event.event_order = index
                event.updated_at = datetime.utcnow()
        
        db.session.commit()
    
    def to_dict(self, include_navigation: bool = True) -> Dict[str, Any]:
        """
        Serialize invitation event to dictionary.
        
        Args:
            include_navigation: Whether to include navigation URLs
            
        Returns:
            Dictionary representation with event details and metadata
            
        WHY: Provides consistent API response format with optional
        navigation links for different display contexts.
        """
        data = {
            'id': self.id,
            'invitation_id': self.invitation_id,
            'event_name': self.event_name,
            'event_description': self.event_description,
            'event_datetime': self.event_datetime.isoformat() if self.event_datetime else None,
            'event_end_datetime': self.event_end_datetime.isoformat() if self.event_end_datetime else None,
            'event_venue': self.event_venue,
            'event_address': self.event_address,
            'event_lat': float(self.event_lat) if self.event_lat else None,
            'event_lng': float(self.event_lng) if self.event_lng else None,
            'event_icon': self.event_icon,
            'event_order': self.event_order,
            'event_metadata': self.event_metadata,
            'is_visible': self.is_visible,
            'requires_rsvp': self.requires_rsvp,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Add computed fields
        data['has_location'] = self.has_location()
        data['duration_minutes'] = self.get_duration_minutes()
        data['time_until_event'] = self.get_time_until_event()
        
        if include_navigation and self.has_location():
            data['navigation'] = {
                'google_maps': self.get_google_maps_url(),
                'waze': self.get_waze_url()
            }
        
        return data
    
    def __repr__(self):
        return f'<InvitationEvent {self.invitation_id}:{self.event_name} @ {self.event_datetime}>'