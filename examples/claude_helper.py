#!/usr/bin/env python3
"""
Claude Integration Helper for Sports Card Tracker

This script provides formatted output that's perfect for sharing with Claude AI
for analysis, investment advice, and collection management.
"""

import subprocess
import json
import sys
from datetime import datetime
from pathlib import Path


def run_card_tracker_command(cmd):
    """Run a card-tracker command and return the output."""
    try:
        result = subprocess.run(f"card-tracker {cmd}", shell=True, capture_output=True, text=True)
        return result.stdout if result.returncode == 0 else None
    except Exception:
        return None


def get_collection_summary():
    """Get a comprehensive collection summary for Claude."""
    print("=== SPORTS CARD COLLECTION SUMMARY ===")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Get statistics
    stats = run_card_tracker_command("stats")
    if stats:
        print("COLLECTION STATISTICS:")
        print(stats)
    
    # Get all cards
    cards = run_card_tracker_command("list")
    if cards:
        print("ALL CARDS:")
        print(cards)


def get_high_value_cards(min_value=1000):
    """Get cards above a certain value threshold."""
    print(f"=== HIGH-VALUE CARDS (>${min_value}+) ===")
    
    # This is a simplified approach - in a real implementation,
    # you'd parse the JSON data and filter by value
    cards = run_card_tracker_command("list")
    if cards:
        lines = cards.split('\n')
        print("Cards in collection (manual filtering needed for value):")
        print(cards)


def get_rookie_cards():
    """Get all rookie cards for investment analysis."""
    print("=== ROOKIE CARDS (Investment Focus) ===")
    
    rookie_cards = run_card_tracker_command("search rookie")
    if rookie_cards:
        print(rookie_cards)


def get_sport_breakdown():
    """Get breakdown by sport."""
    print("=== BREAKDOWN BY SPORT ===")
    
    sports = ['baseball', 'basketball', 'football', 'hockey']
    
    for sport in sports:
        result = run_card_tracker_command(f"list --sport {sport}")
        if result and "No cards found" not in result:
            print(f"\n{sport.upper()} CARDS:")
            print(result)


def get_recent_additions(days=30):
    """Get recently added cards."""
    print(f"=== RECENT ADDITIONS (Last {days} days) ===")
    print("Note: This feature would require date filtering in the CLI")
    
    # For now, just show all cards - in a real implementation,
    # we'd filter by creation date
    cards = run_card_tracker_command("list")
    if cards:
        print("All cards (date filtering not yet implemented):")
        print(cards)


def export_for_claude_analysis():
    """Generate a comprehensive report for Claude analysis."""
    print("SPORTS CARD COLLECTION - CLAUDE ANALYSIS EXPORT")
    print("=" * 60)
    
    get_collection_summary()
    print("\n" + "=" * 60 + "\n")
    
    get_rookie_cards()
    print("\n" + "=" * 60 + "\n")
    
    get_sport_breakdown()
    print("\n" + "=" * 60 + "\n")
    
    print("ANALYSIS QUESTIONS FOR CLAUDE:")
    print("1. What is the overall health of my collection?")
    print("2. Which cards have the best investment potential?")
    print("3. Are there any cards I should consider selling?")
    print("4. What sports/categories am I missing?")
    print("5. How does my collection compare to market trends?")
    print("6. Should I grade any ungraded cards?")
    print("7. What's my average ROI by sport/year/player?")


def main():
    """Main function with command-line interface."""
    if len(sys.argv) < 2:
        print("Claude Integration Helper for Sports Card Tracker")
        print("\nUsage: python claude_helper.py <command>")
        print("\nCommands:")
        print("  summary        - Get collection summary")
        print("  high-value     - Show high-value cards")
        print("  rookies        - Show rookie cards")
        print("  by-sport       - Breakdown by sport")
        print("  recent         - Show recent additions")
        print("  full-analysis  - Complete export for Claude")
        print("\nExample: python claude_helper.py full-analysis")
        return
    
    command = sys.argv[1].lower()
    
    if command == "summary":
        get_collection_summary()
    elif command == "high-value":
        get_high_value_cards()
    elif command == "rookies":
        get_rookie_cards()
    elif command == "by-sport":
        get_sport_breakdown()
    elif command == "recent":
        get_recent_additions()
    elif command == "full-analysis":
        export_for_claude_analysis()
    else:
        print(f"Unknown command: {command}")
        print("Use 'python claude_helper.py' for help")


if __name__ == "__main__":
    main()