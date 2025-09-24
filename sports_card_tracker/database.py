"""Data storage and management for sports cards."""

import json
import os
from typing import List, Optional, Dict, Any
from pathlib import Path
from .models import SportsCard
import shutil
from datetime import datetime


class CardDatabase:
    """Manages storage and retrieval of sports cards."""
    
    def __init__(self, data_dir: str = None):
        """Initialize the database."""
        if data_dir is None:
            # Use user's home directory
            data_dir = os.path.join(Path.home(), ".sports_card_tracker")
        
        self.data_dir = Path(data_dir)
        self.data_file = self.data_dir / "cards.json"
        self.backup_dir = self.data_dir / "backups"
        
        # Create directories if they don't exist
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize empty database if it doesn't exist
        if not self.data_file.exists():
            self._save_data([])
    
    def _load_data(self) -> List[Dict[str, Any]]:
        """Load raw data from JSON file."""
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _save_data(self, data: List[Dict[str, Any]]):
        """Save raw data to JSON file."""
        # Create backup before saving
        if self.data_file.exists():
            backup_name = f"cards_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            backup_path = self.backup_dir / backup_name
            shutil.copy2(self.data_file, backup_path)
            
            # Keep only last 10 backups
            backups = sorted(self.backup_dir.glob("cards_backup_*.json"))
            if len(backups) > 10:
                for old_backup in backups[:-10]:
                    old_backup.unlink()
        
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def load_cards(self) -> List[SportsCard]:
        """Load all sports cards from storage."""
        data = self._load_data()
        return [SportsCard.from_dict(card_data) for card_data in data]
    
    def save_cards(self, cards: List[SportsCard]):
        """Save all sports cards to storage."""
        data = [card.to_dict() for card in cards]
        self._save_data(data)
    
    def add_card(self, card: SportsCard) -> bool:
        """Add a new card to the database."""
        cards = self.load_cards()
        
        # Check if card already exists
        if any(c.id == card.id for c in cards):
            return False
        
        cards.append(card)
        self.save_cards(cards)
        return True
    
    def update_card(self, card: SportsCard) -> bool:
        """Update an existing card in the database."""
        cards = self.load_cards()
        
        for i, existing_card in enumerate(cards):
            if existing_card.id == card.id:
                cards[i] = card
                self.save_cards(cards)
                return True
        
        return False
    
    def delete_card(self, card_id: str) -> bool:
        """Delete a card from the database."""
        cards = self.load_cards()
        original_count = len(cards)
        
        cards = [card for card in cards if card.id != card_id]
        
        if len(cards) < original_count:
            self.save_cards(cards)
            return True
        
        return False
    
    def get_card(self, card_id: str) -> Optional[SportsCard]:
        """Get a specific card by ID."""
        cards = self.load_cards()
        for card in cards:
            if card.id == card_id:
                return card
        return None
    
    def search_cards(self, 
                    player: str = None,
                    sport: str = None,
                    year: int = None,
                    brand: str = None,
                    team: str = None,
                    tags: List[str] = None) -> List[SportsCard]:
        """Search for cards based on criteria."""
        cards = self.load_cards()
        results = []
        
        for card in cards:
            match = True
            
            if player and player.lower() not in card.player.lower():
                match = False
            
            if sport and sport.lower() != card.sport.lower():
                match = False
            
            if year and year != card.year:
                match = False
            
            if brand and brand.lower() not in card.brand.lower():
                match = False
            
            if team and team.lower() not in card.team.lower():
                match = False
            
            if tags:
                card_tags = [tag.lower() for tag in card.tags]
                if not any(tag.lower() in card_tags for tag in tags):
                    match = False
            
            if match:
                results.append(card)
        
        return results
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get collection statistics."""
        cards = self.load_cards()
        
        if not cards:
            return {
                "total_cards": 0,
                "total_value": 0,
                "sports": {},
                "brands": {},
                "years": {},
            }
        
        stats = {
            "total_cards": len(cards),
            "total_value": sum(card.current_value or 0 for card in cards),
            "sports": {},
            "brands": {},
            "years": {},
        }
        
        for card in cards:
            # Count by sport
            stats["sports"][card.sport] = stats["sports"].get(card.sport, 0) + 1
            
            # Count by brand
            stats["brands"][card.brand] = stats["brands"].get(card.brand, 0) + 1
            
            # Count by year
            stats["years"][card.year] = stats["years"].get(card.year, 0) + 1
        
        return stats