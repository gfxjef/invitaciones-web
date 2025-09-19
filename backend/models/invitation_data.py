"""
Invitation Data Model

This module defines the InvitationData model for storing dynamic, editable fields
of invitation templates. Enables flexible customization of invitation content
without rigid schema constraints.

WHY: Traditional static fields in invitation table don't support dynamic template
customization. This EAV (Entity-Attribute-Value) pattern allows unlimited
field types while maintaining data integrity and query performance.
"""

from extensions import db
from datetime import datetime
import json
from typing import Dict, Any, Optional, Union


class InvitationData(db.Model):
    """
    Stores dynamic, editable field data for invitations using EAV pattern.
    
    This model enables flexible template customization by storing key-value pairs
    for any invitation field. Supports multiple data types including text, dates,
    colors, and complex JSON objects.
    
    WHY: Allows unlimited customization fields without database schema changes.
    Each invitation can have different fields based on template requirements.
    Performance is maintained through strategic indexing on invitation_id + field_name.
    
    Examples:
        - couple_groom_name: "Juan Carlos"
        - event_ceremony_date: "2024-06-15T16:00:00"
        - colors_primary: "#FF6B6B"
        - gallery_photos: ["photo1.jpg", "photo2.jpg"] (stored as JSON)
    """
    __tablename__ = 'invitation_data'
    
    id = db.Column(db.Integer, primary_key=True)
    invitation_id = db.Column(
        db.Integer, 
        db.ForeignKey('invitations.id', ondelete='CASCADE'), 
        nullable=False,
        index=True  # WHY: Primary query pattern is by invitation_id
    )
    
    # Field categorization for better organization and querying
    field_category = db.Column(
        db.String(50), 
        nullable=True, 
        index=True,
        comment="Category grouping: couple, event, gallery, colors, etc."
    )
    
    # Unique field identifier within the invitation
    field_name = db.Column(
        db.String(100), 
        nullable=False,
        index=True,
        comment="Unique field identifier like 'couple_groom_name', 'event_date'"
    )
    
    # Flexible value storage supporting multiple data types
    field_value = db.Column(
        db.Text,
        nullable=True,
        comment="Field value - can be text, JSON for complex data, or null"
    )
    
    # Data type hint for proper value interpretation and validation
    field_type = db.Column(
        db.String(50),
        nullable=False,
        default='text',
        comment="Data type: text, date, datetime, number, boolean, json, color, file"
    )
    
    # Metadata for UI rendering and validation
    field_metadata = db.Column(
        db.JSON,
        nullable=True,
        comment="Additional metadata: validation rules, UI hints, constraints"
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
            'custom_data',
            lazy='dynamic',
            cascade='all, delete-orphan',
            order_by='InvitationData.field_category, InvitationData.field_name'
        )
    )
    
    # Composite indexes for performance
    __table_args__ = (
        db.Index('idx_invitation_field', 'invitation_id', 'field_category', 'field_name'),
        db.Index('idx_invitation_category', 'invitation_id', 'field_category'),
        db.UniqueConstraint('invitation_id', 'field_name', name='uq_invitation_field'),
    )
    
    def __init__(self, **kwargs):
        """
        Initialize InvitationData with automatic field categorization.
        
        WHY: Auto-categorization from field_name reduces manual errors and 
        ensures consistent data organization across the application.
        """
        super().__init__(**kwargs)
        
        # Auto-categorize based on field name prefix if not provided
        if not self.field_category and self.field_name:
            self.field_category = self._extract_category_from_name(self.field_name)
    
    def _extract_category_from_name(self, field_name: str) -> str:
        """
        Extract category from field name using naming convention.
        
        WHY: Standardized naming convention 'category_field_name' enables
        automatic categorization and better data organization.
        """
        parts = field_name.split('_')
        return parts[0] if parts else 'general'
    
    def set_typed_value(self, value: Any) -> None:
        """
        Set field value with automatic type detection and JSON serialization.
        
        Args:
            value: The value to store (any Python type)
            
        WHY: Centralizes value serialization logic and ensures consistent
        data storage regardless of input type. Handles complex objects
        by serializing to JSON automatically.
        """
        if value is None:
            self.field_value = None
            return
            
        # Determine type and serialize appropriately
        if isinstance(value, (dict, list)):
            self.field_type = 'json'
            self.field_value = json.dumps(value, default=str, ensure_ascii=False)
        elif isinstance(value, bool):
            self.field_type = 'boolean'
            self.field_value = str(value).lower()
        elif isinstance(value, (int, float)):
            self.field_type = 'number'
            self.field_value = str(value)
        elif isinstance(value, datetime):
            self.field_type = 'datetime'
            self.field_value = value.isoformat()
        else:
            # Default to text for strings and other types
            if not self.field_type or self.field_type == 'text':
                self.field_type = 'text'
            self.field_value = str(value)
    
    def get_typed_value(self) -> Any:
        """
        Retrieve field value with proper type conversion.
        
        Returns:
            The field value converted to its proper Python type
            
        WHY: Ensures data retrieved from database is properly typed
        for application logic. Handles JSON deserialization and
        type casting based on stored field_type.
        """
        if self.field_value is None:
            return None
            
        try:
            if self.field_type == 'json':
                return json.loads(self.field_value)
            elif self.field_type == 'boolean':
                return self.field_value.lower() in ('true', '1', 'yes')
            elif self.field_type == 'number':
                # Try int first, then float
                try:
                    return int(self.field_value)
                except ValueError:
                    return float(self.field_value)
            elif self.field_type in ('date', 'datetime'):
                # Return as string for now, can be enhanced with datetime parsing
                return self.field_value
            else:
                return self.field_value
        except (json.JSONDecodeError, ValueError, TypeError):
            # WHY: Graceful degradation - return raw string if type conversion fails
            return self.field_value
    
    def update_field(self, value: Any, metadata: Optional[Dict] = None) -> None:
        """
        Update field value and metadata atomically.
        
        Args:
            value: New field value
            metadata: Optional metadata update
            
        WHY: Ensures atomic updates with timestamp tracking and metadata sync.
        Prevents partial updates that could lead to inconsistent state.
        """
        self.set_typed_value(value)
        if metadata is not None:
            self.field_metadata = metadata
        self.updated_at = datetime.utcnow()
    
    @classmethod
    def get_invitation_data_dict(cls, invitation_id: int) -> Dict[str, Any]:
        """
        Retrieve all invitation data as a dictionary organized by category.
        
        Args:
            invitation_id: ID of the invitation
            
        Returns:
            Dictionary organized by category with typed values
            
        WHY: Provides efficient bulk data retrieval for template rendering.
        Organizes data by category for easier template consumption and
        reduces database queries for full invitation data.
        """
        data_rows = cls.query.filter_by(invitation_id=invitation_id).all()
        
        result = {}
        for row in data_rows:
            category = row.field_category or 'general'
            if category not in result:
                result[category] = {}
            
            result[category][row.field_name] = {
                'value': row.get_typed_value(),
                'type': row.field_type,
                'metadata': row.field_metadata,
                'updated_at': row.updated_at.isoformat() if row.updated_at else None
            }
        
        return result
    
    @classmethod
    def bulk_upsert_data(cls, invitation_id: int, data_dict: Dict[str, Any]) -> None:
        """
        Bulk insert or update multiple fields for an invitation.
        
        Args:
            invitation_id: ID of the invitation
            data_dict: Dictionary of field_name -> value mappings
            
        WHY: Optimizes database operations for template editor saves.
        Single transaction for multiple field updates ensures data consistency
        and improves performance over individual field updates.
        """
        # Get existing fields for this invitation
        existing_fields = {
            field.field_name: field 
            for field in cls.query.filter_by(invitation_id=invitation_id).all()
        }
        
        for field_name, value in data_dict.items():
            if field_name in existing_fields:
                # Update existing field
                existing_fields[field_name].set_typed_value(value)
                existing_fields[field_name].updated_at = datetime.utcnow()
            else:
                # Create new field
                new_field = cls(
                    invitation_id=invitation_id,
                    field_name=field_name
                )
                new_field.set_typed_value(value)
                db.session.add(new_field)
        
        db.session.commit()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Serialize invitation data field to dictionary.
        
        Returns:
            Dictionary representation with typed value and metadata
            
        WHY: Provides consistent API response format for invitation data.
        Includes both raw and typed values for flexibility in frontend consumption.
        """
        return {
            'id': self.id,
            'invitation_id': self.invitation_id,
            'field_category': self.field_category,
            'field_name': self.field_name,
            'field_value': self.field_value,  # Raw string value
            'typed_value': self.get_typed_value(),  # Properly typed value
            'field_type': self.field_type,
            'field_metadata': self.field_metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<InvitationData {self.invitation_id}:{self.field_name}={self.field_value[:50]}>'