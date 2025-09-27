"""
Invitation Sections Data Model

This module defines the InvitationSectionsData model for storing section-based
invitation data with analytics and business intelligence capabilities.

WHY: Optimizes queries by grouping variables per section in JSON format while
enabling powerful analytics on user behavior, feature usage, and business metrics.
"""

from extensions import db
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
import json


class InvitationSectionsData(db.Model):
    """
    Stores section-based invitation data with analytics capabilities.

    This model groups all variables of a section into a JSON object for optimal
    query performance while maintaining detailed tracking for business intelligence.
    Enables analytics on user behavior, feature adoption, and plan optimization.

    WHY: Combines the flexibility of JSON storage with the power of relational
    analytics. Each record represents one section (hero, gallery, story, etc.)
    with all its variables, plus business tracking for advanced insights.

    Examples:
        - Hero Section: names, date, location, image URL grouped in JSON
        - Gallery Section: all gallery images and settings in one JSON object
        - Analytics: track which sections/variables drive conversions
    """
    __tablename__ = 'invitation_sections_data'

    id = db.Column(db.Integer, primary_key=True)

    # Business Tracking Fields
    invitation_id = db.Column(
        db.Integer,
        db.ForeignKey('invitations.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
        comment="Parent invitation for data relationship"
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False,
        index=True,
        comment="User for customer analytics and behavior tracking"
    )

    order_id = db.Column(
        db.Integer,
        db.ForeignKey('orders.id'),
        nullable=True,
        comment="Order for revenue analytics and conversion tracking"
    )

    plan_id = db.Column(
        db.Integer,
        db.ForeignKey('plans.id'),
        nullable=False,
        comment="Plan for feature usage analytics by subscription tier"
    )

    # Section Organization
    section_type = db.Column(
        db.String(50),
        nullable=False,
        index=True,
        comment="Section identifier: hero, welcome, gallery, story, etc."
    )

    section_variant = db.Column(
        db.String(20),
        nullable=False,
        comment="Section variant: hero_1, hero_2, gallery_1, etc."
    )

    category = db.Column(
        db.String(50),
        nullable=False,
        default='weddings',
        index=True,
        comment="Template category: weddings, kids, corporate, etc."
    )

    # JSON Data Storage
    variables_json = db.Column(
        db.JSON,
        nullable=False,
        comment="All section variables stored as JSON object for optimal queries"
    )

    # Computed Analytics Field (removed stored parameter for SQLAlchemy compatibility)
    variables_count = db.Column(
        db.Integer,
        db.Computed('(JSON_LENGTH(variables_json))'),
        comment="Auto-calculated count of variables for complexity analysis"
    )

    # Analytics and Metadata
    usage_stats = db.Column(
        db.JSON,
        nullable=True,
        comment="Usage statistics: edit_count, last_edited, feature_flags, etc."
    )

    # Audit Timestamps
    last_modified = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment="Last modification for change tracking"
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        comment="Creation timestamp for analytics"
    )

    # Relationships
    invitation = db.relationship(
        'Invitation',
        backref=db.backref(
            'sections_data',
            lazy='dynamic',
            cascade='all, delete-orphan',
            order_by='InvitationSectionsData.section_type'
        )
    )

    user = db.relationship('User', backref='invitation_sections_usage')
    order = db.relationship('Order', backref='order_sections_data')
    plan = db.relationship('Plan', backref='plan_usage_data')

    # Composite Indexes for Analytics Performance
    __table_args__ = (
        db.Index('idx_user_analytics', 'user_id', 'plan_id', 'category'),
        db.Index('idx_order_analytics', 'order_id', 'section_type'),
        db.Index('idx_section_analytics', 'section_type', 'section_variant', 'category'),
        db.Index('idx_variables_count', 'variables_count', 'section_type'),
        db.Index('idx_business_analytics', 'plan_id', 'category', 'variables_count'),
        db.UniqueConstraint('invitation_id', 'section_type', name='uq_invitation_section'),
    )

    def __init__(self, **kwargs):
        """
        Initialize with validation and defaults.

        WHY: Ensures proper data structure and initializes analytics metadata.
        """
        super().__init__(**kwargs)

        # Initialize usage_stats if not provided
        if not self.usage_stats:
            self.usage_stats = {
                'created_at': datetime.utcnow().isoformat(),
                'edit_count': 0,
                'last_edited': None,
                'source': 'direct_creation'
            }

    def update_variables(self, new_variables: Dict[str, Any], track_changes: bool = True) -> None:
        """
        Update section variables with change tracking.

        Args:
            new_variables: New variables dictionary
            track_changes: Whether to track this change in usage_stats

        WHY: Centralizes variable updates with optional analytics tracking.
        """
        old_count = len(self.variables_json) if self.variables_json else 0
        self.variables_json = new_variables
        new_count = len(new_variables)

        if track_changes and self.usage_stats:
            self.usage_stats['edit_count'] = self.usage_stats.get('edit_count', 0) + 1
            self.usage_stats['last_edited'] = datetime.utcnow().isoformat()
            self.usage_stats['variables_change'] = {
                'old_count': old_count,
                'new_count': new_count,
                'change_delta': new_count - old_count
            }

        self.last_modified = datetime.utcnow()

    def get_variable(self, variable_name: str, default: Any = None) -> Any:
        """
        Get specific variable from JSON data.

        Args:
            variable_name: Name of variable to retrieve
            default: Default value if variable not found

        Returns:
            Variable value or default

        WHY: Provides convenient access to individual variables within JSON.
        """
        if not self.variables_json:
            return default
        return self.variables_json.get(variable_name, default)

    def set_variable(self, variable_name: str, value: Any) -> None:
        """
        Set specific variable in JSON data.

        Args:
            variable_name: Name of variable to set
            value: Value to set

        WHY: Provides convenient way to update individual variables.
        """
        if not self.variables_json:
            self.variables_json = {}

        self.variables_json[variable_name] = value
        self.last_modified = datetime.utcnow()

        # Mark as modified for SQLAlchemy to detect JSON changes
        db.session.merge(self)

    def get_complexity_score(self) -> float:
        """
        Calculate complexity score based on variables count and types.

        Returns:
            Complexity score (0.0 to 1.0)

        WHY: Enables analytics on user engagement and feature adoption.
        """
        if not self.variables_json:
            return 0.0

        base_score = min(len(self.variables_json) / 20.0, 1.0)  # 20 vars = max complexity

        # Bonus for complex data types
        complex_bonus = 0
        for value in self.variables_json.values():
            if isinstance(value, (dict, list)):
                complex_bonus += 0.1

        return min(base_score + complex_bonus, 1.0)

    def get_premium_features_used(self) -> List[str]:
        """
        Identify premium features used in this section.

        Returns:
            List of premium feature identifiers

        WHY: Enables analysis of premium feature adoption and ROI.
        """
        premium_features = []

        if not self.variables_json:
            return premium_features

        # Define premium feature patterns
        premium_patterns = {
            'custom_colors': ['backgroundColor', 'accentColor', 'custom_colors'],
            'video_background': ['videoUrl', 'video_background'],
            'advanced_gallery': ['gallery_images'],
            'custom_fonts': ['fontFamily', 'custom_font'],
            'animations': ['animation_', 'transition_']
        }

        for feature_name, patterns in premium_patterns.items():
            for pattern in patterns:
                if any(pattern in key for key in self.variables_json.keys()):
                    premium_features.append(feature_name)
                    break

        return premium_features

    @classmethod
    def get_section_data(cls, invitation_id: int, section_type: str) -> Optional['InvitationSectionsData']:
        """
        Get section data for specific invitation and section.

        Args:
            invitation_id: ID of invitation
            section_type: Type of section

        Returns:
            Section data or None if not found

        WHY: Efficient lookup for template rendering and editing.
        """
        return cls.query.filter_by(
            invitation_id=invitation_id,
            section_type=section_type
        ).first()

    @classmethod
    def get_all_sections(cls, invitation_id: int) -> List['InvitationSectionsData']:
        """
        Get all sections for an invitation.

        Args:
            invitation_id: ID of invitation

        Returns:
            List of all section data

        WHY: Bulk retrieval for complete invitation rendering.
        """
        return cls.query.filter_by(invitation_id=invitation_id).order_by(cls.section_type).all()

    @classmethod
    def get_usage_analytics(cls, **filters) -> Dict[str, Any]:
        """
        Get usage analytics with optional filtering.

        Args:
            **filters: Optional filters (plan_id, category, section_type, etc.)

        Returns:
            Analytics dictionary with usage statistics

        WHY: Provides business intelligence on feature usage and user behavior.
        """
        query = cls.query

        # Apply filters
        if filters.get('plan_id'):
            query = query.filter_by(plan_id=filters['plan_id'])
        if filters.get('category'):
            query = query.filter_by(category=filters['category'])
        if filters.get('section_type'):
            query = query.filter_by(section_type=filters['section_type'])

        sections = query.all()

        if not sections:
            return {}

        # Calculate analytics
        total_sections = len(sections)
        avg_complexity = sum(s.get_complexity_score() for s in sections) / total_sections
        unique_users = len(set(s.user_id for s in sections))

        section_distribution = {}
        plan_distribution = {}
        premium_features = {}

        for section in sections:
            # Section type distribution
            section_type = f"{section.section_type}_{section.section_variant}"
            section_distribution[section_type] = section_distribution.get(section_type, 0) + 1

            # Plan distribution
            plan_id = section.plan_id
            plan_distribution[plan_id] = plan_distribution.get(plan_id, 0) + 1

            # Premium features
            for feature in section.get_premium_features_used():
                premium_features[feature] = premium_features.get(feature, 0) + 1

        return {
            'total_sections': total_sections,
            'unique_users': unique_users,
            'average_complexity': round(avg_complexity, 3),
            'section_distribution': section_distribution,
            'plan_distribution': plan_distribution,
            'premium_features_usage': premium_features,
            'top_sections': sorted(section_distribution.items(), key=lambda x: x[1], reverse=True)[:5]
        }

    @classmethod
    def bulk_upsert_sections(cls, invitation_id: int, sections_data: Dict[str, Dict]) -> List['InvitationSectionsData']:
        """
        Bulk create or update multiple sections for an invitation.

        Args:
            invitation_id: ID of invitation
            sections_data: Dict mapping section_type to variables dict

        Returns:
            List of created/updated section records

        WHY: Optimizes database operations for template editor saves.
        """
        # Get invitation details for business tracking
        from models.invitation import Invitation
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            raise ValueError(f"Invitation {invitation_id} not found")

        results = []

        for section_type, variables in sections_data.items():
            # Determine section variant from variables or default to _1
            section_variant = f"{section_type}_1"  # Default variant

            existing = cls.query.filter_by(
                invitation_id=invitation_id,
                section_type=section_type
            ).first()

            if existing:
                # Update existing
                existing.update_variables(variables, track_changes=True)
                results.append(existing)
            else:
                # Create new
                new_section = cls(
                    invitation_id=invitation_id,
                    user_id=invitation.user_id,
                    order_id=invitation.order_id,
                    plan_id=invitation.plan_id,
                    section_type=section_type,
                    section_variant=section_variant,
                    category='weddings',  # Default, could be determined from template
                    variables_json=variables
                )
                db.session.add(new_section)
                results.append(new_section)

        db.session.commit()
        return results

    def to_dict(self, include_analytics: bool = False) -> Dict[str, Any]:
        """
        Serialize to dictionary.

        Args:
            include_analytics: Whether to include analytics data

        Returns:
            Dictionary representation

        WHY: Provides consistent API response format.
        """
        data = {
            'id': self.id,
            'invitation_id': self.invitation_id,
            'section_type': self.section_type,
            'section_variant': self.section_variant,
            'category': self.category,
            'variables': self.variables_json,
            'variables_count': self.variables_count,
            'last_modified': self.last_modified.isoformat() if self.last_modified else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_analytics:
            data.update({
                'user_id': self.user_id,
                'plan_id': self.plan_id,
                'order_id': self.order_id,
                'usage_stats': self.usage_stats,
                'complexity_score': self.get_complexity_score(),
                'premium_features': self.get_premium_features_used()
            })

        return data

    def __repr__(self):
        return f'<InvitationSectionsData {self.invitation_id}:{self.section_type}({self.variables_count} vars)>'