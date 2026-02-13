"""Data models for sports cards."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any
import json
from decimal import Decimal


@dataclass
class MarketValue:
    """Represents a market value entry for a card."""
    value: Decimal
    date: datetime
    source: str = "manual"
    condition: str = "NM"  # Near Mint default
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "value": float(self.value),
            "date": self.date.isoformat(),
            "source": self.source,
            "condition": self.condition
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MarketValue':
        """Create from dictionary."""
        return cls(
            value=Decimal(str(data["value"])),
            date=datetime.fromisoformat(data["date"]),
            source=data.get("source", "manual"),
            condition=data.get("condition", "NM")
        )


@dataclass
class SportsCard:
    """Represents a sports card in the collection."""
    id: str
    name: str
    sport: str
    year: int
    brand: str
    card_number: str
    player: str
    team: str = ""
    condition: str = "NM"
    market_values: List[MarketValue] = field(default_factory=list)
    notes: str = ""
    tags: List[str] = field(default_factory=list)
    created_date: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        """Ensure ID is set if not provided."""
        if not self.id:
            # Generate ID from card details
            self.id = f"{self.year}_{self.brand}_{self.card_number}_{self.player}".replace(" ", "_").lower()
    
    @property
    def current_value(self) -> Optional[Decimal]:
        """Get the most recent market value."""
        if not self.market_values:
            return None
        return max(self.market_values, key=lambda x: x.date).value
    
    @property
    def value_history(self) -> List[MarketValue]:
        """Get market values sorted by date."""
        return sorted(self.market_values, key=lambda x: x.date)
    
    def add_market_value(self, value: Decimal, source: str = "manual", condition: str = None):
        """Add a new market value entry."""
        market_value = MarketValue(
            value=value,
            date=datetime.now(),
            source=source,
            condition=condition or self.condition
        )
        self.market_values.append(market_value)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "sport": self.sport,
            "year": self.year,
            "brand": self.brand,
            "card_number": self.card_number,
            "player": self.player,
            "team": self.team,
            "condition": self.condition,
            "market_values": [mv.to_dict() for mv in self.market_values],
            "notes": self.notes,
            "tags": self.tags,
            "created_date": self.created_date.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SportsCard':
        """Create from dictionary."""
        market_values = [MarketValue.from_dict(mv) for mv in data.get("market_values", [])]
        
        return cls(
            id=data["id"],
            name=data["name"],
            sport=data["sport"],
            year=data["year"],
            brand=data["brand"],
            card_number=data["card_number"],
            player=data["player"],
            team=data.get("team", ""),
            condition=data.get("condition", "NM"),
            market_values=market_values,
            notes=data.get("notes", ""),
            tags=data.get("tags", []),
            created_date=datetime.fromisoformat(data.get("created_date", datetime.now().isoformat()))
        )